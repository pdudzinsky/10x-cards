import { useEffect } from "react";
import { useAIGenerate } from "./hooks/useAIGenerate";
import { AIGenerateHeader } from "./AIGenerateHeader";
import { AIGenerateForm } from "./AIGenerateForm";
import type { AIGenerateViewProps } from "./types";
import { toast } from "sonner";

export function AIGenerateView({ deckId }: AIGenerateViewProps) {
  const { formState, remainingLimit, isSubmitting, error, setSourceText, setCardsCount, submit, clearError } =
    useAIGenerate({
      deckId,
      onSuccess: (result) => {
        toast.success(`Wygenerowano ${result.generated} fiszek`);
        setTimeout(() => {
          window.location.href = `/decks/${deckId}`;
        }, 1000);
      },
      onUnauthorized: () => {
        window.location.href = "/login";
      },
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

  const handleCancel = () => {
    window.location.href = `/decks/${deckId}`;
  };

  const handleBack = () => {
    window.location.href = `/decks/${deckId}`;
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <AIGenerateHeader onBack={handleBack} />
      <AIGenerateForm
        formState={formState}
        remainingLimit={remainingLimit}
        isSubmitting={isSubmitting}
        onSourceTextChange={setSourceText}
        onCardsCountChange={setCardsCount}
        onSubmit={submit}
        onCancel={handleCancel}
      />
    </div>
  );
}
