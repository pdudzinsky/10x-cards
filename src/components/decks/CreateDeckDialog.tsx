import { type FormEvent, useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CreateDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateDeck: (name: string) => Promise<void>;
  isCreating: boolean;
  errorMessage?: string | null;
}

function validateName(name: string): string | null {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return "Nazwa jest wymagana";
  }
  if (trimmed.length > 100) {
    return "Nazwa może mieć maksymalnie 100 znaków";
  }
  return null;
}

export function CreateDeckDialog({
  open,
  onOpenChange,
  onCreateDeck,
  isCreating,
  errorMessage,
}: CreateDeckDialogProps) {
  const [name, setName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setName("");
    setNameError(null);
  }, []);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        resetForm();
      }
      onOpenChange(newOpen);
    },
    [onOpenChange, resetForm]
  );

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const validationError = validateName(name);
      if (validationError) {
        setNameError(validationError);
        return;
      }

      setNameError(null);
      await onCreateDeck(name.trim());
    },
    [name, onCreateDeck]
  );

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    if (value.trim().length > 0) {
      setNameError(null);
    }
  }, []);

  const isSubmitDisabled = isCreating || name.trim().length === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Utwórz nową talię</DialogTitle>
            <DialogDescription>Wprowadź nazwę dla nowej tali fiszek</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="deck-name">Nazwa tali</Label>
            <Input
              id="deck-name"
              data-testid="deck-name-input"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="np. Angielski - słówka"
              disabled={isCreating}
              aria-invalid={!!nameError}
              aria-describedby={nameError ? "deck-name-error" : undefined}
              className="mt-2"
            />
            {nameError && (
              <p id="deck-name-error" className="mt-1 text-sm text-destructive">
                {nameError}
              </p>
            )}
            {errorMessage && !nameError && <p className="mt-1 text-sm text-destructive">{errorMessage}</p>}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isCreating}
              data-testid="deck-cancel-button"
            >
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitDisabled} data-testid="deck-save-button">
              {isCreating ? "Tworzenie..." : "Utwórz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
