# Plan implementacji widoku Sesji Powtórek

## 1. Przegląd

Widok Sesji Powtórek umożliwia użytkownikowi przeglądanie i ocenianie fiszek z wybranej tali. Widok prezentuje fiszki jedna po drugiej, pozwalając na ocenę każdej w skali 0-5 (algorytm SM-2). Po ocenie fiszki następuje automatyczne przejście do następnej. Użytkownik może w dowolnym momencie zakończyć sesję przyciskiem "Zakończ". Widok obsługuje również stan pustej sesji (brak fiszek do powtórki).

## 2. Routing widoku

Ścieżka: `/decks/:deckId/review`

Plik strony Astro: `src/pages/decks/[deckId]/review.astro`

## 3. Struktura komponentów

```
ReviewSessionPage (Astro)
└── ReviewSessionView (React, client:load)
    ├── ReviewHeader
    │   ├── BackButton
    │   ├── ProgressCounter
    │   └── FinishButton
    ├── ReviewCard
    │   ├── CardFront
    │   └── CardBack
    ├── GradeButtons
    │   └── GradeButton (×6)
    ├── EmptyReviewState
    └── ErrorState
```

## 4. Szczegóły komponentów

### ReviewSessionPage (Astro)

- **Opis**: Strona Astro hostująca widok sesji powtórek. Renderowana po stronie serwera z hydracją komponentu React.
- **Główne elementy**: Layout, przekazanie `deckId` do komponentu React
- **Obsługiwane interakcje**: Brak (delegowane do React)
- **Obsługiwana walidacja**: Brak
- **Typy**: Brak
- **Propsy**: Brak (parametr z URL)

### ReviewSessionView

- **Opis**: Główny kontener React zarządzający stanem sesji powtórek. Odpowiada za inicjalizację sesji, nawigację między fiszkami i obsługę błędów.
- **Główne elementy**:
  - `ReviewHeader` - nagłówek z nawigacją i postępem
  - `ReviewCard` - wyświetlanie aktualnej fiszki
  - `GradeButtons` - przyciski oceny
  - `EmptyReviewState` - stan pustej sesji
  - `ErrorState` - stan błędu z możliwością ponowienia
- **Obsługiwane interakcje**:
  - Inicjalizacja sesji przy montowaniu
  - Obsługa zakończenia sesji
  - Obsługa oceny fiszki
- **Obsługiwana walidacja**: Brak (delegowana do potomków)
- **Typy**: `ReviewSessionVM`, `ReviewCardVM`
- **Propsy**:
  - `deckId: string` - identyfikator tali

### ReviewHeader

- **Opis**: Nagłówek widoku zawierający tytuł, opcjonalny licznik postępu oraz przycisk zakończenia sesji.
- **Główne elementy**:
  - Przycisk powrotu (ikona strzałki)
  - Tytuł "Powtórka"
  - Licznik postępu w formacie "n z m"
  - Przycisk "Zakończ"
- **Obsługiwane interakcje**:
  - Kliknięcie przycisku powrotu/zakończenia → wywołanie `onFinish`
- **Obsługiwana walidacja**: Brak
- **Typy**: Brak
- **Propsy**:
  - `currentIndex: number` - indeks aktualnej fiszki (0-based)
  - `totalCards: number` - łączna liczba fiszek w sesji
  - `onFinish: () => void` - callback zakończenia sesji

### ReviewCard

- **Opis**: Komponent wyświetlający aktualną fiszkę z widocznym przodem i tyłem karty.
- **Główne elementy**:
  - Sekcja "Pytanie" (front)
  - Sekcja "Odpowiedź" (back)
  - Wizualne rozdzielenie obu sekcji
- **Obsługiwane interakcje**: Brak (tylko wyświetlanie)
- **Obsługiwana walidacja**: Brak
- **Typy**: `ReviewCardVM`
- **Propsy**:
  - `card: ReviewCardVM` - dane fiszki do wyświetlenia

### GradeButtons

- **Opis**: Zestaw 6 przycisków do oceny fiszki w skali 0-5. Przyciski są ułożone w logicznej kolejności z opisami trudności.
- **Główne elementy**:
  - 6 przycisków z numerami 0-5
  - Etykiety opisujące znaczenie każdej oceny
  - Wskaźnik ładowania podczas wysyłania oceny
- **Obsługiwane interakcje**:
  - Kliknięcie przycisku oceny → wywołanie `onGrade(grade)`
  - Obsługa klawiatury (focus, Enter/Space)
- **Obsługiwana walidacja**: Brak (ocena jest zawsze w zakresie 0-5)
- **Typy**: `ReviewGrade`
- **Propsy**:
  - `onGrade: (grade: ReviewGrade) => void` - callback po wyborze oceny
  - `isSubmitting: boolean` - czy trwa wysyłanie oceny
  - `disabled: boolean` - czy przyciski są zablokowane

### EmptyReviewState

- **Opis**: Ekran wyświetlany gdy talia nie ma fiszek do powtórki.
- **Główne elementy**:
  - Ikona (np. check lub calendar)
  - Komunikat "Brak fiszek do powtórki"
  - Opis sytuacji
  - Przycisk "Powrót do tali"
- **Obsługiwane interakcje**:
  - Kliknięcie przycisku → wywołanie `onBack`
- **Obsługiwana walidacja**: Brak
- **Typy**: Brak
- **Propsy**:
  - `onBack: () => void` - callback powrotu do tali

### ErrorState

- **Opis**: Ekran błędu z możliwością ponowienia operacji.
- **Główne elementy**:
  - Ikona błędu
  - Komunikat błędu
  - Przycisk "Spróbuj ponownie"
  - Przycisk "Powrót do tali"
- **Obsługiwane interakcje**:
  - Kliknięcie "Spróbuj ponownie" → wywołanie `onRetry`
  - Kliknięcie "Powrót" → wywołanie `onBack`
- **Obsługiwana walidacja**: Brak
- **Typy**: Brak
- **Propsy**:
  - `message: string` - komunikat błędu
  - `onRetry: () => void` - callback ponowienia
  - `onBack: () => void` - callback powrotu

## 5. Typy

### Istniejące typy (src/types.ts)

```typescript
// DTO z API
type ReviewCardDTO = Pick<Database["public"]["Tables"]["cards"]["Row"], "id" | "front" | "back">;

interface ReviewSessionDTO {
  cards: ReviewCardDTO[];
}

interface ReviewAnswerCommand {
  grade: 0 | 1 | 2 | 3 | 4 | 5;
}

interface ReviewAnswerResponseDTO {
  next_review_at: string;
  interval_days: number;
  ease_factor: number;
}
```

### Nowe typy (src/components/review-session/types.ts)

```typescript
// Typ oceny SM-2
type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5;

// ViewModel dla fiszki w sesji
interface ReviewCardVM {
  id: string;
  front: string;
  back: string;
}

// ViewModel dla stanu sesji
interface ReviewSessionVM {
  cards: ReviewCardVM[];
  currentIndex: number;
  totalCards: number;
}

// Stan sesji powtórek
type ReviewSessionStatus = "loading" | "empty" | "active" | "error";

// Propsy głównego widoku
interface ReviewSessionViewProps {
  deckId: string;
}

// Opcje hooka useReviewSession
interface UseReviewSessionOptions {
  deckId: string;
  onUnauthorized?: () => void;
  onDeckNotFound?: () => void;
}

// Wynik hooka useReviewSession
interface UseReviewSessionResult {
  // Stan
  status: ReviewSessionStatus;
  session: ReviewSessionVM | null;
  currentCard: ReviewCardVM | null;
  error: string | null;
  isSubmitting: boolean;

  // Akcje
  submitGrade: (grade: ReviewGrade) => Promise<void>;
  retry: () => Promise<void>;
}
```

### Mapowanie DTO → ViewModel

```typescript
function mapCardToViewModel(dto: ReviewCardDTO): ReviewCardVM {
  return {
    id: dto.id,
    front: dto.front,
    back: dto.back,
  };
}

function mapSessionToViewModel(dto: ReviewSessionDTO): ReviewSessionVM {
  const cards = dto.cards.map(mapCardToViewModel);
  return {
    cards,
    currentIndex: 0,
    totalCards: cards.length,
  };
}
```

## 6. Zarządzanie stanem

### Custom hook: useReviewSession

Hook zarządza pełnym cyklem życia sesji powtórek:

```typescript
function useReviewSession(options: UseReviewSessionOptions): UseReviewSessionResult;
```

**Stan wewnętrzny:**

- `status: ReviewSessionStatus` - aktualny status sesji
- `cards: ReviewCardVM[]` - lista fiszek do powtórki
- `currentIndex: number` - indeks aktualnie wyświetlanej fiszki
- `error: string | null` - komunikat błędu
- `isSubmitting: boolean` - czy trwa wysyłanie oceny

**Logika:**

1. Przy montowaniu wywołuje `startSession()` (POST `/v1/decks/{deckId}/reviews/start`)
2. Jeśli API zwróci pustą listę → status "empty"
3. Jeśli API zwróci fiszki → status "active", wyświetl pierwszą fiszkę
4. Po ocenie fiszki (`submitGrade`):
   - Ustaw `isSubmitting = true`
   - Wyślij POST `/v1/reviews/{cardId}/answer`
   - Przy sukcesie: zwiększ `currentIndex`
   - Jeśli to była ostatnia fiszka → powrót do tali
   - Przy błędzie: wyświetl komunikat, nie przechodź dalej
5. `retry()` ponawia inicjalizację sesji

**Obsługa błędów:**

- 401 → wywołaj `onUnauthorized()`
- 404 → wywołaj `onDeckNotFound()` lub ustaw status "error"
- Inne błędy → ustaw status "error" z komunikatem

## 7. Integracja API

### Moduł API (src/components/review-session/api.ts)

```typescript
// Klasa błędu API
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Rozpoczęcie sesji
async function startReviewSession(deckId: string): Promise<ReviewSessionDTO> {
  const response = await fetch(`/api/v1/decks/${deckId}/reviews/start`, {
    method: "POST",
    credentials: "include",
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Nie udało się rozpocząć sesji", response.status, data.details);
  }

  return response.json();
}

// Wysłanie oceny
async function submitAnswer(cardId: string, grade: ReviewGrade): Promise<ReviewAnswerResponseDTO> {
  const response = await fetch(`/api/v1/reviews/${cardId}/answer`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ grade }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Nie udało się zapisać oceny", response.status, data.details);
  }

  return response.json();
}
```

### Typy żądań i odpowiedzi

| Endpoint                           | Metoda | Request Body     | Response                  |
| ---------------------------------- | ------ | ---------------- | ------------------------- |
| `/v1/decks/{deckId}/reviews/start` | POST   | -                | `ReviewSessionDTO`        |
| `/v1/reviews/{cardId}/answer`      | POST   | `{ grade: 0-5 }` | `ReviewAnswerResponseDTO` |

## 8. Interakcje użytkownika

### Rozpoczęcie sesji

1. Użytkownik klika "Rozpocznij powtórkę" w widoku tali
2. Przekierowanie do `/decks/:deckId/review`
3. Widok wywołuje POST `/reviews/start`
4. Wyświetlenie pierwszej fiszki lub stanu pustego

### Ocena fiszki

1. Użytkownik widzi pytanie (front) i odpowiedź (back)
2. Klika jeden z przycisków oceny (0-5)
3. Przycisk pokazuje stan ładowania
4. Po potwierdzeniu zapisu → przejście do następnej fiszki
5. Po ostatniej fiszce → automatyczny powrót do tali

### Zakończenie sesji

1. Użytkownik klika przycisk "Zakończ" w dowolnym momencie
2. Natychmiastowe przekierowanie do `/decks/:deckId`
3. Brak ekranu podsumowania (zgodnie z PRD)

### Obsługa błędu zapisu

1. Błąd podczas wysyłania oceny
2. Wyświetlenie komunikatu błędu (toast)
3. Przyciski oceny ponownie aktywne
4. Użytkownik może ponowić ocenę

## 9. Warunki i walidacja

### Walidacja na poziomie API (już zaimplementowana)

- `grade` musi być liczbą całkowitą 0-5
- `cardId` musi być poprawnym UUID
- Karta musi mieć status "accepted"
- Karta musi należeć do użytkownika

### Walidacja na poziomie UI

- **GradeButtons**: Brak walidacji - przyciski generują tylko wartości 0-5
- **Blokada przycisków**: Podczas `isSubmitting` wszystkie przyciski są zablokowane
- **Stan sesji**: Komponenty renderowane warunkowo na podstawie `status`

### Wpływ na stan interfejsu

| Warunek                 | Wpływ na UI                          |
| ----------------------- | ------------------------------------ |
| `status === "loading"`  | Wyświetl skeleton/spinner            |
| `status === "empty"`    | Wyświetl EmptyReviewState            |
| `status === "error"`    | Wyświetl ErrorState                  |
| `status === "active"`   | Wyświetl ReviewCard + GradeButtons   |
| `isSubmitting === true` | Zablokuj GradeButtons, pokaż spinner |

## 10. Obsługa błędów

### Błędy HTTP

| Kod | Przyczyna           | Obsługa UI                         |
| --- | ------------------- | ---------------------------------- |
| 401 | Brak autoryzacji    | Przekierowanie do `/login`         |
| 404 | Talia nie istnieje  | Toast + przekierowanie do `/decks` |
| 400 | Nieprawidłowa ocena | Toast z komunikatem błędu          |
| 500 | Błąd serwera        | ErrorState z opcją ponowienia      |

### Błędy sieciowe

- Timeout → wyświetl komunikat "Sprawdź połączenie internetowe"
- Brak połączenia → jak wyżej

### Błędy zapisu oceny

- Nie przechodź do następnej fiszki bez potwierdzonego zapisu
- Wyświetl toast z komunikatem błędu
- Zachowaj aktualną fiszkę na ekranie
- Pozwól na ponowną próbę oceny

### Przypadki brzegowe

- Pusta sesja (0 fiszek) → EmptyReviewState
- Ostatnia fiszka → po ocenie automatyczny powrót do tali
- Błąd przy starcie → ErrorState z przyciskami Retry i Back

## 11. Kroki implementacji

1. **Utworzenie struktury plików**
   - `src/pages/decks/[deckId]/review.astro`
   - `src/components/review-session/ReviewSessionView.tsx`
   - `src/components/review-session/types.ts`
   - `src/components/review-session/api.ts`
   - `src/components/review-session/hooks/useReviewSession.ts`

2. **Implementacja typów**
   - Definicja `ReviewGrade`, `ReviewCardVM`, `ReviewSessionVM`
   - Definicja `ReviewSessionStatus`, `UseReviewSessionOptions`, `UseReviewSessionResult`
   - Funkcje mapujące DTO → ViewModel

3. **Implementacja modułu API**
   - Klasa `ApiError`
   - Funkcja `startReviewSession(deckId)`
   - Funkcja `submitAnswer(cardId, grade)`

4. **Implementacja hooka useReviewSession**
   - Stan sesji i nawigacji
   - Logika inicjalizacji sesji
   - Logika wysyłania oceny
   - Obsługa błędów i retry

5. **Implementacja komponentów UI**
   - `EmptyReviewState` - prosty komponent informacyjny
   - `ErrorState` - reużywalny komponent błędu (może wykorzystać istniejący z deck-detail)
   - `ReviewCard` - wyświetlanie fiszki
   - `GradeButtons` - przyciski oceny z opisami
   - `ReviewHeader` - nagłówek z postępem i nawigacją

6. **Implementacja ReviewSessionView**
   - Integracja hooka useReviewSession
   - Renderowanie warunkowe na podstawie statusu
   - Obsługa nawigacji (finish, back)

7. **Utworzenie strony Astro**
   - Layout z tytułem strony
   - Przekazanie deckId do komponentu React
   - Dyrektywa `client:load`

8. **Stylowanie**
   - Zastosowanie Tailwind zgodnie z konwencją projektu
   - Responsywność (mobile-first)
   - Dostępność (aria-labels, focus states)

9. **Testy manualne**
   - Rozpoczęcie sesji z fiszkami
   - Rozpoczęcie sesji bez fiszek (pusta talia / brak due cards)
   - Ocena wszystkich fiszek (przejście przez całą sesję)
   - Zakończenie sesji w trakcie
   - Obsługa błędów (symulacja błędu sieci)
   - Dostępność (nawigacja klawiaturą)
