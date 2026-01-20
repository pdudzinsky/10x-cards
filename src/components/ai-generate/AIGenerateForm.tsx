import type { AIGenerateFormProps } from "./types";
import { SourceTextArea } from "./SourceTextArea";
import { CardsCountSelect } from "./CardsCountSelect";
import { LimitInfo } from "./LimitInfo";
import { ActionButtons } from "./ActionButtons";

export function AIGenerateForm({
  formState,
  remainingLimit,
  isLoadingLimit,
  isSubmitting,
  onSourceTextChange,
  onCardsCountChange,
  onSubmit,
  onCancel,
}: AIGenerateFormProps) {
  const isFormValid = formState.sourceText.trim().length >= 50 && formState.sourceText.length <= 10000;
  const isLimitExceeded = remainingLimit !== null && remainingLimit <= 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && !isSubmitting && !isLimitExceeded) {
      onSubmit();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6" aria-busy={isSubmitting}>
      <SourceTextArea
        value={formState.sourceText}
        onChange={onSourceTextChange}
        error={formState.errors.sourceText}
        disabled={isSubmitting}
      />

      <CardsCountSelect value={formState.cardsCount} onChange={onCardsCountChange} disabled={isSubmitting} />

      <LimitInfo remainingLimit={remainingLimit} isLoading={isLoadingLimit} />

      <ActionButtons
        isSubmitting={isSubmitting}
        isDisabled={!isFormValid || isLimitExceeded}
        remainingLimit={remainingLimit}
        onSubmit={onSubmit}
        onCancel={onCancel}
      />
    </form>
  );
}
