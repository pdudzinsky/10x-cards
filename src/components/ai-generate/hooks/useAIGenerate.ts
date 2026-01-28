import { useState, useEffect } from "react";
import type { AIGenerateFormState, AIGenerateError, GenerationResult } from "../types";
import { generateCards, fetchProfile, ApiError } from "../api";
import { validateSourceText, validateForm } from "../validation";
import { mapErrorToType, getErrorMessage } from "../error-utils";

export interface UseAIGenerateOptions {
  deckId: string;
  onSuccess: (result: GenerationResult) => void;
  onUnauthorized: () => void;
}

export interface UseAIGenerateResult {
  formState: AIGenerateFormState;
  remainingLimit: number | null;
  isSubmitting: boolean;
  isLoadingLimit: boolean;
  error: AIGenerateError | null;
  setSourceText: (text: string) => void;
  setCardsCount: (count: 5 | 10 | 20) => void;
  submit: () => Promise<void>;
  clearError: () => void;
}

export function useAIGenerate({ deckId, onSuccess, onUnauthorized }: UseAIGenerateOptions): UseAIGenerateResult {
  const [formState, setFormState] = useState<AIGenerateFormState>({
    sourceText: "",
    cardsCount: 10,
    errors: {},
  });
  const [remainingLimit, setRemainingLimit] = useState<number | null>(null);
  const [isLoadingLimit, setIsLoadingLimit] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<AIGenerateError | null>(null);

  // Pobierz limit przy montowaniu komponentu
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profile = await fetchProfile();
        setRemainingLimit(profile.daily_ai_generations_remaining);
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          onUnauthorized();
        }
        // Jeśli nie udało się pobrać profilu, nie blokujemy całego formularza
      } finally {
        setIsLoadingLimit(false);
      }
    };

    loadProfile();
  }, [onUnauthorized]);

  const setSourceText = (text: string) => {
    const validationResult = validateSourceText(text);

    setFormState((prev) => ({
      ...prev,
      sourceText: text,
      errors: {
        ...prev.errors,
        sourceText: validationResult.error,
      },
    }));
  };

  const setCardsCount = (count: 5 | 10 | 20) => {
    setFormState((prev) => ({
      ...prev,
      cardsCount: count,
    }));
  };

  const submit = async () => {
    if (!validateForm(formState.sourceText)) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const result = await generateCards(deckId, {
        source_text: formState.sourceText.trim(),
        cards_count: formState.cardsCount,
      });

      setRemainingLimit(result.remaining_daily_limit);
      onSuccess({
        generated: result.generated,
        remainingDailyLimit: result.remaining_daily_limit,
      });
    } catch (err) {
      if (err instanceof ApiError) {
        const errorType = mapErrorToType(err.status);

        if (errorType === "unauthorized") {
          onUnauthorized();
          return;
        }

        const errorMessage = getErrorMessage(errorType, err.message);
        setError({ type: errorType, message: errorMessage });

        if (errorType === "limit_exceeded") {
          setRemainingLimit(0);
        }
      } else {
        setError({
          type: "unknown",
          message: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    formState,
    remainingLimit,
    isSubmitting,
    isLoadingLimit,
    error,
    setSourceText,
    setCardsCount,
    submit,
    clearError,
  };
}
