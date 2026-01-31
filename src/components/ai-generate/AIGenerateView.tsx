import { useEffect, useCallback } from "react";
import { useAIGenerate } from "./hooks/useAIGenerate";
import { AIGenerateHeader } from "./AIGenerateHeader";
import { AIGenerateForm } from "./AIGenerateForm";
import type { AIGenerateViewProps } from "./types";
import { toast } from "sonner";

export function AIGenerateView({ deckId }: AIGenerateViewProps) {
  const handleSuccess = useCallback(
    (result: { generated: number }) => {
      toast.success(`Wygenerowano ${result.generated} fiszek`);
      setTimeout(() => {
        // eslint-disable-next-line react-compiler/react-compiler
        window.location.href = `/decks/${deckId}`;
      }, 1000);
    },
    [deckId]
  );

  const handleUnauthorized = useCallback(() => {
    window.location.href = "/login";
  }, []);

  const {
    formState,
    remainingLimit,
    isSubmitting,
    isLoadingLimit,
    error,
    setSourceText,
    setCardsCount,
    submit,
    clearError,
  } = useAIGenerate({
    deckId,
    onSuccess: handleSuccess,
    onUnauthorized: handleUnauthorized,
  });

  useEffect(() => {
    if (error) {
      if (error.type === "not_found") {
        toast.error(error.message);
        setTimeout(() => {
          window.location.href = "/decks";
        }, 2000);
      } else {
        toast.error(error.message);
      }
      clearError();
    }
  }, [error, clearError]);

  const handleCancel = useCallback(() => {
    window.location.href = `/decks/${deckId}`;
  }, [deckId]);

  const handleBack = useCallback(() => {
    window.location.href = `/decks/${deckId}`;
  }, [deckId]);

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <AIGenerateHeader onBack={handleBack} />
      <AIGenerateForm
        formState={formState}
        remainingLimit={remainingLimit}
        isLoadingLimit={isLoadingLimit}
        isSubmitting={isSubmitting}
        onSourceTextChange={setSourceText}
        onCardsCountChange={setCardsCount}
        onSubmit={submit}
        onCancel={handleCancel}
      />
    </div>
  );
}
