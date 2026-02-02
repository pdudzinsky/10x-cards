import { useCallback, useState, useEffect } from "react";
import { useReviewSession } from "./hooks/useReviewSession";
import type { ReviewSessionViewProps, ReviewGrade } from "./types";
import { ReviewHeader } from "./ReviewHeader";
import { ReviewCard } from "./ReviewCard";
import { GradeButtons } from "./GradeButtons";
import { EmptyReviewState } from "./EmptyReviewState";
import { ErrorState } from "./ErrorState";
import { LoadingState } from "./LoadingState";

export function ReviewSessionView({ deckId }: ReviewSessionViewProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh_token");
    // eslint-disable-next-line react-compiler/react-compiler
    window.location.href = "/login";
  }, []);

  const handleDeckNotFound = useCallback(() => {
    window.location.href = "/decks";
  }, []);

  const { status, session, currentCard, error, isSubmitting, submitGrade, retry } = useReviewSession({
    deckId,
    onUnauthorized: handleUnauthorized,
    onDeckNotFound: handleDeckNotFound,
  });

  // Reset isFlipped when currentCard changes
  useEffect(() => {
    setIsFlipped(false);
  }, [currentCard?.id]);

  const handleFinish = useCallback(() => {
    window.location.href = `/decks/${deckId}`;
  }, [deckId]);

  const handleBack = useCallback(() => {
    window.location.href = `/decks/${deckId}`;
  }, [deckId]);

  const handleFlip = useCallback(() => {
    setIsFlipped(true);
  }, []);

  const handleGrade = useCallback(
    async (grade: ReviewGrade) => {
      await submitGrade(grade);
      setIsFlipped(false);
    },
    [submitGrade]
  );

  if (status === "loading") {
    return <LoadingState />;
  }

  if (status === "empty") {
    return <EmptyReviewState onBack={handleBack} />;
  }

  if (status === "error") {
    return <ErrorState message={error || "Wystąpił nieoczekiwany błąd"} onRetry={retry} onBack={handleBack} />;
  }

  if (status === "active" && session && currentCard) {
    return (
      <div className="min-h-screen">
        <ReviewHeader currentIndex={session.currentIndex} totalCards={session.totalCards} onFinish={handleFinish} />
        <main className="py-8">
          <ReviewCard card={currentCard} isFlipped={isFlipped} onFlip={handleFlip} />
          {isFlipped && <GradeButtons onGrade={handleGrade} isSubmitting={isSubmitting} disabled={isSubmitting} />}
        </main>
      </div>
    );
  }

  return null;
}
