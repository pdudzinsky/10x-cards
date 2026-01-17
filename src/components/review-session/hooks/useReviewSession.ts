import { useState, useEffect, useCallback } from "react";
import type {
  ReviewSessionStatus,
  ReviewCardVM,
  ReviewSessionVM,
  UseReviewSessionOptions,
  UseReviewSessionResult,
  ReviewGrade,
} from "../types";
import { startReviewSession, submitAnswer, ApiError } from "../api";
import { mapSessionToViewModel } from "../mappers";

export function useReviewSession(options: UseReviewSessionOptions): UseReviewSessionResult {
  const { deckId, onUnauthorized, onDeckNotFound } = options;

  const [status, setStatus] = useState<ReviewSessionStatus>("loading");
  const [cards, setCards] = useState<ReviewCardVM[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const initializeSession = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const sessionDTO = await startReviewSession(deckId);

      if (sessionDTO.cards.length === 0) {
        setStatus("empty");
        setCards([]);
        setCurrentIndex(0);
      } else {
        const sessionVM = mapSessionToViewModel(sessionDTO);
        setCards(sessionVM.cards);
        setCurrentIndex(0);
        setStatus("active");
      }
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          onUnauthorized?.();
        } else if (err.status === 404) {
          onDeckNotFound?.();
        } else {
          setError(err.message);
          setStatus("error");
        }
      } else {
        setError("Wystąpił nieoczekiwany błąd");
        setStatus("error");
      }
    }
  }, [deckId, onUnauthorized, onDeckNotFound]);

  useEffect(() => {
    initializeSession();
  }, [initializeSession]);

  const submitGrade = useCallback(
    async (grade: ReviewGrade) => {
      if (currentIndex >= cards.length) {
        return;
      }

      const currentCard = cards[currentIndex];
      setIsSubmitting(true);

      try {
        await submitAnswer(currentCard.id, grade);

        // Przejdź do następnej fiszki lub zakończ sesję
        const nextIndex = currentIndex + 1;
        if (nextIndex >= cards.length) {
          // Ostatnia fiszka - powrót do tali
          window.location.href = `/decks/${deckId}`;
        } else {
          setCurrentIndex(nextIndex);
        }
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.message);
        } else {
          setError("Nie udało się zapisać oceny");
        }
      } finally {
        setIsSubmitting(false);
      }
    },
    [cards, currentIndex, deckId]
  );

  const retry = useCallback(async () => {
    await initializeSession();
  }, [initializeSession]);

  const session: ReviewSessionVM | null =
    status === "active"
      ? {
          cards,
          currentIndex,
          totalCards: cards.length,
        }
      : null;

  const currentCard: ReviewCardVM | null =
    status === "active" && currentIndex < cards.length ? cards[currentIndex] : null;

  return {
    status,
    session,
    currentCard,
    error,
    isSubmitting,
    submitGrade,
    retry,
  };
}
