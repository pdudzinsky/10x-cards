# Plan implementacji widoku Szczegóły tali

## 1. Przegląd

Widok szczegółów tali (`/decks/:deckId`) to centralny punkt pracy z talią w aplikacji 10x-cards. Umożliwia użytkownikowi:

- Przeglądanie informacji o talii (nazwa, liczba fiszek do powtórki)
- Zarządzanie fiszkami: dodawanie, edycja, usuwanie
- Weryfikację fiszek wygenerowanych przez AI (pojedyncza i masowa)
- Nawigację do edycji tali, generowania AI i sesji powtórek
- Usunięcie tali

Widok łączy w sobie funkcjonalności opisane w PRD sekcje 3.3-3.7 oraz user stories US-005 do US-013.

## 2. Routing widoku

- **Ścieżka**: `/decks/[deckId]`
- **Plik**: `src/pages/decks/[deckId].astro`
- **Parametr**: `deckId` - UUID tali
- **Ochrona**: wymaga autentykacji (middleware)

## 3. Struktura komponentów

```
DeckDetailPage (Astro)
└── DeckDetailView (React, client:load)
    ├── LoadingSpinner (stan ładowania)
    ├── ErrorScreen (błąd 5xx/sieć)
    ├── NotFoundScreen (błąd 404)
    └── (załadowany stan)
        ├── DeckHeader
        │   ├── BackButton
        │   ├── DeckInfo (nazwa + badge due_cards_count)
        │   └── DeckActions
        │       ├── Button "Edytuj"
        │       ├── Button "Usuń"
        │       └── Button "Rozpocznij powtórkę"
        ├── CardSection
        │   ├── CardSectionHeader
        │   │   ├── Tytuł sekcji
        │   │   ├── CardStatusFilter
        │   │   └── CardSectionActions
        │   │       ├── Button "Dodaj fiszkę"
        │   │       └── Button "Generuj fiszki"
        │   ├── BulkActions (warunkowy)
        │   ├── AddCardForm (warunkowy)
        │   ├── EmptyCardList (warunkowy)
        │   └── CardList
        │       └── CardItem[] (tryb read/edit)
        ├── DeleteDeckDialog
        ├── DeleteCardDialog
        └── RejectAllDialog
```

## 4. Szczegóły komponentów

### 4.1 DeckDetailPage (Astro)

**Opis**: Strona Astro pobierająca `deckId` z parametrów URL i renderująca główny komponent React.

**Główne elementy**:

- Layout z nagłówkiem aplikacji
- Komponent `DeckDetailView` z atrybutem `client:load`

**Propsy przekazywane do DeckDetailView**:

```typescript
interface DeckDetailViewProps {
  deckId: string;
}
```

---

### 4.2 DeckDetailView

**Opis**: Główny komponent React zarządzający całym stanem widoku. Odpowiada za pobieranie danych, obsługę błędów i koordynację akcji.

**Główne elementy**:

- Warunkowe renderowanie stanów: loading, error, notFound, loaded
- DeckHeader, CardSection, dialogi

**Obsługiwane zdarzenia**:

- Inicjalne pobranie danych (useEffect)
- Zmiana filtra statusu
- Wszystkie akcje CRUD na fiszki i talię

**Typy**:

- `DeckDetailDTO` - dane tali
- `CardListItemDTO[]` - lista fiszek
- `CardStatusFilter` - aktualny filtr

**Stan wewnętrzny** (zarządzany przez `useDeckDetail`):

```typescript
interface DeckDetailState {
  deck: DeckDetailDTO | null;
  cards: CardListItemDTO[];
  statusFilter: CardStatusFilter;
  isLoading: boolean;
  isCardsLoading: boolean;
  error: string | null;
  isNotFound: boolean;
}
```

---

### 4.3 DeckHeader

**Opis**: Nagłówek widoku z informacjami o talii i głównymi akcjami.

**Główne elementy**:

- `Button` - powrót do listy (ikona strzałki + tekst)
- `h1` - nazwa tali
- `Badge` - liczba fiszek do powtórki
- `Button` - "Edytuj" (primary)
- `Button` - "Usuń" (destructive)
- `Button` - "Rozpocznij powtórkę" (primary)

**Propsy**:

```typescript
interface DeckHeaderProps {
  deck: DeckDetailDTO;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStartReview: () => void;
}
```

**Obsługiwane zdarzenia**:

- `onClick` na przyciskach

**Walidacja**: Brak

---

### 4.4 CardSection

**Opis**: Sekcja zarządzania fiszkami zawierająca filtr, akcje i listę.

**Główne elementy**:

- CardSectionHeader
- BulkActions (warunkowy)
- AddCardForm (warunkowy)
- CardList lub EmptyCardList

**Propsy**:

```typescript
interface CardSectionProps {
  deckId: string;
  cards: CardListItemDTO[];
  statusFilter: CardStatusFilter;
  isLoading: boolean;
  hasUnverified: boolean;
  onFilterChange: (filter: CardStatusFilter) => void;
  onAddCard: () => void;
  onGenerateAI: () => void;
  onAcceptAll: () => Promise<void>;
  onRejectAll: () => Promise<void>;
  onCardUpdate: (cardId: string, front: string, back: string) => Promise<void>;
  onCardDelete: (cardId: string) => Promise<void>;
  onCardAccept: (cardId: string) => Promise<void>;
  onCardReject: (cardId: string) => Promise<void>;
}
```

---

### 4.5 CardStatusFilter

**Opis**: Przełącznik filtra statusu fiszek.

**Główne elementy**:

- `ToggleGroup` z Shadcn/ui
- 3 opcje: "Wszystkie", "Niezweryfikowane", "Zaakceptowane"

**Propsy**:

```typescript
interface CardStatusFilterProps {
  value: CardStatusFilter;
  onChange: (value: CardStatusFilter) => void;
}
```

**Obsługiwane zdarzenia**:

- `onValueChange` - zmiana filtra

---

### 4.6 BulkActions

**Opis**: Pasek akcji masowych widoczny gdy są fiszki niezweryfikowane.

**Główne elementy**:

- Informacja o liczbie niezweryfikowanych fiszek
- `Button` - "Zaakceptuj wszystkie"
- `Button` - "Odrzuć wszystkie" (destructive)

**Propsy**:

```typescript
interface BulkActionsProps {
  unverifiedCount: number;
  onAcceptAll: () => void;
  onRejectAll: () => void;
  isAccepting: boolean;
  isRejecting: boolean;
}
```

**Walidacja**:

- Komponent renderowany tylko gdy `unverifiedCount > 0`

---

### 4.7 AddCardForm

**Opis**: Inline formularz dodawania nowej fiszki.

**Główne elementy**:

- `Textarea` - pole "Przód" z licznikiem znaków
- `Textarea` - pole "Tył" z licznikiem znaków
- `Button` - "Zapisz"
- `Button` - "Anuluj"
- Komunikaty błędów walidacji

**Propsy**:

```typescript
interface AddCardFormProps {
  onSubmit: (front: string, back: string) => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
}
```

**Obsługiwane zdarzenia**:

- `onSubmit` - walidacja + zapis
- `onCancel` - zamknięcie formularza
- `onChange` - aktualizacja pól

**Walidacja**:

- `front`: niepuste, 1-200 znaków
- `back`: niepuste, 1-500 znaków

---

### 4.8 CardList

**Opis**: Lista fiszek z możliwością edycji inline.

**Główne elementy**:

- Kontener listy
- `CardItem[]` - pojedyncze fiszki

**Propsy**:

```typescript
interface CardListProps {
  cards: CardListItemDTO[];
  editingCardId: string | null;
  onStartEdit: (card: CardListItemDTO) => void;
  onCancelEdit: () => void;
  onSaveEdit: (cardId: string, front: string, back: string) => Promise<void>;
  onDelete: (cardId: string) => void;
  onAccept: (cardId: string) => Promise<void>;
  onReject: (cardId: string) => Promise<void>;
}
```

---

### 4.9 CardItem

**Opis**: Pojedyncza fiszka z dwoma trybami: read i edit.

**Główne elementy (tryb read)**:

- Tekst przodu i tyłu fiszki
- Badge statusu (opcjonalnie)
- Akcje zależne od statusu:
  - Dla `unverified`: "Zaakceptuj", "Edytuj", "Odrzuć"
  - Dla `accepted`: "Edytuj", "Usuń"

**Główne elementy (tryb edit)**:

- `Textarea` - przód z licznikiem
- `Textarea` - tył z licznikiem
- `Button` - "Zapisz"
- `Button` - "Anuluj"
- Komunikaty błędów

**Propsy**:

```typescript
interface CardItemProps {
  card: CardListItemDTO;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (front: string, back: string) => Promise<void>;
  onDelete: () => void;
  onAccept: () => Promise<void>;
  onReject: () => Promise<void>;
}
```

**Walidacja (tryb edit)**:

- `front`: niepuste, 1-200 znaków
- `back`: niepuste, 1-500 znaków

---

### 4.10 DeleteDeckDialog

**Opis**: Dialog potwierdzenia usunięcia tali.

**Główne elementy**:

- `AlertDialog` z Shadcn/ui
- Tytuł i treść ostrzeżenia
- `Button` - "Anuluj"
- `Button` - "Usuń" (destructive, z loaderem)

**Propsy**:

```typescript
interface DeleteDeckDialogProps {
  isOpen: boolean;
  deckName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isDeleting: boolean;
}
```

---

### 4.11 DeleteCardDialog

**Opis**: Dialog potwierdzenia usunięcia fiszki.

**Propsy**:

```typescript
interface DeleteCardDialogProps {
  isOpen: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isDeleting: boolean;
}
```

---

### 4.12 RejectAllDialog

**Opis**: Dialog potwierdzenia odrzucenia wszystkich niezweryfikowanych fiszek.

**Propsy**:

```typescript
interface RejectAllDialogProps {
  isOpen: boolean;
  count: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
  isDeleting: boolean;
}
```

---

### 4.13 ErrorScreen

**Opis**: Ekran błędu z możliwością ponowienia.

**Propsy**:

```typescript
interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}
```

---

### 4.14 NotFoundScreen

**Opis**: Ekran 404 dla nieistniejącej tali.

**Propsy**:

```typescript
interface NotFoundScreenProps {
  onBack: () => void;
}
```

## 5. Typy

### 5.1 Istniejące DTO (z `src/types.ts`)

```typescript
// Szczegóły tali
type DeckDetailDTO = {
  id: string;
  name: string;
  created_at: string;
  last_used_at: string | null;
  due_cards_count: number;
};

// Element listy fiszek
type CardListItemDTO = {
  id: string;
  front: string;
  back: string;
  status: CardStatus; // "unverified" | "accepted"
  next_review_at: string | null;
};

// Odpowiedź listy fiszek
interface CardListResponseDTO {
  items: CardListItemDTO[];
}

// Komendy
type CreateCardCommand = { front: string; back: string };
type UpdateCardCommand = { front: string; back: string };

// Odpowiedzi operacji masowych
interface AcceptAllResponseDTO {
  accepted: number;
}
interface DeleteUnverifiedResponseDTO {
  deleted: number;
}
```

### 5.2 Nowe typy ViewModel

```typescript
// Filtr statusu fiszek
type CardStatusFilter = "all" | "unverified" | "accepted";

// Stan formularza fiszki (tworzenie/edycja)
interface CardFormState {
  front: string;
  back: string;
  errors: {
    front?: string;
    back?: string;
  };
}

// Stan dialogów
interface DialogsState {
  deleteDeck: boolean;
  deleteCard: { isOpen: boolean; cardId: string | null };
  rejectAll: boolean;
}

// Stan operacji asynchronicznych
interface AsyncOperationState {
  isLoading: boolean;
  error: string | null;
}
```

## 6. Zarządzanie stanem

### 6.1 Hook `useDeckDetail`

Główny hook zarządzający stanem widoku szczegółów tali.

```typescript
interface UseDeckDetailReturn {
  // Stan
  deck: DeckDetailDTO | null;
  cards: CardListItemDTO[];
  statusFilter: CardStatusFilter;
  isLoading: boolean;
  isCardsLoading: boolean;
  error: string | null;
  isNotFound: boolean;

  // Computed
  hasUnverified: boolean;
  unverifiedCount: number;

  // Akcje
  setStatusFilter: (filter: CardStatusFilter) => void;
  refetch: () => Promise<void>;

  // CRUD talia
  deleteDeck: () => Promise<void>;

  // CRUD fiszki
  createCard: (front: string, back: string) => Promise<void>;
  updateCard: (cardId: string, front: string, back: string) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  acceptCard: (cardId: string) => Promise<void>;
  rejectCard: (cardId: string) => Promise<void>;

  // Operacje masowe
  acceptAll: () => Promise<void>;
  rejectAll: () => Promise<void>;
}

function useDeckDetail(deckId: string): UseDeckDetailReturn;
```

### 6.2 Hook `useCardForm`

Hook do zarządzania formularzem fiszki (tworzenie i edycja).

```typescript
interface UseCardFormReturn {
  form: CardFormState;
  setField: (field: "front" | "back", value: string) => void;
  validate: () => boolean;
  reset: () => void;
  setInitialValues: (front: string, back: string) => void;
}

function useCardForm(): UseCardFormReturn;
```

### 6.3 Hook `useDialogs`

Hook do zarządzania dialogami potwierdzającymi.

```typescript
interface UseDialogsReturn {
  dialogs: DialogsState;
  openDeleteDeck: () => void;
  closeDeleteDeck: () => void;
  openDeleteCard: (cardId: string) => void;
  closeDeleteCard: () => void;
  openRejectAll: () => void;
  closeRejectAll: () => void;
}

function useDialogs(): UseDialogsReturn;
```

## 7. Integracja API

### 7.1 Pobieranie szczegółów tali

```typescript
// GET /api/v1/decks/{deckId}
// Response: DeckDetailDTO
async function fetchDeck(deckId: string): Promise<DeckDetailDTO>;
```

### 7.2 Usuwanie tali

jesl

```typescript
// DELETE /api/v1/decks/{deckId}
// Response: 204 No Content
async function deleteDeck(deckId: string): Promise<void>;
```

### 7.3 Pobieranie listy fiszek

```typescript
// GET /api/v1/decks/{deckId}/cards?status={filter}
// Response: CardListResponseDTO
async function fetchCards(deckId: string, status: CardStatusFilter): Promise<CardListResponseDTO>;
```

### 7.4 Tworzenie fiszki

```typescript
// POST /api/v1/decks/{deckId}/cards
// Request: CreateCardCommand
// Response: CardDTO (201)
async function createCard(deckId: string, command: CreateCardCommand): Promise<CardDTO>;
```

### 7.5 Edycja fiszki

```typescript
// PATCH /api/v1/cards/{cardId}
// Request: UpdateCardCommand
// Response: CardDTO
async function updateCard(cardId: string, command: UpdateCardCommand): Promise<CardDTO>;
```

### 7.6 Usuwanie fiszki

```typescript
// DELETE /api/v1/cards/{cardId}
// Response: 204 No Content
async function deleteCard(cardId: string): Promise<void>;
```

### 7.7 Akceptacja pojedynczej fiszki

```typescript
// POST /api/v1/cards/{cardId}/accept
// Response: { id: string; status: string; next_review_at: string }
// Idempotentny: jeśli karta jest już zaakceptowana, zwraca 200 z obecnym stanem
async function acceptCard(cardId: string): Promise<{ id: string; status: string; next_review_at: string }>;
```

### 7.8 Akceptacja wszystkich fiszek

```typescript
// POST /api/v1/decks/{deckId}/cards/accept-all
// Response: AcceptAllResponseDTO
async function acceptAllCards(deckId: string): Promise<AcceptAllResponseDTO>;
```

### 7.9 Odrzucenie wszystkich fiszek

```typescript
// DELETE /api/v1/decks/{deckId}/cards/unverified
// Response: DeleteUnverifiedResponseDTO
async function rejectAllCards(deckId: string): Promise<DeleteUnverifiedResponseDTO>;
```

## 8. Interakcje użytkownika

| Interakcja            | Element UI                       | Akcja                                        | Rezultat                   |
| --------------------- | -------------------------------- | -------------------------------------------- | -------------------------- |
| Powrót do listy       | Button w DeckHeader              | `navigate("/decks")`                         | Przekierowanie             |
| Edycja tali           | Button "Edytuj"                  | `navigate("/decks/{id}/edit")`               | Przekierowanie             |
| Usunięcie tali        | Button "Usuń"                    | Otwórz dialog -> potwierdź -> `deleteDeck()` | Redirect do /decks + toast |
| Rozpoczęcie powtórki  | Button "Rozpocznij powtórkę"     | `navigate("/decks/{id}/review")`             | Przekierowanie             |
| Generowanie AI        | Button "Generuj fiszki"          | `navigate("/decks/{id}/ai-generate")`        | Przekierowanie             |
| Zmiana filtra         | ToggleGroup                      | `setStatusFilter()` -> `fetchCards()`        | Odświeżenie listy          |
| Dodanie fiszki        | Button "Dodaj fiszkę"            | Pokaż formularz                              | Formularz inline           |
| Zapis nowej fiszki    | Button "Zapisz" w formularzu     | Walidacja -> `createCard()`                  | Zamknięcie + odświeżenie   |
| Anulowanie dodawania  | Button "Anuluj"                  | Zamknij formularz                            | Ukrycie formularza         |
| Edycja fiszki         | Button "Edytuj" na CardItem      | Przełącz w tryb edycji                       | Formularz inline           |
| Zapis edycji          | Button "Zapisz"                  | Walidacja -> `updateCard()`                  | Tryb read + odświeżenie    |
| Anulowanie edycji     | Button "Anuluj"                  | Przywróć tryb read                           | Oryginalne dane            |
| Usunięcie fiszki      | Button "Usuń" (accepted)         | Dialog -> `deleteCard()`                     | Odświeżenie listy          |
| Akceptacja fiszki     | Button "Zaakceptuj" (unverified) | `acceptCard()`                               | Odświeżenie listy          |
| Odrzucenie fiszki     | Button "Odrzuć" (unverified)     | `rejectCard()`                               | Odświeżenie listy          |
| Akceptacja wszystkich | Button "Zaakceptuj wszystkie"    | `acceptAll()`                                | Odświeżenie listy          |
| Odrzucenie wszystkich | Button "Odrzuć wszystkie"        | Dialog -> `rejectAll()`                      | Odświeżenie listy          |

## 9. Warunki i walidacja

### 9.1 Walidacja formularza fiszki

| Pole  | Warunek          | Komunikat błędu                                 |
| ----- | ---------------- | ----------------------------------------------- |
| front | Niepuste po trim | "Przód fiszki nie może być pusty"               |
| front | Max 200 znaków   | "Przód fiszki może mieć maksymalnie 200 znaków" |
| back  | Niepuste po trim | "Tył fiszki nie może być pusty"                 |
| back  | Max 500 znaków   | "Tył fiszki może mieć maksymalnie 500 znaków"   |

### 9.2 Warunki widoczności elementów

| Element                         | Warunek widoczności                |
| ------------------------------- | ---------------------------------- |
| BulkActions                     | `unverifiedCount > 0`              |
| AddCardForm                     | `isAddFormOpen === true`           |
| EmptyCardList                   | `cards.length === 0 && !isLoading` |
| Button "Zaakceptuj" na CardItem | `card.status === "unverified"`     |
| Button "Odrzuć" na CardItem     | `card.status === "unverified"`     |
| Button "Usuń" na CardItem       | `card.status === "accepted"`       |
| Badge due_cards_count           | `deck.due_cards_count > 0`         |

### 9.3 Warunki blokady akcji

| Akcja                 | Blokada gdy                                 |
| --------------------- | ------------------------------------------- |
| Zapis formularza      | `isSubmitting === true` lub błędy walidacji |
| Usunięcie tali        | `isDeleting === true`                       |
| Akceptacja wszystkich | `isAccepting === true`                      |
| Odrzucenie wszystkich | `isRejecting === true`                      |

## 10. Obsługa błędów

### 10.1 Błędy HTTP

| Kod           | Kontekst                | Obsługa                                           |
| ------------- | ----------------------- | ------------------------------------------------- |
| 401           | Dowolne żądanie         | Redirect do `/login`                              |
| 404           | GET deck                | Wyświetl `NotFoundScreen`                         |
| 404           | GET cards               | Wyświetl `NotFoundScreen`                         |
| 404           | Operacja na fiszce      | Toast "Fiszka nie istnieje", odśwież listę        |
| 400           | Tworzenie/edycja fiszki | Wyświetl błędy przy polach                        |
| 409           | Usunięcie unverified    | Toast "Nie można usunąć niezweryfikowanej fiszki" |
| 500           | Dowolne żądanie         | `ErrorScreen` z "Spróbuj ponownie"                |
| Network error | Dowolne żądanie         | Toast "Błąd połączenia"                           |

### 10.2 Przypadki brzegowe

| Przypadek                          | Obsługa                                      |
| ---------------------------------- | -------------------------------------------- |
| Pusta lista fiszek                 | Wyświetl `EmptyCardList` z CTA               |
| Brak fiszek do powtórki            | Badge nie wyświetla "0", ukryty lub szary    |
| Edycja usuniętej fiszki            | 404 -> zamknij edycję, toast, odśwież        |
| Concurrent edits                   | Ostatni zapis wygrywa                        |
| Utrata połączenia podczas operacji | Toast z błędem, nie zmieniaj lokalnego stanu |

## 11. Kroki implementacji

### Faza 1: Przygotowanie

1. **Endpoint `POST /api/v1/cards/{cardId}/accept`** ✅
   - Zaimplementowany w `src/pages/api/v1/cards/[cardId]/accept.ts`
   - Serwis `acceptCard` w `card.service.ts` gotowy
   - Idempotentny: wielokrotna akceptacja tej samej karty zwraca 200

2. **Utworzenie struktury plików**
   ```
   src/
   ├── pages/decks/[deckId].astro
   └── components/
       └── deck-detail/
           ├── DeckDetailView.tsx
           ├── DeckHeader.tsx
           ├── CardSection.tsx
           ├── CardStatusFilter.tsx
           ├── BulkActions.tsx
           ├── AddCardForm.tsx
           ├── CardList.tsx
           ├── CardItem.tsx
           ├── DeleteDeckDialog.tsx
           ├── DeleteCardDialog.tsx
           ├── RejectAllDialog.tsx
           ├── ErrorScreen.tsx
           ├── NotFoundScreen.tsx
           └── hooks/
               ├── useDeckDetail.ts
               ├── useCardForm.ts
               └── useDialogs.ts
   ```

### Faza 2: Implementacja hooków

3. **Implementacja `useDeckDetail`**
   - Fetch deck i cards
   - Zarządzanie stanem filtra
   - Wszystkie operacje CRUD

4. **Implementacja `useCardForm`**
   - Zarządzanie polami formularza
   - Walidacja
   - Reset i inicjalizacja

5. **Implementacja `useDialogs`**
   - Zarządzanie stanem dialogów

### Faza 3: Implementacja komponentów UI

6. **Implementacja komponentów pomocniczych**
   - ErrorScreen
   - NotFoundScreen
   - LoadingSpinner (jeśli nie istnieje)

7. **Implementacja dialogów**
   - DeleteDeckDialog
   - DeleteCardDialog
   - RejectAllDialog

8. **Implementacja komponentów fiszek**
   - CardItem (tryb read i edit)
   - CardList
   - AddCardForm
   - CardStatusFilter
   - BulkActions

9. **Implementacja sekcji głównych**
   - DeckHeader
   - CardSection

10. **Implementacja głównego widoku**
    - DeckDetailView (integracja wszystkich komponentów)

### Faza 4: Strona Astro i integracja

11. **Utworzenie strony Astro**
    - `src/pages/decks/[deckId].astro`
    - Integracja z layoutem
    - Przekazanie deckId do React

### Faza 5: Testy i poprawki

12. **Testy manualne**
    - Wszystkie interakcje użytkownika
    - Obsługa błędów
    - Stany brzegowe

13. **Poprawki dostępności**
    - Focus management
    - Keyboard navigation
    - ARIA labels

14. **Guard niezapisanych zmian**
    - Ostrzeżenie przed opuszczeniem przy niezapisanych zmianach w formularzu
