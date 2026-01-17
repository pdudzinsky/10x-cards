import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DeleteDeckDialogProps {
  isOpen: boolean;
  deckName: string;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteDeckDialog({ isOpen, deckName, onConfirm, onCancel }: DeleteDeckDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isDeleting && onCancel()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Czy na pewno chcesz usunąć talię?</DialogTitle>
          <DialogDescription>
            Talia <strong>{deckName}</strong> oraz wszystkie jej fiszki zostaną trwale usunięte. Tej operacji nie można
            cofnąć.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isDeleting}>
            Anuluj
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? "Usuwanie..." : "Usuń talię"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
