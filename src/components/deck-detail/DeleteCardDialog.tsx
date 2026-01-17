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

interface DeleteCardDialogProps {
  isOpen: boolean;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function DeleteCardDialog({ isOpen, onConfirm, onCancel }: DeleteCardDialogProps) {
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
          <DialogTitle>Czy na pewno chcesz usunąć fiszkę?</DialogTitle>
          <DialogDescription>Fiszka zostanie trwale usunięta. Tej operacji nie można cofnąć.</DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isDeleting}>
            Anuluj
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? "Usuwanie..." : "Usuń fiszkę"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
