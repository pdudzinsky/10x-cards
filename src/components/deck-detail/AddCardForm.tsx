import { type FormEvent, useCallback, useEffect, useState } from "react";

import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useCardForm } from "./hooks/useCardForm";

interface AddCardFormProps {
  onSubmit: (front: string, back: string) => Promise<void>;
  onCancel: () => void;
}

const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

export function AddCardForm({ onSubmit, onCancel }: AddCardFormProps) {
  const { form, setField, validate, reset } = useCardForm();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when component mounts
  useEffect(() => {
    reset();
  }, [reset]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!validate()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit(form.front.trim(), form.back.trim());
        reset();
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, validate, onSubmit, reset]
  );

  const handleCancel = useCallback(() => {
    reset();
    onCancel();
  }, [reset, onCancel]);

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border p-4" data-testid="add-card-form">
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="card-front">Przód fiszki</Label>
            <span className="text-sm text-muted-foreground">
              {form.front.length}/{MAX_FRONT_LENGTH}
            </span>
          </div>
          <Textarea
            id="card-front"
            data-testid="card-front-input"
            value={form.front}
            onChange={(e) => setField("front", e.target.value)}
            placeholder="Wprowadź treść przodu fiszki"
            disabled={isSubmitting}
            aria-invalid={!!form.errors.front}
            aria-describedby={form.errors.front ? "card-front-error" : undefined}
            className="mt-2"
            rows={3}
          />
          {form.errors.front && (
            <p id="card-front-error" className="mt-1 text-sm text-destructive" data-testid="card-front-error">
              {form.errors.front}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label htmlFor="card-back">Tył fiszki</Label>
            <span className="text-sm text-muted-foreground">
              {form.back.length}/{MAX_BACK_LENGTH}
            </span>
          </div>
          <Textarea
            id="card-back"
            data-testid="card-back-input"
            value={form.back}
            onChange={(e) => setField("back", e.target.value)}
            placeholder="Wprowadź treść tyłu fiszki"
            disabled={isSubmitting}
            aria-invalid={!!form.errors.back}
            aria-describedby={form.errors.back ? "card-back-error" : undefined}
            className="mt-2"
            rows={3}
          />
          {form.errors.back && (
            <p id="card-back-error" className="mt-1 text-sm text-destructive" data-testid="card-back-error">
              {form.errors.back}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSubmitting}
            data-testid="card-cancel-button"
          >
            Anuluj
          </Button>
          <Button type="submit" disabled={isSubmitting} data-testid="card-save-button">
            {isSubmitting ? "Zapisywanie..." : "Zapisz"}
          </Button>
        </div>
      </div>
    </form>
  );
}
