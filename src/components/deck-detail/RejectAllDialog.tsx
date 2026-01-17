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

interface RejectAllDialogProps {
  isOpen: boolean;
  count: number;
  onConfirm: () => Promise<void>;
  onCancel: () => void;
}

export function RejectAllDialog({ isOpen, count, onConfirm, onCancel }: RejectAllDialogProps) {
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
          <DialogTitle>Czy na pewno chcesz odrzucić wszystkie fiszki?</DialogTitle>
          <DialogDescription>
            {count} {count === 1 ? "fiszka" : count < 5 ? "fiszki" : "fiszek"} niezweryfikowane zostaną trwale usunięte.
            Tej operacji nie można cofnąć.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onCancel} disabled={isDeleting}>
            Anuluj
          </Button>
          <Button type="button" variant="destructive" onClick={handleConfirm} disabled={isDeleting}>
            {isDeleting ? "Usuwanie..." : "Odrzuć wszystkie"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
