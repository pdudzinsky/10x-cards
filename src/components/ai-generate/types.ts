/**
 * Stan formularza generacji
 */
export interface AIGenerateFormState {
  sourceText: string;
  cardsCount: 5 | 10 | 20;
  errors: {
    sourceText?: string;
  };
}

/**
 * Props głównego widoku
 */
export interface AIGenerateViewProps {
  deckId: string;
}

/**
 * Props formularza
 */
export interface AIGenerateFormProps {
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
export interface SourceTextAreaProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled: boolean;
}

/**
 * Props selecta liczby fiszek
 */
export interface CardsCountSelectProps {
  value: 5 | 10 | 20;
  onChange: (value: 5 | 10 | 20) => void;
  disabled: boolean;
}

/**
 * Props informacji o limicie
 */
export interface LimitInfoProps {
  remainingLimit: number | null;
  isLoading: boolean;
}

/**
 * Props przycisków akcji
 */
export interface ActionButtonsProps {
  isSubmitting: boolean;
  isDisabled: boolean;
  onSubmit: () => void;
  onCancel: () => void;
}

/**
 * Wynik generacji (z API)
 */
export interface GenerationResult {
  generated: number;
  remainingDailyLimit: number;
}

/**
 * Błąd API z typowaniem
 */
export interface AIGenerateError {
  type: "validation" | "limit_exceeded" | "generation_failed" | "not_found" | "unauthorized" | "unknown";
  message: string;
}
