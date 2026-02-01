# Plan implementacji widoku Generowanie fiszek AI

## 1. Przegląd

Widok "Generowanie fiszek AI" umożliwia użytkownikowi wygenerowanie fiszek na podstawie wklejonego tekstu w języku polskim. Użytkownik wprowadza tekst (do 10 000 znaków), wybiera liczbę fiszek do wygenerowania (5, 10 lub 20), a następnie uruchamia proces generacji. Po sukcesie użytkownik wraca do widoku szczegółów tali, gdzie nowe fiszki pojawiają się ze statusem "Niezweryfikowane". Widok informuje o pozostałym dziennym limicie generacji oraz obsługuje błędy zgodnie z API.

## 2. Routing widoku

Widok dostępny pod ścieżką: `/decks/:deckId/ai-generate`

Plik strony Astro: `src/pages/decks/[deckId]/ai-generate.astro`

## 3. Struktura komponentów

```
AIGeneratePage (Astro)
└── AIGenerateView (React, client:load)
    ├── AIGenerateHeader
    │   └── Tytuł widoku + przycisk powrotu
    ├── AIGenerateForm
    │   ├── SourceTextArea
    │   │   ├── Label
    │   │   ├── Textarea
    │   │   └── CharacterCounter
    │   ├── CardsCountSelect
    │   │   ├── Label
    │   │   └── Select (5, 10, 20)
    │   ├── LimitInfo
    │   │   └── Informacja o pozostałych generacjach
    │   └── ActionButtons
    │       ├── Button "Generuj" (primary, z loaderem)
    │       └── Button "Anuluj" (secondary)
    └── Toast (komunikaty sukcesu/błędu)
```

## 4. Szczegóły komponentów

### AIGeneratePage (Astro)

- **Opis**: Strona Astro hostująca główny komponent React. Odpowiada za layout i przekazanie `deckId` z parametrów URL.
- **Główne elementy**: `<Layout>`, `<AIGenerateView client:load />`
- **Propsy przekazywane**: `deckId: string`

### AIGenerateView

- **Opis**: Główny kontener widoku zarządzający stanem formularza i komunikacją z API. Wykorzystuje hook `useAIGenerate` do zarządzania logiką.
- **Główne elementy**: `<div>`, `<AIGenerateHeader />`, `<AIGenerateForm />`, `<Toaster />`
- **Obsługiwane interakcje**:
  - Nawigacja wstecz do `/decks/:deckId`
  - Wysyłanie formularza generacji
  - Anulowanie i powrót
- **Obsługiwana walidacja**: Delegowana do `AIGenerateForm` i hooka
- **Typy**: `AIGenerateViewProps`
- **Propsy**: `deckId: string`

### AIGenerateHeader

- **Opis**: Nagłówek widoku z tytułem i przyciskiem powrotu.
- **Główne elementy**: `<div>`, `<Button variant="ghost">`, `<h1>`
- **Obsługiwane interakcje**: Kliknięcie przycisku powrotu (wywołuje `onBack`)
- **Propsy**:
  - `onBack: () => void`

### AIGenerateForm

- **Opis**: Formularz generacji fiszek zawierający wszystkie pola wejściowe i przyciski akcji.
- **Główne elementy**: `<form>`, `<SourceTextArea />`, `<CardsCountSelect />`, `<LimitInfo />`, `<ActionButtons />`
- **Obsługiwane interakcje**:
  - Zmiana tekstu źródłowego
  - Zmiana liczby fiszek
  - Submit formularza
  - Anulowanie
- **Obsługiwana walidacja**:
  - `source_text`: minimum 50 znaków, maksimum 10 000 znaków
  - `cards_count`: wartość musi być 5, 10 lub 20
  - Blokada przycisku gdy `isSubmitting` lub walidacja nie przechodzi
- **Typy**: `AIGenerateFormState`, `AIGenerateFormProps`
- **Propsy**:
  - `formState: AIGenerateFormState`
  - `remainingLimit: number | null`
  - `isSubmitting: boolean`
  - `onSourceTextChange: (text: string) => void`
  - `onCardsCountChange: (count: 5 | 10 | 20) => void`
  - `onSubmit: () => void`
  - `onCancel: () => void`

### SourceTextArea

- **Opis**: Pole tekstowe do wklejenia tekstu źródłowego z licznikiem znaków i walidacją długości.
- **Główne elementy**: `<div>`, `<Label>`, `<Textarea>`, `<span>` (licznik znaków)
- **Obsługiwane interakcje**: Zmiana wartości textarea
- **Obsługiwana walidacja**:
  - Wyświetlanie licznika znaków w formacie "X / 10 000"
  - Wizualne oznaczenie błędu gdy tekst < 50 lub > 10 000 znaków
  - Komunikat błędu pod polem
- **Typy**: `SourceTextAreaProps`
- **Propsy**:
  - `value: string`
  - `onChange: (value: string) => void`
  - `error?: string`
  - `disabled: boolean`

### CardsCountSelect

- **Opis**: Dropdown do wyboru liczby fiszek do wygenerowania.
- **Główne elementy**: `<div>`, `<Label>`, `<Select>` (shadcn/ui)
- **Obsługiwane interakcje**: Wybór opcji z listy
- **Typy**: `CardsCountSelectProps`
- **Propsy**:
  - `value: 5 | 10 | 20`
  - `onChange: (value: 5 | 10 | 20) => void`
  - `disabled: boolean`

### LimitInfo

- **Opis**: Informacja o dziennym limicie generacji i pozostałych użyciach.
- **Główne elementy**: `<div>`, `<span>` z ikoną informacji
- **Obsługiwane interakcje**: Brak (komponent informacyjny)
- **Typy**: `LimitInfoProps`
- **Propsy**:
  - `remainingLimit: number | null`
  - `isLoading: boolean`

### ActionButtons

- **Opis**: Grupa przycisków akcji formularza.
- **Główne elementy**: `<div>`, `<Button variant="default">` (Generuj), `<Button variant="outline">` (Anuluj)
- **Obsługiwane interakcje**:
  - Kliknięcie "Generuj" (submit formularza)
  - Kliknięcie "Anuluj" (powrót do tali)
- **Typy**: `ActionButtonsProps`
- **Propsy**:
  - `isSubmitting: boolean`
  - `isDisabled: boolean`
  - `onSubmit: () => void`
  - `onCancel: () => void`

## 5. Typy

### DTO (z `src/types.ts` - już istniejące)

```typescript
// Request
interface GenerateCardsCommand {
  source_text: string;
  cards_count: 5 | 10 | 20;
}

// Response 201
interface GenerateCardsResponseDTO {
  generated: number;
  remaining_daily_limit: number;
}
```

### ViewModel (nowe w `src/components/ai-generate/types.ts`)

```typescript
/**
 * Stan formularza generacji
 */
interface AIGenerateFormState {
  sourceText: string;
  cardsCount: 5 | 10 | 20;
  errors: {
    sourceText?: string;
  };
}

/**
 * Props głównego widoku
 */
interface AIGenerateViewProps {
  deckId: string;
}

/**
 * Props formularza
 */
interface AIGenerateFormProps {
  formState: AIGenerateFormState;
  remainingLimit: number | null;
  isSubmitting: boolean;
  onSourceTextChange: (text: string) => void;
  onCardsCountChange: (count: 5 | 10 | 20) => void;
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * Props pola tekstowego
 */
interface SourceTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled: boolean;
}

/**
 * Props selecta liczby fiszek
 */
interface CardsCountSelectProps {
  value: 5 | 10 | 20;
  onChange: (value: 5 | 10 | 20) => void;
  disabled: boolean;
}

/**
 * Props informacji o limicie
 */
interface LimitInfoProps {
  remainingLimit: number | null;
  isLoading: boolean;
}

/**
 * Props przycisków akcji
 */
interface ActionButtonsProps {
  isSubmitting: boolean;
  isDisabled: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * Wynik generacji (z API)
 */
interface GenerationResult {
  generated: number;
  remainingDailyLimit: number;
}

/**
 * Błąd API z typowaniem
 */
interface AIGenerateError {
  type: "validation" | "limit_exceeded" | "generation_failed" | "not_found" | "unauthorized" | "unknown";
  message: string;
}
```

## 6. Zarządzanie stanem

### Hook `useAIGenerate`

Lokalizacja: `src/components/ai-generate/hooks/useAIGenerate.ts`

**Stan wewnętrzny:**

- `formState: AIGenerateFormState` - stan formularza (tekst, liczba fiszek, błędy)
- `remainingLimit: number | null` - pozostały limit dzienny (opcjonalnie pobierany z profilu)
- `isSubmitting: boolean` - czy trwa wysyłanie żądania
- `error: AIGenerateError | null` - błąd z ostatniego żądania

**Funkcje:**

- `setSourceText(text: string)` - aktualizuje tekst i waliduje długość
- `setCardsCount(count: 5 | 10 | 20)` - aktualizuje wybraną liczbę fiszek
- `validateForm(): boolean` - waliduje formularz przed wysłaniem
- `submit(): Promise<void>` - wysyła żądanie generacji
- `reset()` - resetuje formularz do stanu początkowego

**Walidacja w hooku:**

- `sourceText.trim().length >= 50` - minimum 50 znaków
- `sourceText.length <= 10000` - maksimum 10 000 znaków

**Obsługa błędów:**

- Mapowanie kodów HTTP na typy błędów
- Ustawianie odpowiednich komunikatów w języku polskim

```typescript
interface UseAIGenerateOptions {
  deckId: string;
  onSuccess: (result: GenerationResult) => void;
  onUnauthorized: () => void;
}

interface UseAIGenerateResult {
  formState: AIGenerateFormState;
  remainingLimit: number | null;
  isSubmitting: boolean;
  error: AIGenerateError | null;
  setSourceText: (text: string) => void;
  setCardsCount: (count: 5 | 10 | 20) => void;
  submit: () => Promise<void>;
  clearError: () => void;
}
```

## 7. Integracja API

### Endpoint

`POST /api/v1/decks/{deckId}/ai-generate`

### Plik API client

Lokalizacja: `src/components/ai-generate/api.ts`

```typescript
import type { GenerateCardsCommand, GenerateCardsResponseDTO } from "../../types";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Generuje fiszki AI dla danej tali
 * POST /api/v1/decks/{deckId}/ai-generate
 */
export async function generateCards(deckId: string, command: GenerateCardsCommand): Promise<GenerateCardsResponseDTO> {
  const response = await fetch(`/api/v1/decks/${deckId}/ai-generate`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Failed to generate cards", response.status, data.details);
  }

  return response.json();
}
```

### Request

```typescript
{
  source_text: string; // 50-10000 znaków (trim przed wysłaniem)
  cards_count: 5 | 10 | 20;
}
```

### Response 201

```typescript
{
  generated: number;
  remaining_daily_limit: number;
}
```

### Kody błędów

| Status | Typ błędu         | Komunikat PL                                                               |
| ------ | ----------------- | -------------------------------------------------------------------------- |
| 400    | validation        | "Tekst musi mieć od 50 do 10 000 znaków" lub "Nieprawidłowa liczba fiszek" |
| 401    | unauthorized      | Przekierowanie do `/login`                                                 |
| 403    | limit_exceeded    | "Przekroczono dzienny limit generacji"                                     |
| 404    | not_found         | "Talia nie została znaleziona"                                             |
| 502    | generation_failed | "Błąd generacji AI. Spróbuj ponownie"                                      |

## 8. Interakcje użytkownika

1. **Wejście na widok** (`/decks/:deckId/ai-generate`)
   - Wyświetlenie pustego formularza
   - Opcjonalnie: pobranie pozostałego limitu z profilu

2. **Wprowadzenie tekstu**
   - Wklejenie lub wpisanie tekstu w textarea
   - Aktualizacja licznika znaków w czasie rzeczywistym
   - Walidacja długości przy każdej zmianie
   - Wyświetlenie błędu jeśli tekst < 50 lub > 10 000 znaków

3. **Wybór liczby fiszek**
   - Kliknięcie na select
   - Wybór opcji: 5, 10 lub 20
   - Domyślna wartość: 10

4. **Kliknięcie "Generuj"**
   - Walidacja formularza
   - Jeśli błędy: wyświetlenie komunikatów
   - Jeśli OK: wyłączenie formularza, wyświetlenie loadera na przycisku
   - Wysłanie żądania POST do API
   - Po sukcesie: toast "Wygenerowano X fiszek", przekierowanie do `/decks/:deckId`
   - Po błędzie: toast z komunikatem błędu, odblokowanie formularza

5. **Kliknięcie "Anuluj"**
   - Toast "Anulowano generację" (opcjonalnie)
   - Przekierowanie do `/decks/:deckId`
   - Tekst źródłowy nie jest zapisywany (wymaganie bezpieczeństwa)

6. **Kliknięcie przycisku powrotu (strzałka)**
   - Przekierowanie do `/decks/:deckId`
   - Bez toasta

## 9. Warunki i walidacja

### Walidacja po stronie klienta

| Pole        | Warunek                    | Komunikat błędu                            | Kiedy sprawdzane   |
| ----------- | -------------------------- | ------------------------------------------ | ------------------ |
| source_text | `text.trim().length >= 50` | "Tekst musi mieć co najmniej 50 znaków"    | onChange, onSubmit |
| source_text | `text.length <= 10000`     | "Tekst nie może przekraczać 10 000 znaków" | onChange, onSubmit |
| cards_count | `value in [5, 10, 20]`     | N/A (select z ograniczonymi opcjami)       | -                  |

### Warunki blokady przycisku "Generuj"

Przycisk jest zablokowany (`disabled`) gdy:

- `isSubmitting === true` (trwa wysyłanie)
- `sourceText.trim().length < 50` (za krótki tekst)
- `sourceText.length > 10000` (za długi tekst)

### Wizualne oznaczenie błędów

- Textarea z czerwoną ramką gdy błąd walidacji
- Komunikat błędu pod textarea w kolorze czerwonym
- Licznik znaków zmienia kolor na czerwony gdy > 10 000

## 10. Obsługa błędów

### Błędy walidacji (400)

- Wyświetlenie toasta z komunikatem błędu
- Formularz pozostaje aktywny
- Użytkownik może poprawić dane

### Brak autoryzacji (401)

- Automatyczne przekierowanie do `/login`
- Brak toasta (użytkownik widzi stronę logowania)

### Przekroczony limit (403)

- Wyświetlenie toasta: "Przekroczono dzienny limit generacji"
- Formularz pozostaje aktywny
- Informacja o limicie aktualizowana do 0

### Talia nie znaleziona (404)

- Wyświetlenie toasta: "Talia nie została znaleziona"
- Przekierowanie do `/decks`

### Błąd generacji AI (502)

- Wyświetlenie toasta: "Błąd generacji AI. Spróbuj ponownie"
- Formularz pozostaje aktywny
- Użytkownik może ponowić próbę

### Błąd sieci / nieznany błąd

- Wyświetlenie toasta: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie"
- Formularz pozostaje aktywny

## 11. Kroki implementacji

1. **Utworzenie struktury plików**
   - `src/pages/decks/[deckId]/ai-generate.astro`
   - `src/components/ai-generate/AIGenerateView.tsx`
   - `src/components/ai-generate/AIGenerateHeader.tsx`
   - `src/components/ai-generate/AIGenerateForm.tsx`
   - `src/components/ai-generate/SourceTextArea.tsx`
   - `src/components/ai-generate/CardsCountSelect.tsx`
   - `src/components/ai-generate/LimitInfo.tsx`
   - `src/components/ai-generate/ActionButtons.tsx`
   - `src/components/ai-generate/hooks/useAIGenerate.ts`
   - `src/components/ai-generate/api.ts`
   - `src/components/ai-generate/types.ts`

2. **Instalacja komponentu Select z shadcn/ui**

   ```bash
   npx shadcn@latest add select
   ```

3. **Instalacja komponentu Toast z shadcn/ui** (jeśli nie istnieje)

   ```bash
   npx shadcn@latest add toast
   ```

4. **Implementacja typów** (`types.ts`)
   - Definicja wszystkich interfejsów ViewModel
   - Definicja typów propsów komponentów

5. **Implementacja API client** (`api.ts`)
   - Funkcja `generateCards`
   - Klasa `ApiError` (wzór z `deck-detail/api.ts`)

6. **Implementacja hooka `useAIGenerate`**
   - Stan formularza
   - Walidacja
   - Wywołanie API
   - Obsługa błędów

7. **Implementacja komponentów UI** (od najmniejszych)
   - `LimitInfo` - prosty komponent informacyjny
   - `SourceTextArea` - textarea z licznikiem
   - `CardsCountSelect` - select z opcjami
   - `ActionButtons` - przyciski akcji
   - `AIGenerateForm` - kompozycja powyższych
   - `AIGenerateHeader` - nagłówek z nawigacją
   - `AIGenerateView` - główny kontener

8. **Implementacja strony Astro**
   - Import Layout i AIGenerateView
   - Przekazanie deckId z params

9. **Testowanie manualne**
   - Walidacja pola tekstowego (za krótki, za długi tekst)
   - Poprawna generacja
   - Obsługa wszystkich kodów błędów
   - Nawigacja (powrót, anulowanie)
   - Dostępność (klawiatura, czytniki ekranu)

10. **Dostępność (a11y)**
    - `aria-label` dla textarea
    - `aria-describedby` łączące pole z komunikatem błędu
    - `aria-live="polite"` dla informacji o limicie
    - `aria-busy` na formularzu podczas wysyłania
    - Prawidłowa kolejność fokusa
    - Obsługa klawiatury (Enter submit, Escape anulowanie)
