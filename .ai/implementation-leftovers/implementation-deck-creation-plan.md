# API Endpoint Implementation Plan: Decks Management

## 1. Przegląd endpointów

Plan obejmuje implementację czterech endpointów REST API do zarządzania taliami fiszek (decks):

- **GET /v1/decks** - Pobieranie listy tali użytkownika z paginacją i licznikiem kart do powtórki
- **POST /v1/decks** - Tworzenie nowej tali
- **PATCH /v1/decks/{deckId}** - Aktualizacja nazwy istniejącej tali
- **DELETE /v1/decks/{deckId}** - Usunięcie tali wraz z kaskadowym usunięciem wszystkich kart

Wszystkie endpointy wymagają uwierzytelnienia użytkownika. Autoryzacja jest zapewniona przez RLS (Row Level Security) na poziomie bazy danych Supabase.

## 2. Szczegóły endpointów

### 2.1 GET /v1/decks

- **Metoda HTTP:** GET
- **Struktura URL:** `/v1/decks?limit={limit}&offset={offset}`
- **Parametry:**
  - Opcjonalne (query):
    - `limit` - liczba zwracanych elementów (default: 20, max: 100, min: 1)
    - `offset` - przesunięcie dla paginacji (default: 0, min: 0)
- **Request Body:** Brak
- **Response 200:**
  ```json
  {
    "items": [
      {
        "id": "uuid",
        "name": "Deck name",
        "last_used_at": "timestamptz",
        "due_cards_count": 12
      }
    ],
    "limit": 20,
    "offset": 0,
    "total": 3
  }
  ```

### 2.2 POST /v1/decks

- **Metoda HTTP:** POST
- **Struktura URL:** `/v1/decks`
- **Parametry:**
  - Wymagane (body):
    - `name` - nazwa tali (string, 1-100 znaków)
- **Request Body:**
  ```json
  {
    "name": "My Deck"
  }
  ```
- **Response 201:**
  ```json
  {
    "id": "uuid",
    "name": "My Deck",
    "created_at": "timestamptz",
    "last_used_at": "timestamptz"
  }
  ```

### 2.3 PATCH /v1/decks/{deckId}

- **Metoda HTTP:** PATCH
- **Struktura URL:** `/v1/decks/{deckId}`
- **Parametry:**
  - Wymagane (path):
    - `deckId` - identyfikator tali (uuid)
  - Wymagane (body):
    - `name` - nowa nazwa tali (string, 1-100 znaków)
- **Request Body:**
  ```json
  {
    "name": "New name"
  }
  ```
- **Response 200:** Zaktualizowana talia (struktura jak w POST)

### 2.4 DELETE /v1/decks/{deckId}

- **Metoda HTTP:** DELETE
- **Struktura URL:** `/v1/decks/{deckId}`
- **Parametry:**
  - Wymagane (path):
    - `deckId` - identyfikator tali (uuid)
- **Request Body:** Brak
- **Response 204:** No Content (pusta odpowiedź)

## 3. Wykorzystywane typy

Wszystkie typy są zdefiniowane w `src/types.ts`:

**DTOs (Response):**
- `DeckDTO` - podstawowe informacje o tali (bez owner_id)
  - Używane w: POST, PATCH responses
- `DeckListItemDTO` - element listy tali z due_cards_count
  - Używane w: GET response (items array)
- `PaginatedDecksResponseDTO` - odpowiedź paginowana
  - Używane w: GET response

**Command Models (Request):**
- `CreateDeckCommand` - komenda tworzenia tali
  - Używane w: POST request body
- `UpdateDeckCommand` - komenda aktualizacji tali
  - Używane w: PATCH request body

## 4. Przepływ danych

### 4.1 GET /v1/decks

1. Endpoint odbiera request z opcjonalnymi query params (limit, offset)
2. Walidacja query params przez Zod schema
3. Pobranie userId z `context.locals.user`
4. Wywołanie `deckService.listDecks(supabase, userId, limit, offset)`
5. Service wykonuje:
   - Query do `decks` z filtrem `owner_id = userId`, sortowanie po `last_used_at DESC`
   - Dla każdej tali subquery zliczające karty do powtórki:
     ```sql
     SELECT COUNT(*) FROM cards
     WHERE deck_id = deck.id
       AND status = 'accepted'
       AND next_review_at <= now()
     ```
   - Query do zliczenia total liczby tali użytkownika
6. Przekształcenie wyników do `PaginatedDecksResponseDTO`
7. Zwrócenie response 200 z JSON

### 4.2 POST /v1/decks

1. Endpoint odbiera request z body
2. Walidacja body przez Zod schema (CreateDeckCommand)
3. Pobranie userId z `context.locals.user`
4. Wywołanie `deckService.createDeck(supabase, userId, name)`
5. Service wykonuje INSERT do tabeli `decks`:
   ```typescript
   {
     owner_id: userId,
     name: trimmedName,
     // created_at, last_used_at - auto (DEFAULT now())
   }
   ```
6. Zwrócenie utworzonej tali jako `DeckDTO`
7. Response 201 z JSON

### 4.3 PATCH /v1/decks/{deckId}

1. Endpoint odbiera request z deckId (path) i body
2. Walidacja deckId jako UUID
3. Walidacja body przez Zod schema (UpdateDeckCommand)
4. Pobranie userId z `context.locals.user`
5. Wywołanie `deckService.updateDeck(supabase, userId, deckId, name)`
6. Service wykonuje:
   - UPDATE w tabeli `decks` z filtrem `id = deckId AND owner_id = userId`
   - RLS automatycznie weryfikuje ownership
7. Jeśli count = 0, zwrócenie 404 (talia nie istnieje lub brak uprawnień)
8. Zwrócenie zaktualizowanej tali jako `DeckDTO`
9. Response 200 z JSON

### 4.4 DELETE /v1/decks/{deckId}

1. Endpoint odbiera request z deckId (path)
2. Walidacja deckId jako UUID
3. Pobranie userId z `context.locals.user`
4. Wywołanie `deckService.deleteDeck(supabase, userId, deckId)`
5. Service wykonuje:
   - DELETE z tabeli `decks` z filtrem `id = deckId AND owner_id = userId`
   - CASCADE DELETE automatycznie usuwa wszystkie karty (ON DELETE CASCADE)
   - RLS automatycznie weryfikuje ownership
6. Jeśli count = 0, zwrócenie 404 (talia nie istnieje lub brak uprawnień)
7. Response 204 No Content

## 5. Względy bezpieczeństwa

### 5.1 Autentykacja

- Wszystkie endpointy sprawdzają obecność `context.locals.user`
- Brak użytkownika → 401 Unauthorized
- Middleware Astro (`src/middleware/index.ts`) powinno już ustawiać `context.locals.supabase` i `context.locals.user`

### 5.2 Autoryzacja

- RLS (Row Level Security) na tabeli `decks` zapewnia izolację danych między użytkownikami
- Polityki RLS:
  - SELECT: `auth.uid() = owner_id`
  - INSERT: `auth.uid() = owner_id`
  - UPDATE: `auth.uid() = owner_id`
  - DELETE: `auth.uid() = owner_id`
- Service layer przekazuje `userId` jawnie, ale RLS jest ostateczną barierą

### 5.3 Walidacja danych wejściowych

- **UUID validation:** deckId musi być prawidłowym UUID (Zod)
- **Name validation:**
  - Trim whitespace
  - Długość 1-100 znaków (zgodnie z DB constraint)
  - Niepusty string po trim
- **Pagination validation:**
  - limit: 1-100
  - offset: >= 0

### 5.4 Ochrona przed atakami

- **SQL Injection:** Użycie Supabase client z parametryzowanymi query eliminuje ryzyko
- **XSS:** Brak renderowania HTML na backendzie, ale frontend powinien escapować dane
- **CSRF:** Wymaga rozważenia przy implementacji frontend (token CSRF lub SameSite cookies)

## 6. Obsługa błędów

### 6.1 Mapowanie błędów

| Kod | Scenariusz | Przykładowa odpowiedź |
|-----|------------|----------------------|
| 200 | GET/PATCH sukces | `{ ...data }` |
| 201 | POST sukces | `{ ...data }` |
| 204 | DELETE sukces | (pusta odpowiedź) |
| 400 | Walidacja failed | `{ "error": "Invalid input", "details": [...] }` |
| 401 | Brak autentykacji | `{ "error": "Unauthorized" }` |
| 404 | Zasób nie znaleziony | `{ "error": "Deck not found" }` |
| 500 | Błąd serwera | `{ "error": "Internal server error" }` |

### 6.2 Szczegółowe scenariusze błędów

**401 Unauthorized:**
- `context.locals.user` jest null/undefined
- Token wygasł (obsługa przez Supabase middleware)

**400 Bad Request:**
- Nieprawidłowy UUID w deckId
- Nazwa pusta po trim
- Nazwa dłuższa niż 100 znaków
- limit > 100 lub < 1
- offset < 0
- Body nie spełnia schema Zod

**404 Not Found:**
- Talia o podanym deckId nie istnieje
- Talia należy do innego użytkownika (RLS blokuje, zwraca 0 rows)

**500 Internal Server Error:**
- Błąd bazy danych (connection timeout, constraint violation itp.)
- Nieoczekiwany błąd w service layer
- Logowanie błędu przez console.error z pełnym stack trace

### 6.3 Logowanie błędów

- Błędy 500 logowane przez `console.error(error)` z pełnym stack trace
- Błędy 400/404 mogą być logowane jako warning dla celów diagnostycznych
- Błędy 401 nie wymagają szczegółowego logowania (zbyt częste)

## 7. Rozważania dotyczące wydajności

### 7.1 Optymalizacje zapytań

- **Indeks:** `idx_decks_owner_last_used` (owner_id, last_used_at DESC) - już istnieje w DB schema
- **Subquery dla due_cards_count:** Wykorzystuje indeks `idx_cards_deck_due`
- **Limit/Offset paginacja:** Prosta implementacja, może być mniej efektywna dla wysokich offset (rozważyć cursor-based w przyszłości)

### 7.2 Potencjalne wąskie gardła

- **GET /v1/decks:** Subquery dla każdej tali w liście może być kosztowne przy wielu taliach
  - Rozważenie jednego JOIN zamiast N subqueries (optymalizacja przyszłościowa)

- **DELETE /v1/decks:** Cascade delete wielu kart może być wolne
  - Dla MVP akceptowalne, można dodać background job w przyszłości

### 7.3 Caching

- Brak cachingu na poziomie API (stateless)
- Frontend może cache'ować listę tali z krótkim TTL
- Rozważenie HTTP ETag w przyszłości

## 8. Etapy implementacji

### Krok 1: Utworzenie struktury katalogów i plików

```bash
mkdir -p src/lib/services
mkdir -p src/pages/api/v1/decks
touch src/lib/services/deck.service.ts
touch src/pages/api/v1/decks/index.ts
touch src/pages/api/v1/decks/[deckId].ts
```

### Krok 2: Implementacja Zod schemas dla walidacji

W `src/pages/api/v1/decks/index.ts`:
- Schema dla query params GET (limit, offset)
- Schema dla body POST (CreateDeckCommand)

W `src/pages/api/v1/decks/[deckId].ts`:
- Schema dla deckId (UUID)
- Schema dla body PATCH (UpdateDeckCommand)

### Krok 3: Implementacja Deck Service (`src/lib/services/deck.service.ts`)

Utworzenie funkcji:

```typescript
export async function listDecks(
  supabase: SupabaseClient,
  userId: string,
  limit: number,
  offset: number
): Promise<PaginatedDecksResponseDTO>

export async function createDeck(
  supabase: SupabaseClient,
  userId: string,
  name: string
): Promise<DeckDTO>

export async function updateDeck(
  supabase: SupabaseClient,
  userId: string,
  deckId: string,
  name: string
): Promise<DeckDTO>

export async function deleteDeck(
  supabase: SupabaseClient,
  userId: string,
  deckId: string
): Promise<void>
```

**Szczegóły implementacji:**
- `listDecks`:
  - SELECT z paginacją i sortowaniem
  - Dla każdej tali wykonanie subquery lub JOIN do zliczenia due_cards_count
  - COUNT(*) dla total
- `createDeck`:
  - INSERT z owner_id i name
  - RETURNING * dla zwrócenia utworzonej tali
  - Trim nazwy przed zapisem
- `updateDeck`:
  - UPDATE z filtrem id + owner_id
  - Sprawdzenie count (0 → throw error 404)
  - RETURNING * dla zwrócenia zaktualizowanej tali
- `deleteDeck`:
  - DELETE z filtrem id + owner_id
  - Sprawdzenie count (0 → throw error 404)

### Krok 4: Implementacja endpoint GET /v1/decks

W `src/pages/api/v1/decks/index.ts`:

```typescript
export const prerender = false;

export async function GET(context: APIContext) {
  // 1. Sprawdzenie autentykacji
  // 2. Walidacja query params (limit, offset)
  // 3. Wywołanie deckService.listDecks
  // 4. Zwrócenie Response z JSON
  // 5. Obsługa błędów (try-catch)
}
```

### Krok 5: Implementacja endpoint POST /v1/decks

W tym samym pliku `src/pages/api/v1/decks/index.ts`:

```typescript
export async function POST(context: APIContext) {
  // 1. Sprawdzenie autentykacji
  // 2. Parsowanie i walidacja body
  // 3. Wywołanie deckService.createDeck
  // 4. Zwrócenie Response 201 z JSON
  // 5. Obsługa błędów (try-catch)
}
```

### Krok 6: Implementacja endpoint PATCH /v1/decks/{deckId}

W `src/pages/api/v1/decks/[deckId].ts`:

```typescript
export const prerender = false;

export async function PATCH(context: APIContext) {
  // 1. Sprawdzenie autentykacji
  // 2. Walidacja deckId z params
  // 3. Parsowanie i walidacja body
  // 4. Wywołanie deckService.updateDeck
  // 5. Zwrócenie Response 200 z JSON
  // 6. Obsługa błędów (try-catch, 404 handling)
}
```

### Krok 7: Implementacja endpoint DELETE /v1/decks/{deckId}

W tym samym pliku `src/pages/api/v1/decks/[deckId].ts`:

```typescript
export async function DELETE(context: APIContext) {
  // 1. Sprawdzenie autentykacji
  // 2. Walidacja deckId z params
  // 3. Wywołanie deckService.deleteDeck
  // 4. Zwrócenie Response 204
  // 5. Obsługa błędów (try-catch, 404 handling)
}
```

### Krok 8: Testowanie endpointów

Testowanie manualne lub przez narzędzia:
- GET /v1/decks - różne kombinacje limit/offset
- POST /v1/decks - tworzenie tali z prawidłową i nieprawidłową nazwą
- PATCH /v1/decks/{deckId} - aktualizacja istniejącej i nieistniejącej tali
- DELETE /v1/decks/{deckId} - usunięcie istniejącej i nieistniejącej tali

Weryfikacja:
- Poprawne kody statusu
- Poprawna struktura JSON w response
- Walidacja działa zgodnie z oczekiwaniami
- RLS blokuje dostęp do cudzych tali
- Cascade delete usuwa karty przy usunięciu tali

### Krok 9: Obsługa edge cases

- Pusta lista tali (GET zwraca items: [], total: 0)
- Offset większy niż total (GET zwraca items: [], ale total jest poprawny)
- Duplikaty nazw (akceptowalne - brak unique constraint)
- Bardzo długa nazwa (obcięta przez walidację)
- Nazwa składająca się tylko z whitespace (odrzucona po trim)

### Krok 10: Dokumentacja i deployment

- Upewnienie się, że typy w src/types.ts są aktualne
- Sprawdzenie zgodności z CLAUDE.md (coding practices)
- Commit zmian z odpowiednim commit message
- Opcjonalnie: update README z informacjami o nowych endpointach
