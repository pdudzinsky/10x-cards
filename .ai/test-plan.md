# Plan Testów - 10x-cards

> **Wersja:** 2.0
> **Ostatnia aktualizacja:** 2026-01-28
> **Status:** Zaktualizowany ze zoptymalizowanym stosem technologicznym

---

## Changelog

### v2.0 (2026-01-28)

**Kluczowe zmiany w stosie technologicznym:**

1. **Usunięto Supertest** → Zastąpiono **Playwright API Testing**
   - Playwright oferuje zunifikowane API do testów E2E i API
   - Lepsze wsparcie dla asynchronicznych operacji
   - Mniejsza liczba zależności w projekcie

2. **Zastąpiono k6 → Artillery**
   - Artillery jest Node.js-native (łatwiejsza integracja)
   - Prostszy w konfiguracji dla MVP
   - Wystarczająca funkcjonalność bez nadmiarowej złożoności

3. **Dodano Snapshot Testing (Vitest)**
   - Wykrywanie niechcianych zmian w strukturze komponentów
   - Automatyczne testy regresji wizualnej

4. **Rozszerzono konfigurację Vitest**
   - Dodano coverage thresholds (80% minimum)
   - Włączono globals dla lepszej DX
   - Dodano alias paths dla czystszych importów

5. **Rozszerzono konfigurację Playwright**
   - Dodano mobile viewports (Pixel 5, iPhone 13)
   - Konfiguracja webServer dla automatycznego startowania dev serwera
   - Ulepszone reportowanie (HTML, JSON, list)

6. **Dodano priorytetyzację narzędzi**
   - P0 (Must-have): Vitest, Playwright, MSW, ESLint, TypeScript
   - P1 (Should-have): axe-playwright, Lighthouse CI, @testing-library/user-event
   - P2 (Nice-to-have): Artillery, Vitest UI

---

## 1. Wprowadzenie i cele testowania

### 1.1 Cel dokumentu

Niniejszy dokument definiuje kompleksowy plan testów dla aplikacji 10x-cards - platformy do tworzenia i nauki fiszek edukacyjnych z wykorzystaniem AI oraz algorytmu spaced repetition (SM-2).

### 1.2 Cele testowania

- Zapewnienie wysokiej jakości i niezawodności aplikacji przed wdrożeniem produkcyjnym
- Weryfikacja poprawności działania kluczowych funkcjonalności: generowanie fiszek przez AI, zarządzanie taliami, sesje powtórek
- Walidacja bezpieczeństwa systemu autentykacji i autoryzacji
- Sprawdzenie integracji z zewnętrznymi usługami (Supabase, OpenRouter.ai)
- Potwierdzenie zgodności z założeniami MVP (75% akceptacji fiszek AI, 75% fiszek tworzonych przez AI)

### 1.3 Zakres projektu

Aplikacja 10x-cards umożliwia:

- Generowanie fiszek przez AI na podstawie tekstu źródłowego
- Manualne tworzenie, edycję i usuwanie fiszek
- Organizację fiszek w talie (decks)
- System kont użytkowników z autentykacją
- Sesje powtórek z algorytmem SM-2

---

## 2. Zakres testów

### 2.1 Funkcjonalności objęte testami

| Moduł                 | Komponenty                                               | Priorytet |
| --------------------- | -------------------------------------------------------- | --------- |
| Autentykacja          | Login, Rejestracja, Reset hasła, Odświeżanie tokenów     | Krytyczny |
| Zarządzanie taliami   | CRUD talii, paginacja, sortowanie                        | Wysoki    |
| Zarządzanie fiszkami  | CRUD fiszek, akceptacja/odrzucanie, operacje masowe      | Wysoki    |
| Generowanie AI        | Integracja OpenRouter, limity dzienne, walidacja wejścia | Krytyczny |
| Sesje powtórek        | Algorytm SM-2, wybór fiszek do powtórki, ocenianie       | Wysoki    |
| Profile użytkowników  | Limity AI, dane użytkownika                              | Średni    |
| Interfejs użytkownika | Komponenty React, responsywność, dostępność              | Średni    |

### 2.2 Funkcjonalności wyłączone z testów

- Zaawansowany algorytm powtórek (poza SM-2)
- Import formatów PDF, DOCX
- Współdzielenie fiszek między użytkownikami
- Aplikacje mobilne

---

## 3. Typy testów

### 3.1 Testy jednostkowe (Unit Tests)

#### 3.1.1 Serwisy backendowe

```
src/lib/services/
├── deck.service.ts          # getDeck, listDecks, createDeck, updateDeck, deleteDeck
├── card.service.ts          # listCards, createCard, updateCard, deleteCard, acceptCard, acceptAllUnverifiedCards, deleteAllUnverifiedCards
├── review.service.ts        # calculateSM2, getCardsForReview, updateDeckLastUsedAt, getCardWithSM2Params, updateCardSM2
├── auth.service.ts          # login, register, logout, sendPasswordResetEmail, resetPassword, getCurrentUser, refreshSession
├── profile.service.ts       # operacje na profilu użytkownika
├── ai-generation.service.ts # createAIGenerationService, MockAIGenerationService
└── openrouter/
    └── openrouter.service.ts # generateCards, validateInput, sanitizeInput, parseResponse
```

**Przypadki testowe dla `review.service.ts` (algorytm SM-2):**

- `calculateSM2` z oceną >= 3 (pomyślne przypomnienie)
- `calculateSM2` z oceną < 3 (reset do początku)
- Obliczanie ease factor (minimum 1.3)
- Obliczanie interwału dla różnych wartości repetitions

**Przypadki testowe dla `openrouter.service.ts`:**

- Walidacja minimalnej długości tekstu źródłowego
- Walidacja maksymalnej długości tekstu źródłowego
- Walidacja dozwolonych wartości `cards_count` (5, 10, 20)
- Sanityzacja tekstu wejściowego
- Parsowanie odpowiedzi z API
- Obsługa różnych kodów błędów HTTP (400, 401, 402, 403, 429, 502, 503)

#### 3.1.2 Schematy walidacji

```
src/lib/schemas/
└── auth.schemas.ts          # walidacja danych logowania, rejestracji
```

#### 3.1.3 Helpery i utility

```
src/lib/
├── utils.ts                 # funkcje pomocnicze (cn, itp.)
└── api/
    └── auth-headers.ts      # parsowanie nagłówków autoryzacji
```

### 3.2 Testy integracyjne (Integration Tests)

#### 3.2.1 API Endpoints

**Autentykacja (`/api/v1/auth/`):**
| Endpoint | Metoda | Testy |
|----------|--------|-------|
| `/login` | POST | Poprawne logowanie, nieprawidłowe dane, walidacja inputu |
| `/register` | POST | Rejestracja nowego użytkownika, email już istnieje, walidacja hasła |
| `/logout` | POST | Wylogowanie, brak sesji |
| `/forgot-password` | POST | Wysłanie emaila, nieistniejący email |
| `/reset-password` | POST | Reset hasła z tokenem, nieprawidłowy token |
| `/refresh` | POST | Odświeżenie tokenu, wygasły refresh token |

**Profile (`/api/v1/profile`):**
| Endpoint | Metoda | Testy |
|----------|--------|-------|
| `/profile` | GET | Pobranie profilu, brak autoryzacji |

**Talie (`/api/v1/decks/`):**
| Endpoint | Metoda | Testy |
|----------|--------|-------|
| `/decks` | GET | Lista talii z paginacją, brak talii, sortowanie |
| `/decks` | POST | Tworzenie talii, walidacja nazwy |
| `/decks/{deckId}` | GET | Pobranie szczegółów, nieistniejąca talia, brak dostępu |
| `/decks/{deckId}` | PATCH | Aktualizacja nazwy |
| `/decks/{deckId}` | DELETE | Usunięcie talii z kaskadowym usunięciem fiszek |

**Fiszki (`/api/v1/decks/{deckId}/cards/`, `/api/v1/cards/`):**
| Endpoint | Metoda | Testy |
|----------|--------|-------|
| `/decks/{deckId}/cards` | GET | Lista fiszek z filtrowaniem po statusie |
| `/decks/{deckId}/cards` | POST | Tworzenie fiszki manualnej |
| `/cards/{cardId}` | PATCH | Aktualizacja fiszki (resetuje SM-2) |
| `/cards/{cardId}` | DELETE | Usunięcie fiszki (tylko accepted) |
| `/cards/{cardId}/accept` | POST | Akceptacja fiszki (idempotentne) |
| `/decks/{deckId}/cards/accept-all` | POST | Masowa akceptacja |
| `/decks/{deckId}/cards/unverified` | DELETE | Masowe odrzucenie |

**Generowanie AI (`/api/v1/decks/{deckId}/ai-generate`):**
| Endpoint | Metoda | Testy |
|----------|--------|-------|
| `/ai-generate` | POST | Generowanie fiszek, limity dzienne, walidacja tekstu |

**Sesje powtórek (`/api/v1/decks/{deckId}/reviews/`, `/api/v1/reviews/`):**
| Endpoint | Metoda | Testy |
|----------|--------|-------|
| `/reviews/start` | POST | Rozpoczęcie sesji, brak fiszek do powtórki |
| `/reviews/{cardId}/answer` | POST | Odpowiedź z oceną 0-5 |

#### 3.2.2 Middleware

- Walidacja tokenu Bearer
- Ochrona endpointów API (401 dla nieautoryzowanych)
- Publiczne ścieżki (/, /login, /register, /forgot-password, /reset-password)

### 3.3 Testy komponentów React (Component Tests)

**Typy testów komponentów:**

- **Testy renderowania** - czy komponent renderuje się bez błędów
- **Testy interakcji** - czy eventy działają poprawnie (kliknięcia, wypełnianie formularzy)
- **Testy snapshot** - czy struktura DOM nie uległa niechcianym zmianom
- **Testy dostępności** - czy komponenty są zgodne z ARIA

#### 3.3.1 Komponenty autentykacji

```
src/components/auth/
├── FormError.tsx
└── PasswordInput.tsx
```

#### 3.3.2 Komponenty talii

```
src/components/decks/
├── DecksPage.tsx            # główny widok listy talii
├── DecksList.tsx            # lista talii
├── DeckListItem.tsx         # pojedyncza talia
├── CreateDeckButton.tsx     # przycisk tworzenia
├── CreateDeckDialog.tsx     # dialog tworzenia
├── DecksPagination.tsx      # paginacja
├── DecksLoadingState.tsx    # stan ładowania
├── DecksEmptyState.tsx      # pusty stan
└── DecksErrorState.tsx      # stan błędu
```

#### 3.3.3 Komponenty szczegółów talii

```
src/components/deck-detail/
├── DeckDetailView.tsx       # główny widok
├── DeckHeader.tsx           # nagłówek z akcjami
├── CardSection.tsx          # sekcja fiszek
├── CardList.tsx             # lista fiszek
├── CardItem.tsx             # pojedyncza fiszka
├── AddCardForm.tsx          # formularz dodawania
├── CardStatusFilter.tsx     # filtr statusu
├── BulkActions.tsx          # operacje masowe
├── EditDeckDialog.tsx       # edycja nazwy
├── DeleteDeckDialog.tsx     # potwierdzenie usunięcia
├── DeleteCardDialog.tsx     # potwierdzenie usunięcia fiszki
└── RejectAllDialog.tsx      # odrzucenie wszystkich
```

#### 3.3.4 Komponenty generowania AI

```
src/components/ai-generate/
├── AIGenerateView.tsx       # główny widok
├── AIGenerateHeader.tsx     # nagłówek
├── AIGenerateForm.tsx       # formularz
├── SourceTextArea.tsx       # pole tekstowe
├── CardsCountSelect.tsx     # wybór liczby fiszek
├── LimitInfo.tsx            # informacja o limitach
└── ActionButtons.tsx        # przyciski akcji
```

#### 3.3.5 Komponenty sesji powtórek

```
src/components/review-session/
├── ReviewSessionView.tsx    # główny widok
├── ReviewHeader.tsx         # nagłówek z postępem
├── ReviewCard.tsx           # fiszka do powtórki
├── GradeButtons.tsx         # przyciski oceny 0-5
├── LoadingState.tsx         # ładowanie
├── EmptyReviewState.tsx     # brak fiszek
└── ErrorState.tsx           # błąd
```

#### 3.3.6 Custom Hooks

```
src/components/decks/useDecksList.ts
src/components/deck-detail/hooks/useDeckDetail.ts
src/components/deck-detail/hooks/useCardForm.ts
src/components/deck-detail/hooks/useDialogs.ts
src/components/ai-generate/hooks/useAIGenerate.ts
src/components/review-session/hooks/useReviewSession.ts
```

### 3.4 Testy End-to-End (E2E Tests)

#### 3.4.1 Scenariusze krytyczne

**SC-01: Pełny flow rejestracji i logowania**

1. Użytkownik otwiera stronę główną
2. Przechodzi do rejestracji
3. Wypełnia formularz (email, hasło)
4. Zostaje przekierowany do strony talii
5. Wylogowuje się
6. Loguje się ponownie
7. Widzi swoje talie

**SC-02: Tworzenie talii i manualnych fiszek**

1. Zalogowany użytkownik tworzy nową talię
2. Przechodzi do szczegółów talii
3. Dodaje fiszkę manualnie
4. Edytuje fiszkę
5. Usuwa fiszkę
6. Usuwa talię

**SC-03: Generowanie fiszek przez AI**

1. Zalogowany użytkownik przechodzi do talii
2. Klika "Generuj z AI"
3. Wkleja tekst źródłowy
4. Wybiera liczbę fiszek (5/10/20)
5. Generuje fiszki
6. Przegląda wygenerowane fiszki
7. Akceptuje wybrane fiszki
8. Odrzuca pozostałe

**SC-04: Sesja powtórek**

1. Użytkownik ma talię z zaakceptowanymi fiszkami
2. Rozpoczyna sesję powtórek
3. Widzi przód fiszki
4. Odkrywa tył
5. Ocenia fiszkę (0-5)
6. Przechodzi do kolejnej fiszki
7. Kończy sesję

**SC-05: Reset hasła**

1. Użytkownik klika "Zapomniałem hasła"
2. Podaje email
3. Otrzymuje link do resetu
4. Ustawia nowe hasło
5. Loguje się nowym hasłem

### 3.5 Testy bezpieczeństwa (Security Tests)

#### 3.5.1 Autentykacja i autoryzacja

- Weryfikacja tokenów JWT
- Ochrona endpointów przed nieautoryzowanym dostępem
- RLS (Row Level Security) w Supabase - użytkownik widzi tylko swoje dane
- Walidacja refresh tokenów

#### 3.5.2 Walidacja danych wejściowych

- SQL injection (Supabase SDK powinno chronić)
- XSS w treści fiszek
- Walidacja długości tekstu źródłowego dla AI

#### 3.5.3 Rate limiting

- Limity dzienne generowania AI (profile.ai_generation_count)
- Obsługa 429 z OpenRouter

### 3.6 Testy wydajnościowe (Performance Tests)

#### 3.6.1 Metryki docelowe

| Operacja                   | Cel     | Akceptowalne |
| -------------------------- | ------- | ------------ |
| Ładowanie listy talii      | < 500ms | < 1s         |
| Ładowanie szczegółów talii | < 500ms | < 1s         |
| Generowanie fiszek AI      | < 30s   | < 60s        |
| Odpowiedź sesji powtórki   | < 200ms | < 500ms      |

#### 3.6.2 Testy obciążeniowe

- Lista talii z 100+ taliami
- Talia z 500+ fiszkami
- Równoczesne żądania API
- Timeout dla OpenRouter (60s)

### 3.7 Testy dostępności (Accessibility Tests)

- Nawigacja klawiaturą
- Atrybuty ARIA
- Kontrast kolorów
- Screen reader compatibility
- Focus management w dialogach

---

## 4. Scenariusze testowe szczegółowe

### 4.1 Moduł autentykacji

#### TC-AUTH-001: Poprawne logowanie

**Warunki wstępne:** Użytkownik istnieje w systemie
**Kroki:**

1. Przejdź do `/login`
2. Wprowadź poprawny email
3. Wprowadź poprawne hasło
4. Kliknij "Zaloguj"
   **Oczekiwany rezultat:** Przekierowanie do `/decks`, token w localStorage

#### TC-AUTH-002: Logowanie z nieprawidłowymi danymi

**Kroki:**

1. Przejdź do `/login`
2. Wprowadź nieprawidłowy email lub hasło
3. Kliknij "Zaloguj"
   **Oczekiwany rezultat:** Komunikat "Nieprawidłowy email lub hasło"

#### TC-AUTH-003: Rejestracja nowego użytkownika

**Warunki wstępne:** Email nie istnieje w systemie
**Kroki:**

1. Przejdź do `/register`
2. Wprowadź nowy email
3. Wprowadź hasło (min. 8 znaków)
4. Potwierdź hasło
5. Kliknij "Zarejestruj"
   **Oczekiwany rezultat:** Konto utworzone, automatyczne logowanie

#### TC-AUTH-004: Rejestracja z istniejącym emailem

**Kroki:**

1. Przejdź do `/register`
2. Wprowadź email istniejącego użytkownika
3. Wprowadź hasło
4. Kliknij "Zarejestruj"
   **Oczekiwany rezultat:** Komunikat "Email jest już zajęty"

### 4.2 Moduł zarządzania taliami

#### TC-DECK-001: Utworzenie nowej talii

**Warunki wstępne:** Użytkownik zalogowany
**Kroki:**

1. Na stronie `/decks` kliknij "Nowa talia"
2. Wprowadź nazwę talii
3. Kliknij "Utwórz"
   **Oczekiwany rezultat:** Talia pojawia się na liście

#### TC-DECK-002: Paginacja listy talii

**Warunki wstępne:** Użytkownik ma > 10 talii
**Kroki:**

1. Przejdź do `/decks`
2. Przewiń do końca strony
3. Kliknij "Następna strona"
   **Oczekiwany rezultat:** Wyświetlenie kolejnych talii

#### TC-DECK-003: Usunięcie talii z fiszkami

**Warunki wstępne:** Talia zawiera fiszki
**Kroki:**

1. Przejdź do szczegółów talii
2. Kliknij "Usuń talię"
3. Potwierdź usunięcie
   **Oczekiwany rezultat:** Talia i wszystkie fiszki usunięte

### 4.3 Moduł generowania AI

#### TC-AI-001: Generowanie fiszek z poprawnym tekstem

**Warunki wstępne:** Użytkownik ma dostępne limity AI
**Kroki:**

1. Przejdź do generowania AI w talii
2. Wklej tekst źródłowy (min. 100 znaków)
3. Wybierz liczbę fiszek: 5
4. Kliknij "Generuj"
   **Oczekiwany rezultat:** 5 fiszek ze statusem "unverified"

#### TC-AI-002: Przekroczenie limitu dziennego

**Warunki wstępne:** Użytkownik wykorzystał dzienny limit
**Kroki:**

1. Przejdź do generowania AI
2. Spróbuj wygenerować fiszki
   **Oczekiwany rezultat:** Komunikat o przekroczeniu limitu

#### TC-AI-003: Tekst źródłowy za krótki

**Kroki:**

1. Przejdź do generowania AI
2. Wklej tekst < 100 znaków
3. Kliknij "Generuj"
   **Oczekiwany rezultat:** Walidacja - tekst za krótki

### 4.4 Moduł sesji powtórek

#### TC-REVIEW-001: Rozpoczęcie sesji z fiszkami do powtórki

**Warunki wstępne:** Talia ma fiszki z `next_review_at <= now()`
**Kroki:**

1. Na stronie talii kliknij "Rozpocznij powtórkę"
2. Wyświetla się pierwsza fiszka (przód)
3. Kliknij "Pokaż odpowiedź"
4. Oceń fiszkę (np. 4)
   **Oczekiwany rezultat:** Fiszka zaktualizowana, następna wyświetlona

#### TC-REVIEW-002: Ocena 0-2 resetuje interwał

**Kroki:**

1. Rozpocznij sesję powtórek
2. Oceń fiszkę na 2
   **Oczekiwany rezultat:** `repetitions = 0`, `interval_days = 1`

#### TC-REVIEW-003: Brak fiszek do powtórki

**Warunki wstępne:** Wszystkie fiszki mają `next_review_at > now()`
**Kroki:**

1. Kliknij "Rozpocznij powtórkę"
   **Oczekiwany rezultat:** Komunikat "Brak fiszek do powtórki"

---

## 5. Środowisko testowe

### 5.1 Środowiska

| Środowisko  | Cel                 | Baza danych      | AI Service              |
| ----------- | ------------------- | ---------------- | ----------------------- |
| Development | Testy deweloperskie | Supabase local   | MockAIGenerationService |
| Staging     | Testy integracyjne  | Supabase staging | OpenRouter (test key)   |
| Production  | Smoke tests         | Supabase prod    | OpenRouter (prod key)   |

### 5.2 Konfiguracja

**Zmienne środowiskowe:**

```
SUPABASE_URL=
SUPABASE_KEY=
OPENROUTER_API_KEY=
SITE=
```

### 5.3 Dane testowe

- Użytkownik testowy: `test@10x-cards.local`
- Talia testowa z różnymi stanami fiszek
- Fiszki z różnymi wartościami SM-2

---

## 6. Narzędzia do testowania

### 6.1 Testy jednostkowe i integracyjne

| Narzędzie                   | Zastosowanie                           |
| --------------------------- | -------------------------------------- |
| Vitest                      | Test runner, asercje, snapshot testing |
| @testing-library/react      | Testy komponentów React                |
| @testing-library/user-event | Symulacja interakcji użytkownika       |
| MSW (Mock Service Worker)   | Mockowanie API (Request/Response)      |
| Playwright API Testing      | Testy integracyjne endpointów HTTP     |

### 6.2 Testy E2E

| Narzędzie       | Zastosowanie             |
| --------------- | ------------------------ |
| Playwright      | Testy E2E, cross-browser |
| Playwright Test | Asercje, selektory       |

### 6.3 Testy wydajnościowe

| Narzędzie     | Zastosowanie                                            | Priorytet         |
| ------------- | ------------------------------------------------------- | ----------------- |
| Artillery     | Testy obciążeniowe API (prostsze od k6, Node.js-native) | P2 (Nice-to-have) |
| Lighthouse CI | Wydajność frontend, Core Web Vitals                     | P1 (Should-have)  |

**Uzasadnienie wyboru Artillery zamiast k6:**

- Artillery jest napisany w Node.js, więc łatwiejsza integracja z projektem
- Prostszy w konfiguracji dla MVP
- Wystarczająca funkcjonalność do testowania API (k6 jest nadmiarowy dla obecnych potrzeb)
- Nie wymaga dodatkowych runtime'ów (Go)

### 6.4 Pozostałe

| Narzędzie      | Zastosowanie                 | Priorytet        |
| -------------- | ---------------------------- | ---------------- |
| axe-playwright | Testy dostępności (WCAG 2.1) | P1 (Should-have) |
| ESLint         | Statyczna analiza kodu       | P0 (Must-have)   |
| TypeScript     | Type checking                | P0 (Must-have)   |

---

## 6.5 Priorytetyzacja narzędzi dla MVP

### Must-have (P0)

- **Vitest** - podstawowa jakość kodu poprzez testy jednostkowe
- **@testing-library/react** - stabilność komponentów UI
- **MSW** - mockowanie API dla testów izolowanych
- **Playwright** - weryfikacja głównych flow użytkownika (E2E)
- **ESLint + TypeScript** - jakość kodu na poziomie statycznym

### Should-have (P1)

- **Playwright API Testing** - testy integracyjne endpointów
- **axe-playwright** - dostępność (WCAG compliance)
- **Lighthouse CI** - monitoring wydajności frontend
- **@testing-library/user-event** - realistyczne interakcje w testach

### Nice-to-have (P2)

- **Artillery** - testy obciążeniowe (optymalizacja, nie blokujące release)
- **Vitest UI** - debugowanie testów w trybie graficznym

---

## 7. Harmonogram testów

### 7.1 Cykl testowy

| Faza        | Rodzaj testów         | Częstotliwość |
| ----------- | --------------------- | ------------- |
| CI          | Unit, Lint, TypeCheck | Każdy commit  |
| Pre-merge   | Unit + Integration    | Każdy PR      |
| Nightly     | E2E, Performance      | Codziennie    |
| Pre-release | Full regression       | Przed release |

### 7.2 Estymacja pokrycia

| Moduł                       | Pokrycie docelowe |
| --------------------------- | ----------------- |
| Serwisy backendowe          | 90%               |
| API Endpoints               | 85%               |
| Komponenty React            | 70%               |
| Custom Hooks                | 80%               |
| E2E (scenariusze krytyczne) | 100%              |

---

## 8. Kryteria akceptacji testów

### 8.1 Kryteria wejścia do fazy testów

- Kod przeszedł code review
- Build przechodzi bez błędów
- Lint i TypeScript bez errorów
- Dokumentacja API aktualna

### 8.2 Kryteria zakończenia testów

- 100% testów jednostkowych przechodzi
- 100% testów integracyjnych przechodzi
- 100% scenariuszy krytycznych E2E przechodzi
- Brak błędów krytycznych (blocker, critical)
- Pokrycie kodu >= 80%

### 8.3 Kryteria akceptacji dla release

- Wszystkie kryteria zakończenia spełnione
- Testy wydajnościowe w normie
- Testy bezpieczeństwa bez podatności
- Sign-off od QA lead

---

## 9. Role i odpowiedzialności

| Rola        | Odpowiedzialności                     |
| ----------- | ------------------------------------- |
| Developer   | Testy jednostkowe, naprawa błędów     |
| QA Engineer | Testy integracyjne, E2E, raportowanie |
| Tech Lead   | Code review, architektura testów      |
| DevOps      | CI/CD, środowiska testowe             |

---

## 10. Procedury raportowania błędów

### 10.1 Klasyfikacja błędów

| Priorytet | Opis                           | SLA       |
| --------- | ------------------------------ | --------- |
| Blocker   | Uniemożliwia działanie systemu | 4h        |
| Critical  | Kluczowa funkcja nie działa    | 24h       |
| Major     | Funkcja działa niepoprawnie    | 3 dni     |
| Minor     | Drobna niedogodność            | 1 tydzień |
| Trivial   | Kosmetyczne                    | Backlog   |

### 10.2 Szablon zgłoszenia błędu

```markdown
## Tytuł

[Krótki opis problemu]

## Środowisko

- Browser:
- OS:
- Wersja aplikacji:

## Kroki reprodukcji

1.
2.
3.

## Oczekiwany rezultat

[Co powinno się stać]

## Aktualny rezultat

[Co się dzieje]

## Załączniki

- Screenshot/Nagranie
- Logi konsoli
- Network trace

## Priorytet

[Blocker/Critical/Major/Minor/Trivial]
```

### 10.3 Workflow błędu

1. **New** - Zgłoszony
2. **Triaged** - Sklasyfikowany przez QA
3. **In Progress** - W naprawie
4. **Ready for Test** - Do weryfikacji
5. **Verified** - Zweryfikowany
6. **Closed** - Zamknięty

---

## 11. Metryki i raportowanie

### 11.1 Metryki testów

- Liczba testów (total/passed/failed/skipped)
- Pokrycie kodu
- Czas wykonania testów
- Trend defektów

### 11.2 Raporty

- Dzienny raport z testów CI
- Tygodniowy raport jakości
- Raport przed release

---

## 12. Ryzyka i mitygacja

| Ryzyko                       | Prawdopodobieństwo | Wpływ  | Mitygacja                                    |
| ---------------------------- | ------------------ | ------ | -------------------------------------------- |
| Niedostępność OpenRouter API | Średnie            | Wysoki | MockAIGenerationService jako fallback        |
| Zmiany w Supabase API        | Niskie             | Wysoki | Pinning wersji, monitoring changelog         |
| Flaky tests E2E              | Wysokie            | Średni | Retry mechanism, stabilne selektory          |
| Niska jakość fiszek AI       | Średnie            | Wysoki | Testy jakości odpowiedzi, prompt engineering |

---

## Załączniki

### A. Struktura katalogów testów

```
tests/
├── unit/
│   ├── services/
│   │   ├── deck.service.test.ts
│   │   ├── card.service.test.ts
│   │   ├── review.service.test.ts
│   │   ├── auth.service.test.ts
│   │   └── openrouter.service.test.ts
│   ├── schemas/
│   │   └── auth.schemas.test.ts
│   └── utils/
│       └── utils.test.ts
├── integration/
│   ├── api/
│   │   ├── auth.test.ts
│   │   ├── decks.test.ts
│   │   ├── cards.test.ts
│   │   ├── ai-generate.test.ts
│   │   └── reviews.test.ts
│   └── middleware/
│       └── auth-middleware.test.ts
├── component/
│   ├── decks/
│   ├── deck-detail/
│   ├── ai-generate/
│   └── review-session/
├── e2e/
│   ├── auth.spec.ts
│   ├── deck-management.spec.ts
│   ├── ai-generation.spec.ts
│   └── review-session.spec.ts
└── fixtures/
    ├── users.ts
    ├── decks.ts
    └── cards.ts
```

### B. Konfiguracja Vitest

```typescript
// vitest.config.ts
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    globals: true,
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html", "lcov"],
      exclude: ["node_modules/", "tests/", "**/*.d.ts", "**/*.config.*"],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

**Przykład testu snapshot:**

```typescript
// tests/component/decks/DeckListItem.test.tsx
import { expect, test, describe } from 'vitest'
import { render } from '@testing-library/react'
import { DeckListItem } from '@/components/decks/DeckListItem'

describe('DeckListItem', () => {
  test('matches snapshot', () => {
    const { container } = render(
      <DeckListItem
        id="1"
        name="Test Deck"
        cardCount={10}
        lastUsedAt={new Date('2024-01-01')}
      />
    )
    expect(container).toMatchSnapshot()
  })

  test('renders deck name correctly', () => {
    const { getByText } = render(
      <DeckListItem id="1" name="My Test Deck" cardCount={5} />
    )
    expect(getByText('My Test Deck')).toBeInTheDocument()
  })
})
```

**Przykład testu API z Playwright:**

````typescript
// tests/integration/api/decks.test.ts
import { test, expect } from '@playwright/test'

test.describe('Decks API', () => {
  test('POST /api/v1/decks creates new deck', async ({ request }) => {
    const response = await request.post('/api/v1/decks', {
      data: { name: 'Test Deck' },
      headers: { 'Authorization': 'Bearer test-token' }
    })

    expect(response.status()).toBe(201)
    const body = await response.json()
    expect(body).toHaveProperty('id')
    expect(body.name).toBe('Test Deck')
  })

  test('GET /api/v1/decks returns paginated list', async ({ request }) => {
    const response = await request.get('/api/v1/decks?page=1&limit=10')

    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('decks')
    expect(body).toHaveProperty('total')
  })
})

### C. Konfiguracja Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['list']
  ],
  use: {
    baseURL: 'http://localhost:4321', // Astro default port
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] }
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] }
    },
    // Mobile viewports
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] }
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] }
    }
  ],
  webServer: {
    command: 'npm run dev',
    port: 4321,
    reuseExistingServer: !process.env.CI
  }
})
````

**Przykład testu E2E:**

```typescript
// tests/e2e/deck-management.spec.ts
import { test, expect } from "@playwright/test";

test.describe("Deck Management", () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto("/login");
    await page.fill('input[name="email"]', "test@example.com");
    await page.fill('input[name="password"]', "password123");
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL("/decks");
  });

  test("SC-02: Create, edit and delete deck", async ({ page }) => {
    // Create deck
    await page.click('button:has-text("Nowa talia")');
    await page.fill('input[name="name"]', "Test Deck E2E");
    await page.click('button:has-text("Utwórz")');

    // Verify deck appears
    await expect(page.locator("text=Test Deck E2E")).toBeVisible();

    // Open deck details
    await page.click("text=Test Deck E2E");
    await expect(page).toHaveURL(/\/decks\/[a-z0-9-]+/);

    // Edit deck name
    await page.click('button[aria-label="Edytuj talię"]');
    await page.fill('input[name="name"]', "Updated Deck Name");
    await page.click('button:has-text("Zapisz")');
    await expect(page.locator("text=Updated Deck Name")).toBeVisible();

    // Delete deck
    await page.click('button[aria-label="Usuń talię"]');
    await page.click('button:has-text("Potwierdź")');
    await expect(page).toHaveURL("/decks");
    await expect(page.locator("text=Updated Deck Name")).not.toBeVisible();
  });
});
```

### D. Konfiguracja Artillery (testy obciążeniowe)

```yaml
# artillery.yml
config:
  target: "http://localhost:4321"
  phases:
    - duration: 60
      arrivalRate: 5
      name: "Warm up"
    - duration: 120
      arrivalRate: 10
      name: "Sustained load"
    - duration: 60
      arrivalRate: 20
      name: "Peak load"
  processor: "./tests/performance/auth-processor.js"
  variables:
    testEmail: "load-test@10x-cards.local"
    testPassword: "password123"

scenarios:
  - name: "List decks with authentication"
    flow:
      - function: "generateAuthToken"
      - get:
          url: "/api/v1/decks?page=1&limit=10"
          headers:
            Authorization: "Bearer {{ authToken }}"
          expect:
            - statusCode: 200
            - contentType: json

  - name: "Create and retrieve deck"
    weight: 30
    flow:
      - function: "generateAuthToken"
      - post:
          url: "/api/v1/decks"
          headers:
            Authorization: "Bearer {{ authToken }}"
            Content-Type: "application/json"
          json:
            name: "Load Test Deck {{ $randomString() }}"
          capture:
            - json: "$.id"
              as: "deckId"
      - get:
          url: "/api/v1/decks/{{ deckId }}"
          headers:
            Authorization: "Bearer {{ authToken }}"

  - name: "Review session simulation"
    weight: 20
    flow:
      - function: "generateAuthToken"
      - post:
          url: "/api/v1/decks/{{ deckId }}/reviews/start"
          headers:
            Authorization: "Bearer {{ authToken }}"
          capture:
            - json: "$.cardId"
              as: "cardId"
      - post:
          url: "/api/v1/reviews/{{ cardId }}/answer"
          headers:
            Authorization: "Bearer {{ authToken }}"
            Content-Type: "application/json"
          json:
            grade: 4
```

```javascript
// tests/performance/auth-processor.js
module.exports = {
  generateAuthToken: function (context, events, done) {
    // W rzeczywistym scenariuszu: pobranie tokenu z API
    // Dla uproszczenia mockujemy token
    context.vars.authToken = "test-bearer-token";
    return done();
  },
};
```

**Uruchomienie testów Artillery:**

```bash
# Zainstaluj Artillery
npm install --save-dev artillery

# Uruchom test
npx artillery run artillery.yml

# Generuj raport HTML
npx artillery run --output report.json artillery.yml
npx artillery report report.json
```

### E. Przykładowy package.json z skryptami testowymi

```json
{
  "name": "10x-cards",
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:watch": "vitest --watch",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui",
    "test:e2e:headed": "playwright test --headed",
    "test:api": "playwright test tests/integration/api",
    "test:performance": "artillery run artillery.yml",
    "test:lighthouse": "lighthouse http://localhost:4321 --output=html --output-path=./lighthouse-report.html",
    "test:all": "npm run test && npm run test:e2e",
    "lint": "eslint . --ext .ts,.tsx,.astro",
    "type-check": "tsc --noEmit"
  },
  "devDependencies": {
    "@playwright/test": "^1.40.0",
    "@testing-library/jest-dom": "^6.1.5",
    "@testing-library/react": "^14.1.2",
    "@testing-library/user-event": "^14.5.1",
    "@vitest/coverage-v8": "^1.0.4",
    "@vitest/ui": "^1.0.4",
    "artillery": "^2.0.0",
    "axe-playwright": "^1.2.3",
    "eslint": "^8.55.0",
    "jsdom": "^23.0.1",
    "lighthouse": "^11.4.0",
    "msw": "^2.0.11",
    "typescript": "^5.3.3",
    "vite-tsconfig-paths": "^4.2.2",
    "vitest": "^1.0.4"
  }
}
```

### F. Uzasadnienie wyboru stosu technologicznego

#### Vitest vs Jest

**Wybrano: Vitest**

| Kryterium         | Vitest               | Jest                   |
| ----------------- | -------------------- | ---------------------- |
| Integracja z Vite | ✅ Natywna           | ⚠️ Wymaga konfiguracji |
| Szybkość          | ✅ ~10x szybszy      | ❌ Wolniejszy          |
| ESM support       | ✅ Out-of-the-box    | ⚠️ Eksperymentalne     |
| Config reuse      | ✅ Używa vite.config | ❌ Osobna konfiguracja |
| TypeScript        | ✅ Zero-config       | ⚠️ Wymaga ts-jest      |

**Wniosek:** Vitest jest naturalnym wyborem dla projektów opartych na Vite (jak Astro).

---

#### Playwright vs Cypress

**Wybrano: Playwright**

| Kryterium        | Playwright                     | Cypress                            |
| ---------------- | ------------------------------ | ---------------------------------- |
| Cross-browser    | ✅ Chromium, Firefox, WebKit   | ⚠️ Chromium, Firefox (beta WebKit) |
| Szybkość         | ✅ Szybszy, parallel execution | ❌ Wolniejszy                      |
| API Testing      | ✅ Wbudowane `request` API     | ❌ Wymaga cy.request (ograniczone) |
| Mobile viewports | ✅ Emulacja urządzeń           | ⚠️ Ograniczone                     |
| Trace viewer     | ✅ Doskonały debugger          | ⚠️ Słabszy                         |
| Learning curve   | ⚠️ Średni                      | ✅ Łatwy                           |

**Wniosek:** Playwright oferuje więcej funkcjonalności i lepszą wydajność, choć ma wyższą krzywą uczenia.

---

#### Artillery vs k6

**Wybrano: Artillery (dla MVP)**

| Kryterium         | Artillery                | k6                             |
| ----------------- | ------------------------ | ------------------------------ |
| Runtime           | ✅ Node.js               | ❌ Go (wymaga instalacji)      |
| Konfiguracja      | ✅ YAML/JSON             | ⚠️ JavaScript (własny runtime) |
| CI/CD integration | ✅ Prosty                | ⚠️ Wymaga Docker lub binaries  |
| Funkcjonalność    | ✅ Wystarczająca dla MVP | ⚠️ Zaawansowana (overkill)     |
| Cloud support     | ✅ Artillery Cloud       | ✅ k6 Cloud                    |

**Wniosek:** Artillery jest prostszy i wystarczający dla potrzeb MVP. k6 jest lepszy dla zaawansowanych scenariuszy (distributed load testing, custom metrics).

---

#### MSW (Mock Service Worker)

**Wybrano: MSW**

**Zalety:**

- Przechwytuje requesty na poziomie network layer (nie mockuje fetch/axios bezpośrednio)
- Działa zarówno w testach jak i w przeglądarce (dev mode)
- Realistyczne mockowanie - zachowuje się jak prawdziwy serwer
- Type-safe z TypeScript

**Alternatywy:**

- `nock` - tylko Node.js, nie działa w przeglądarce
- `fetch-mock` - mniej eleganckie API, gorsze TypeScript support

---

#### Playwright API Testing vs Supertest

**Wybrano: Playwright API Testing**

**Uzasadnienie:**

- **Zunifikowane narzędzie** - jeden framework do E2E + API tests
- **Lepsze async handling** - Playwright jest zbudowany od podstaw dla async operacji
- **Request context** - możliwość reużycia cookies/auth między requestami
- **Fixtures** - łatwe zarządzanie stanem testowym

**Porównanie:**

```typescript
// Supertest (wymaga Express/HTTP server)
import request from "supertest";
import app from "./app";

test("create deck", async () => {
  const response = await request(app).post("/api/v1/decks").send({ name: "Test" });
  expect(response.status).toBe(201);
});

// Playwright (działa z dowolnym HTTP service)
import { test, expect } from "@playwright/test";

test("create deck", async ({ request }) => {
  const response = await request.post("/api/v1/decks", {
    data: { name: "Test" },
  });
  expect(response.status()).toBe(201);
});
```

---

## Podsumowanie stack'u testowego

```
┌─────────────────────────────────────────┐
│         Stos technologiczny             │
├─────────────────────────────────────────┤
│ Unit/Integration: Vitest + MSW          │
│ Component Tests: @testing-library/react │
│ E2E Tests: Playwright                   │
│ API Tests: Playwright API Testing       │
│ Accessibility: axe-playwright            │
│ Performance: Artillery + Lighthouse CI  │
│ Static Analysis: ESLint + TypeScript    │
└─────────────────────────────────────────┘
```

**Całkowity koszt (dev dependencies):** ~150MB
**Czas nauki (dla dewelopera):** ~1-2 tygodnie
**ROI:** Wysoki - kompletne pokrycie testowe z minimalną liczbą narzędzi
