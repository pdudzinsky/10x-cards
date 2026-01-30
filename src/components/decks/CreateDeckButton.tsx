import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

interface CreateDeckButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function CreateDeckButton({ onClick, disabled }: CreateDeckButtonProps) {
  return (
    <Button onClick={onClick} disabled={disabled} data-testid="create-deck-button">
      <Plus className="h-4 w-4" />
      Utwórz talię
    </Button>
  );
}
