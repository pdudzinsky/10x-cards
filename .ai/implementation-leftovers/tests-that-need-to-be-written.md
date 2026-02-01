# Testy jednostkowe do implementacji

Lista elementów aplikacji wymagających pokrycia testami jednostkowymi, uporządkowana według priorytetu (od najważniejszych).

---
review-session-view-implementation-plan.md
## Priorytet 1: Funkcje mapujące (Mappers)w

### 1.1 `src/components/review-session/mappers.ts`

#### Funkcje do przetestowania:

- `mapCardToViewModel(dto: ReviewCardDTO): ReviewCardVM`
- `mapSessionToViewModel(dto: ReviewSessionDTO): ReviewSessionVM`

#### Na co zwrócić uwagę:

- Poprawność mapowania wszystkich pól (id, front, back)
- Inicjalizacja `currentIndex` na 0
- Poprawne wyliczenie `totalCards` na podstawie długości tablicy
- Pusta tablica cards → totalCards = 0
- Mapowanie wielu kart w sesji
- Niezmienność oryginalnego DTO (immutability)

#### Przykładowe przypadki testowe:

```typescript
// mapCardToViewModel
- DTO z wszystkimi polami → VM z tymi samymi wartościami
- Zachowanie typów danych

// mapSessionToViewModel
- DTO z pustą tablicą cards → VM z pustą tablicą i totalCards=0
- DTO z 3 kartami → VM z 3 kartami, currentIndex=0, totalCards=3
- Każda karta w tablicy jest poprawnie zmapowana
```

---

### 1.2 `src/components/deck-detail/types.ts`

#### Funkcje do przetestowania:

- `mapDeckToViewModel(dto: DeckDetailDTO): DeckDetailVM`
- `mapCardToViewModel(dto: CardListItemDTO): CardListItemVM`
- `mapCardsToViewModel(dtos: CardListItemDTO[]): CardListItemVM[]`

#### Na co zwrócić uwagę:

- Snake_case → camelCase transformacja (`due_cards_count` → `dueCardsCount`)
- Obsługa nullable fields: `last_used_at`, `next_review_at`
- `null` z API → `undefined` w ViewModelu
- Poprawność mapowania statusu ("unverified" | "accepted")
- Pusta tablica → pusta tablica (nie null/undefined)
- Zachowanie dat w formacie ISO string

#### Przykładowe przypadki testowe:

```typescript
// mapDeckToViewModel
- DTO z last_used_at = null → VM z lastUsedAt = undefined
- DTO z last_used_at = "2024-01-01" → VM z lastUsedAt = "2024-01-01"
- Poprawna transformacja snake_case → camelCase

// mapCardToViewModel
- DTO z next_review_at = null → VM z nextReviewAt = undefined
- DTO z next_review_at = "2024-01-01" → VM z nextReviewAt = "2024-01-01"
- Zachowanie wartości status bez modyfikacji

// mapCardsToViewModel
- Pusta tablica → pusta tablica
- Tablica z 3 elementami → 3 zmapowane elementy
- Każdy element poprawnie transformowany
```

---

## Priorytet 2: Walidacja w hookach

### 2.1 `src/components/ai-generate/hooks/useAIGenerate.ts`

#### Funkcje do wyekstrahowania i przetestowania:

**Walidacja tekstu źródłowego:**

```typescript
// Obecna logika w setSourceText() - wyekstrahować do:
validateSourceText(text: string): { isValid: boolean; error?: string }
```

#### Na co zwrócić uwagę:

- MIN_TEXT_LENGTH = 50 znaków (po trim)
- MAX_TEXT_LENGTH = 10000 znaków (przed trim)
- Trimowanie tylko do sprawdzenia minimalnej długości
- Różne komunikaty błędów dla różnych przypadków

#### Przykładowe przypadki testowe:

```typescript
// Walidacja długości
- tekst pusty → valid (brak błędu, dopóki user nie zacznie pisać)
- tekst "   " (same spacje) → valid (0 po trim)
- tekst 49 znaków → error "Tekst musi mieć co najmniej 50 znaków"
- tekst 50 znaków → valid
- tekst 10000 znaków → valid
- tekst 10001 znaków → error "Tekst nie może przekraczać 10 000 znaków"
- tekst "hello    " (whitespace na końcu) → trimmed length check
```

**Mapowanie kodów HTTP na typy błędów:**

```typescript
mapErrorToType(status: number): AIGenerateError["type"]
```

#### Na co zwrócić uwagę:

- Wszystkie zdefiniowane kody: 400, 401, 403, 404, 502
- Default case → "unknown"
- Zwracany typ musi być zgodny z union type

#### Przykładowe przypadki testowe:

```typescript
- 400 → "validation"
- 401 → "unauthorized"
- 403 → "limit_exceeded"
- 404 → "not_found"
- 502 → "generation_failed"
- 500 → "unknown"
- 999 → "unknown"
- 0 → "unknown"
```

**Generowanie komunikatów błędów:**

```typescript
getErrorMessage(errorType: AIGenerateError["type"], apiMessage?: string): string
```

#### Na co zwrócić uwagę:

- Fallback do domyślnych komunikatów
- Użycie apiMessage dla type="validation"
- Komunikaty w języku polskim
- Wszystkie możliwe typy błędów obsłużone

#### Przykładowe przypadki testowe:

```typescript
- "validation" bez apiMessage → "Tekst musi mieć od 50 do 10 000 znaków"
- "validation" z apiMessage → zwraca apiMessage
- "limit_exceeded" → "Przekroczono dzienny limit generacji"
- "not_found" → "Talia nie została znaleziona"
- "generation_failed" → "Błąd generacji AI. Spróbuj ponownie"
- "unauthorized" → "Musisz być zalogowany"
- "unknown" → "Wystąpił nieoczekiwany błąd. Spróbuj ponownie"
```

---

### 2.2 `src/components/deck-detail/hooks/useCardForm.ts`

#### Funkcja do przetestowania:

- Logika walidacji w `validate(): boolean`

#### Na co zwrócić uwagę:

- MAX_FRONT_LENGTH = 200 znaków
- MAX_BACK_LENGTH = 500 znaków
- Trimowanie przed walidacją
- Zwracane komunikaty błędów
- Funkcja zwraca boolean + ustawia errors w state
- Wszystkie edge cases (puste, samo spacje, za długie)

#### Przykładowe przypadki testowe:

```typescript
// Front field
- front = "" → error "Przód fiszki nie może być pusty"
- front = "   " → error "Przód fiszki nie może być pusty"
- front = "a".repeat(200) → valid
- front = "a".repeat(201) → error z informacją o limicie
- front = "  hello  " → valid (trimmed: 5 znaków)

// Back field
- back = "" → error "Tył fiszki nie może być pusty"
- back = "   " → error "Tył fiszki nie może być pusty"
- back = "a".repeat(500) → valid
- back = "a".repeat(501) → error z informacją o limicie

// Kombinacje
- oba pola valid → zwraca true, errors = {}
- front invalid, back valid → zwraca false, errors.front ustawiony
- oba invalid → zwraca false, oba errors ustawione
- po błędzie, poprawienie pola → error dla tego pola wyczyszczony
```

---

## Priorytet 3: Komponenty z izolowaną logiką ✅

### 3.1 `src/components/auth/PasswordInput.tsx` ✅

#### Funkcjonalność do przetestowania:

- Toggle visibility (showPassword state)
- Dynamiczny aria-label
- Propagacja onChange
- Disabled state

#### Na co zwrócić uwagę:

- Initial state: `type="password"`, ikona Eye
- Po kliknięciu toggle: `type="text"`, ikona EyeOff
- aria-label zmienia się: "Pokaż hasło" / "Ukryj hasło"
- Disabled prop blokuje przycisk toggle
- onChange wywołany z poprawną wartością
- Props aria-\* przekazane do Input

#### Przykładowe przypadki testowe:

```typescript
// Renderowanie
- renderuje input type="password" domyślnie
- renderuje przycisk toggle z ikoną Eye
- aria-label przycisku = "Pokaż hasło"

// Toggle visibility
- kliknięcie przycisku → type zmienia się na "text"
- kliknięcie przycisku → ikona zmienia się na EyeOff
- kliknięcie przycisku → aria-label = "Ukryj hasło"
- ponowne kliknięcie → powrót do type="password"

// Props
- disabled=true → przycisk toggle disabled
- onChange propaguje wartość z input
- aria-invalid przekazane do Input
- aria-describedby przekazane do Input
- autoComplete przekazane do Input

// Accessibility
- przycisk ma type="button" (nie submit)
- aria-label jest zawsze ustawiony
```

---

## Priorytet 4: Zarządzanie stanem ✅

### 4.1 `src/components/deck-detail/hooks/useDialogs.ts` ✅

#### Funkcjonalność do przetestowania:

- Open/close dla każdego dialogu
- Izolacja stanów dialogów
- Zachowanie cardId dla deleteCard

#### Na co zwrócić uwagę:

- Initial state: wszystkie dialogi closed
- openDeleteCard(id) zapisuje cardId
- closeDeleteCard() czyści cardId (null)
- Otworzenie jednego dialogu nie wpływa na inne
- Funkcje są stabilne (useCallback)

#### Przykładowe przypadki testowe:

```typescript
// DeleteDeck dialog
- initial: deleteDeck = false
- openDeleteDeck() → deleteDeck = true
- closeDeleteDeck() → deleteDeck = false

// DeleteCard dialog
- initial: deleteCard = {isOpen: false, cardId: null}
- openDeleteCard("abc-123") → {isOpen: true, cardId: "abc-123"}
- closeDeleteCard() → {isOpen: false, cardId: null}
- openDeleteCard("xyz") → zapisuje poprawne ID

// RejectAll dialog
- initial: rejectAll = false
- openRejectAll() → rejectAll = true
- closeRejectAll() → rejectAll = false

// Izolacja
- otwarcie deleteDeck nie zmienia deleteCard ani rejectAll
- zamknięcie deleteCard nie wpływa na inne dialogi
- wielokrotne open/close tego samego dialogu działa poprawnie
```

---

## Priorytet 5: Komponenty pomocnicze (w razie potrzeby)

### 5.1 `src/components/auth/FormError.tsx`

#### Na co zwrócić uwagę:

- Conditional rendering (tylko gdy error istnieje)
- Poprawne wyświetlenie komunikatu
- Styling error state
- Accessibility attributes (role="alert"?)

---

## Ogólne zasady testowania

### Setup testów:

- Vitest jako test runner
- @testing-library/react dla komponentów
- @testing-library/user-event dla interakcji
- Nie mockować React hooks (useState, useCallback) - testować zachowanie

### Dobre praktyki:

1. **Mappers**: Test pure functions, focus na edge cases (null, undefined, empty arrays)
2. **Walidatory**: Test wszystkie boundary conditions (49, 50, 51 dla limitu 50)
3. **Komponenty**: Test user interactions, accessibility, prop forwarding
4. **Hooks**: Test returned values i state changes, nie implementation details

### Czego unikać:

- Testowania implementacji React (useState, useEffect internals)
- Testowania hooków z API calls (lepsze dla integration tests)
- Snapshots dla prostych komponentów
- Mocków tam gdzie można użyć prawdziwych danych

### Coverage target:

- Mappers: 100% (pure functions)
- Walidatory: 100% (critical business logic)
- Komponenty: 80%+ (fokus na logikę, nie styling)
- Hooks: 70%+ (bez side effects jak API calls)

---

## Kolejność implementacji

1. **Tydzień 1**: Mappers (review-session + deck-detail)
2. **Tydzień 2**: Walidatory (useAIGenerate logic)
3. **Tydzień 3**: useCardForm validation + useDialogs
4. **Tydzień 4**: PasswordInput component
5. **Później**: FormError i inne pomocnicze komponenty w miarę potrzeb

---

## Notatki

- **Refactoring**: Część logiki z hooków (jak validateForm) warto wyekstrahować do osobnych funkcji przed testowaniem
- **Integration tests**: API calls, pełne flow użytkownika → osobny plan testów E2E/integracyjnych
- **MSW**: Przygotować do testów integracyjnych, nie do unit testów
- **Test utilities**: Rozważyć stworzenie helpers dla typowych scenariuszy (np. renderWithProviders jeśli będą contexty)
