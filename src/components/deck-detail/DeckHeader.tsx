import { ArrowLeft } from "lucide-react";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import type { DeckDetailVM } from "./types";

interface DeckHeaderProps {
  deck: DeckDetailVM;
  onBack: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onStartReview: () => void;
}

export function DeckHeader({ deck, onBack, onEdit, onDelete, onStartReview }: DeckHeaderProps) {
  const hasDueCards = deck.dueCardsCount > 0;

  return (
    <div className="space-y-4">
      {/* Back Button */}
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
        <ArrowLeft className="h-4 w-4" />
        Powrót do listy
      </Button>

      {/* Deck Info and Actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{deck.name}</h1>
            {hasDueCards && <Badge variant="default">{deck.dueCardsCount} do powtórki</Badge>}
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={onEdit} variant="outline">
            Edytuj
          </Button>
          <Button onClick={onDelete} variant="destructive">
            Usuń
          </Button>
          {hasDueCards && <Button onClick={onStartReview}>Rozpocznij powtórkę</Button>}
        </div>
      </div>
    </div>
  );
}
