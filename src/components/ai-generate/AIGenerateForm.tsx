import type { AIGenerateFormProps } from "./types";
import { SourceTextArea } from "./SourceTextArea";
import { CardsCountSelect } from "./CardsCountSelect";
import { LimitInfo } from "./LimitInfo";
import { ActionButtons } from "./ActionButtons";

export function AIGenerateForm({
  formState,
  remainingLimit,
  isSubmitting,
  onSourceTextChange,
  onCardsCountChange,
  onSubmit,
  onCancel,
}: AIGenerateFormProps) {
  const isFormValid = formState.sourceText.trim().length >= 50 && formState.sourceText.length <= 10000;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid && !isSubmitting) {
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

      <LimitInfo remainingLimit={remainingLimit} isLoading={false} />

      <ActionButtons isSubmitting={isSubmitting} isDisabled={!isFormValid} onSubmit={onSubmit} onCancel={onCancel} />
    </form>
  );
}
