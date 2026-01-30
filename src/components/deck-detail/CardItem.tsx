import { type FormEvent, useCallback, useEffect, useState } from "react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Textarea } from "../ui/textarea";
import { useCardForm } from "./hooks/useCardForm";
import type { CardListItemVM } from "./types";

interface CardItemProps {
  card: CardListItemVM;
  isEditing: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: (front: string, back: string) => Promise<void>;
  onDelete: () => void;
  onAccept: () => Promise<void>;
  onReject: () => void;
}

const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

export function CardItem({
  card,
  isEditing,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onAccept,
  onReject,
}: CardItemProps) {
  const { form, setField, validate, setInitialValues } = useCardForm();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);

  // Initialize form with card data when entering edit mode
  useEffect(() => {
    if (isEditing) {
      setInitialValues(card.front, card.back);
    }
  }, [isEditing, card.front, card.back, setInitialValues]);

  const handleSaveEdit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      if (!validate()) {
        return;
      }

      setIsSubmitting(true);
      try {
        await onSaveEdit(form.front.trim(), form.back.trim());
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, validate, onSaveEdit]
  );

  const handleAccept = useCallback(async () => {
    setIsAccepting(true);
    try {
      await onAccept();
    } finally {
      setIsAccepting(false);
    }
  }, [onAccept]);

  // Render edit mode
  if (isEditing) {
    return (
      <div className="rounded-lg border p-4" data-testid="card-item-editing">
        <form onSubmit={handleSaveEdit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor={`card-front-${card.id}`}>Przód fiszki</Label>
              <span className="text-sm text-muted-foreground">
                {form.front.length}/{MAX_FRONT_LENGTH}
              </span>
            </div>
            <Textarea
              id={`card-front-${card.id}`}
              data-testid="card-front-input"
              value={form.front}
              onChange={(e) => setField("front", e.target.value)}
              disabled={isSubmitting}
              aria-invalid={!!form.errors.front}
              aria-describedby={form.errors.front ? `card-front-error-${card.id}` : undefined}
              className="mt-2"
              rows={3}
            />
            {form.errors.front && (
              <p id={`card-front-error-${card.id}`} className="mt-1 text-sm text-destructive">
                {form.errors.front}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label htmlFor={`card-back-${card.id}`}>Tył fiszki</Label>
              <span className="text-sm text-muted-foreground">
                {form.back.length}/{MAX_BACK_LENGTH}
              </span>
            </div>
            <Textarea
              id={`card-back-${card.id}`}
              data-testid="card-back-input"
              value={form.back}
              onChange={(e) => setField("back", e.target.value)}
              disabled={isSubmitting}
              aria-invalid={!!form.errors.back}
              aria-describedby={form.errors.back ? `card-back-error-${card.id}` : undefined}
              className="mt-2"
              rows={3}
            />
            {form.errors.back && (
              <p id={`card-back-error-${card.id}`} className="mt-1 text-sm text-destructive">
                {form.errors.back}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancelEdit}
              disabled={isSubmitting}
              data-testid="card-cancel-edit-button"
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting} data-testid="card-save-edit-button">
              {isSubmitting ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  // Render read mode
  return (
    <div className="rounded-lg border p-4" data-testid="card-item">
      <div className="space-y-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Przód</span>
            {card.status === "unverified" && <Badge variant="outline">Niezweryfikowana</Badge>}
          </div>
          <p className="whitespace-pre-wrap" data-testid="card-front-text">
            {card.front}
          </p>
        </div>

        <div>
          <span className="mb-1 block text-sm font-medium text-muted-foreground">Tył</span>
          <p className="whitespace-pre-wrap" data-testid="card-back-text">
            {card.back}
          </p>
        </div>

        <div className="flex justify-end gap-2">
          {card.status === "unverified" ? (
            <>
              <Button onClick={handleAccept} size="sm" disabled={isAccepting} data-testid="card-accept-button">
                {isAccepting ? "Akceptowanie..." : "Zaakceptuj"}
              </Button>
              <Button onClick={onStartEdit} variant="outline" size="sm" data-testid="card-edit-button">
                Edytuj
              </Button>
              <Button onClick={onReject} variant="destructive" size="sm" data-testid="card-reject-button">
                Odrzuć
              </Button>
            </>
          ) : (
            <>
              <Button onClick={onStartEdit} variant="outline" size="sm" data-testid="card-edit-button">
                Edytuj
              </Button>
              <Button onClick={onDelete} variant="destructive" size="sm" data-testid="card-delete-button">
                Usuń
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
