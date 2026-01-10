# Schemat bazy danych PostgreSQL - 10x-cards

## 1. Tabele

### 1.1 public.profiles

Tabela profilu użytkownika powiązana 1:1 z `auth.users` (Supabase Auth), zawierająca również dane limitu generacji AI.
Tabela `auth.users` jest w pełni zarządzana przez Supabase.

| Kolumna             | Typ         | Ograniczenia                                                                     | Opis                                        |
| ------------------- | ----------- | -------------------------------------------------------------------------------- | ------------------------------------------- |
| id                  | uuid        | PRIMARY KEY, REFERENCES auth.users(id) ON DELETE CASCADE                         | Identyfikator użytkownika (= auth.users.id) |
| created_at          | timestamptz | NOT NULL DEFAULT now()                                                           | Data utworzenia profilu                     |
| ai_generation_date  | date        | NULL                                                                             | Data ostatniej generacji (Europe/Warsaw)    |
| ai_generation_count | integer     | NOT NULL DEFAULT 0 CHECK (ai_generation_count >= 0 AND ai_generation_count <= 5) | Liczba generacji w danym dniu               |

**Logika limitu generacji:**

- Przy próbie generacji sprawdzamy czy `ai_generation_date` == dzisiaj (Europe/Warsaw)
- Jeśli tak i `ai_generation_count` < 5 → inkrementujemy count
- Jeśli data inna lub NULL → resetujemy: date = dzisiaj, count = 1

### 1.2 public.decks

Talia fiszek należąca do użytkownika.

| Kolumna      | Typ         | Ograniczenia                                                         | Opis                         |
| ------------ | ----------- | -------------------------------------------------------------------- | ---------------------------- |
| id           | uuid        | PRIMARY KEY DEFAULT gen_random_uuid()                                | Identyfikator tali           |
| owner_id     | uuid        | NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE                 | Właściciel tali              |
| name         | text        | NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100) | Nazwa tali (1-100 znaków)    |
| created_at   | timestamptz | NOT NULL DEFAULT now()                                               | Data utworzenia              |
| last_used_at | timestamptz | NOT NULL DEFAULT now()                                               | Ostatnie użycie (sortowanie) |

### 1.3 public.card_status (ENUM)

```sql
CREATE TYPE public.card_status AS ENUM ('unverified', 'accepted');
```

### 1.4 public.cards

Fiszka z przodu/tyłem oraz parametrami algorytmu SM-2.

| Kolumna          | Typ         | Ograniczenia                                                                | Opis                                          |
| ---------------- | ----------- | --------------------------------------------------------------------------- | --------------------------------------------- |
| id               | uuid        | PRIMARY KEY DEFAULT gen_random_uuid()                                       | Identyfikator fiszki                          |
| deck_id          | uuid        | NOT NULL REFERENCES decks(id) ON DELETE CASCADE                             | Talia, do której należy fiszka                |
| owner_id         | uuid        | NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE                        | Właściciel (denormalizacja)                   |
| front            | text        | NOT NULL CHECK (char_length(trim(front)) > 0 AND char_length(front) <= 200) | Przód fiszki (1-200 znaków)                   |
| back             | text        | NOT NULL CHECK (char_length(trim(back)) > 0 AND char_length(back) <= 500)   | Tył fiszki (1-500 znaków)                     |
| status           | card_status | NOT NULL DEFAULT 'unverified'                                               | Status fiszki                                 |
| created_at       | timestamptz | NOT NULL DEFAULT now()                                                      | Data utworzenia                               |
| updated_at       | timestamptz | NOT NULL DEFAULT now()                                                      | Data ostatniej modyfikacji                    |
| next_review_at   | timestamptz | NULL                                                                        | Data następnej powtórki (NULL dla unverified) |
| interval_days    | integer     | NOT NULL DEFAULT 0 CHECK (interval_days >= 0)                               | Interwał powtórek w dniach                    |
| repetitions      | integer     | NOT NULL DEFAULT 0 CHECK (repetitions >= 0)                                 | Liczba pomyślnych powtórek                    |
| ease_factor_x100 | integer     | NOT NULL DEFAULT 250 CHECK (ease_factor_x100 >= 130)                        | Czynnik łatwości × 100 (min 1.30)             |
| last_reviewed_at | timestamptz | NULL                                                                        | Data ostatniej powtórki                       |

**Uwaga o SM-2:**

- `ease_factor_x100` = 250 oznacza współczynnik 2.50 (wartość startowa w SM-2)
- Minimalny `ease_factor_x100` = 130 (odpowiada 1.30 w oryginalnym SM-2)
- `next_review_at` jest ustawiane na `now()` przy akceptacji fiszki lub manualnym tworzeniu

## 2. Relacje między tabelami

```
auth.users (Supabase)
    │
    ├──1:1──► public.profiles
    │           └── id = auth.users.id
    │           └── zawiera limit generacji AI (ai_generation_date, ai_generation_count)
    │
    ├──1:N──► public.decks
    │           └── owner_id → auth.users.id
    │
    └──1:N──► public.cards (via owner_id, denormalizacja)
                └── owner_id → auth.users.id

public.decks
    │
    └──1:N──► public.cards
                └── deck_id → decks.id (CASCADE DELETE)
```

### Kardynalność:

- **auth.users ↔ profiles:** 1:1 (profiles.id = auth.users.id, zawiera dane limitu generacji)
- **auth.users → decks:** 1:N (użytkownik może mieć wiele tali)
- **decks → cards:** 1:N (talia zawiera wiele fiszek)
- **auth.users → cards:** 1:N (denormalizowany owner_id dla RLS)

## 3. Indeksy

```sql
-- Indeksy dla hot-path: lista tali użytkownika posortowana po last_used_at
CREATE INDEX idx_decks_owner_last_used
    ON public.decks (owner_id, last_used_at DESC);

-- Indeks dla pobierania fiszek z tali z filtrem statusu
CREATE INDEX idx_cards_deck_status
    ON public.cards (deck_id, status);

-- Indeks dla zapytań o fiszki do powtórki (due cards)
CREATE INDEX idx_cards_deck_due
    ON public.cards (deck_id, status, next_review_at)
    WHERE status = 'accepted' AND next_review_at IS NOT NULL;

-- Indeks dla zapytań per-user (RLS, wszystkie fiszki użytkownika)
CREATE INDEX idx_cards_owner
    ON public.cards (owner_id);
```

## 4. Polityki Row Level Security (RLS)

### 4.1 Włączenie RLS na tabelach

```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;
```

### 4.2 Polityki dla public.profiles

```sql
-- Użytkownik może czytać tylko swój profil
CREATE POLICY profiles_select ON public.profiles
    FOR SELECT
    USING (auth.uid() = id);

-- Użytkownik może tworzyć tylko swój profil (przy rejestracji)
CREATE POLICY profiles_insert ON public.profiles
    FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Użytkownik może aktualizować tylko swój profil
CREATE POLICY profiles_update ON public.profiles
    FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);
```

### 4.3 Polityki dla public.decks

```sql
-- Użytkownik widzi tylko swoje talie
CREATE POLICY decks_select ON public.decks
    FOR SELECT
    USING (auth.uid() = owner_id);

-- Użytkownik może tworzyć talie tylko dla siebie
CREATE POLICY decks_insert ON public.decks
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Użytkownik może aktualizować tylko swoje talie
CREATE POLICY decks_update ON public.decks
    FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Użytkownik może usuwać tylko swoje talie
CREATE POLICY decks_delete ON public.decks
    FOR DELETE
    USING (auth.uid() = owner_id);
```

### 4.4 Polityki dla public.cards

```sql
-- Użytkownik widzi tylko swoje fiszki (dzięki denormalizacji owner_id)
CREATE POLICY cards_select ON public.cards
    FOR SELECT
    USING (auth.uid() = owner_id);

-- Użytkownik może tworzyć fiszki tylko dla siebie
CREATE POLICY cards_insert ON public.cards
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

-- Użytkownik może aktualizować tylko swoje fiszki
CREATE POLICY cards_update ON public.cards
    FOR UPDATE
    USING (auth.uid() = owner_id)
    WITH CHECK (auth.uid() = owner_id);

-- Użytkownik może usuwać tylko swoje fiszki
CREATE POLICY cards_delete ON public.cards
    FOR DELETE
    USING (auth.uid() = owner_id);
```

## 5. Dodatkowe uwagi projektowe

### 5.1 Denormalizacja owner_id w cards

Celowa denormalizacja `owner_id` w tabeli `cards` (duplikacja z `decks.owner_id`) upraszcza polityki RLS i eliminuje potrzebę JOIN-ów w klauzulach USING/WITH CHECK. Spójność jest zapewniona przez:

- Kontrolę przy INSERT (aplikacja ustawia owner_id = deck.owner_id)
- Brak możliwości przenoszenia fiszek między taliami w MVP

### 5.2 Wartości domyślne SM-2

Przy tworzeniu nowej fiszki:

- `interval_days` = 0
- `repetitions` = 0
- `ease_factor_x100` = 250 (odpowiada 2.50)
- `next_review_at` = NULL (dla unverified), `now()` (dla accepted/manual)
- `last_reviewed_at` = NULL

### 5.3 Aktualizacja last_used_at

Pole `decks.last_used_at` jest aktualizowane przy:

- Rozpoczęciu sesji powtórek (`review_session_started`)
- Opcjonalnie przy innych akcjach w przyszłości

### 5.4 Kolejność fiszek w sesji powtórek

Fiszki kwalifikujące się do powtórki:

```sql
SELECT * FROM cards
WHERE deck_id = :deck_id
  AND status = 'accepted'
  AND next_review_at <= now()
ORDER BY next_review_at ASC;
```

### 5.5 Licznik fiszek do powtórki

Obliczany dynamicznie przy renderowaniu listy tali:

```sql
SELECT COUNT(*) FROM cards
WHERE deck_id = :deck_id
  AND status = 'accepted'
  AND next_review_at <= now();
```

### 5.6 Masowe akcje (accept/reject)

Wykonywane w jednej transakcji:

```sql
-- Masowa akceptacja
UPDATE cards
SET status = 'accepted', next_review_at = now(), updated_at = now()
WHERE deck_id = :deck_id AND status = 'unverified';

-- Masowe odrzucenie (twarde usunięcie)
DELETE FROM cards
WHERE deck_id = :deck_id AND status = 'unverified';
```

### 5.7 Timezone dla limitu generacji

Data jest liczona w strefie `Europe/Warsaw`:

```sql
(now() AT TIME ZONE 'Europe/Warsaw')::date
```

### 5.8 Brak soft-delete

Zgodnie z decyzjami projektowymi:

- Usunięcie tali = CASCADE DELETE fiszek
- Odrzucenie fiszki = twarde DELETE
- Usunięcie fiszki = twarde DELETE
- Brak pól `deleted_at` ani statusu "deleted"

### 5.9 Rozszerzalność enum card_status

Enum `card_status` można rozszerzyć w przyszłości przez migrację:

```sql
ALTER TYPE card_status ADD VALUE 'new_status' AFTER 'accepted';
```

### 5.10 Bezpieczeństwo

- RLS włączone na wszystkich tabelach domenowych (profiles, decks, cards)
- Cała logika biznesowa (limity generacji, aktualizacja updated_at, tworzenie profilu) w kodzie aplikacji
- Walidacja owner_id przy tworzeniu fiszek w logice aplikacji
- Polityki RLS oparte o `auth.uid()` zapewniają izolację danych między użytkownikami
