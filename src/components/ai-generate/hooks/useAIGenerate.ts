import { useState, useEffect } from "react";
import type { AIGenerateFormState, AIGenerateError, GenerationResult } from "../types";
import { generateCards, fetchProfile, ApiError } from "../api";

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

const MIN_TEXT_LENGTH = 50;
const MAX_TEXT_LENGTH = 10000;

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
    const trimmedLength = text.trim().length;
    let errorMessage: string | undefined;

    if (trimmedLength > 0 && trimmedLength < MIN_TEXT_LENGTH) {
      errorMessage = "Tekst musi mieć co najmniej 50 znaków";
    } else if (text.length > MAX_TEXT_LENGTH) {
      errorMessage = "Tekst nie może przekraczać 10 000 znaków";
    }

    setFormState((prev) => ({
      ...prev,
      sourceText: text,
      errors: {
        ...prev.errors,
        sourceText: errorMessage,
      },
    }));
  };

  const setCardsCount = (count: 5 | 10 | 20) => {
    setFormState((prev) => ({
      ...prev,
      cardsCount: count,
    }));
  };

  const validateForm = (): boolean => {
    const trimmedLength = formState.sourceText.trim().length;
    return trimmedLength >= MIN_TEXT_LENGTH && formState.sourceText.length <= MAX_TEXT_LENGTH;
  };

  const mapErrorToType = (status: number): AIGenerateError["type"] => {
    switch (status) {
      case 400:
        return "validation";
      case 401:
        return "unauthorized";
      case 403:
        return "limit_exceeded";
      case 404:
        return "not_found";
      case 502:
        return "generation_failed";
      default:
        return "unknown";
    }
  };

  const getErrorMessage = (errorType: AIGenerateError["type"], apiMessage?: string): string => {
    switch (errorType) {
      case "validation":
        return apiMessage || "Tekst musi mieć od 50 do 10 000 znaków";
      case "limit_exceeded":
        return "Przekroczono dzienny limit generacji";
      case "not_found":
        return "Talia nie została znaleziona";
      case "generation_failed":
        return "Błąd generacji AI. Spróbuj ponownie";
      case "unauthorized":
        return "Musisz być zalogowany";
      case "unknown":
        return "Wystąpił nieoczekiwany błąd. Spróbuj ponownie";
    }
  };

  const submit = async () => {
    if (!validateForm()) {
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
