import { type FormEvent, useCallback, useEffect, useState } from "react";

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

interface EditDeckDialogProps {
  open: boolean;
  currentName: string;
  onOpenChange: (open: boolean) => void;
  onUpdateDeck: (name: string) => Promise<void>;
  isUpdating: boolean;
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

export function EditDeckDialog({
  open,
  currentName,
  onOpenChange,
  onUpdateDeck,
  isUpdating,
  errorMessage,
}: EditDeckDialogProps) {
  const [name, setName] = useState(currentName);
  const [nameError, setNameError] = useState<string | null>(null);

  // Reset form when dialog opens with current name
  useEffect(() => {
    if (open) {
      setName(currentName);
      setNameError(null);
    }
  }, [open, currentName]);

  const handleOpenChange = useCallback(
    (newOpen: boolean) => {
      if (!newOpen) {
        setNameError(null);
      }
      onOpenChange(newOpen);
    },
    [onOpenChange]
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
      await onUpdateDeck(name.trim());
    },
    [name, onUpdateDeck]
  );

  const handleNameChange = useCallback((value: string) => {
    setName(value);
    if (value.trim().length > 0) {
      setNameError(null);
    }
  }, []);

  const isSubmitDisabled = isUpdating || name.trim().length === 0;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Edytuj talię</DialogTitle>
            <DialogDescription>Zmień nazwę tali</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="deck-name">Nazwa tali</Label>
            <Input
              id="deck-name"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="np. Angielski - słówka"
              disabled={isUpdating}
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
            <Button type="button" variant="outline" onClick={() => handleOpenChange(false)} disabled={isUpdating}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitDisabled}>
              {isUpdating ? "Zapisywanie..." : "Zapisz"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
