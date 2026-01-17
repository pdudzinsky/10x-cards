import { CardItem } from "./CardItem";
import type { CardListItemVM } from "./types";

interface CardListProps {
  cards: CardListItemVM[];
  editingCardId: string | null;
  onStartEdit: (card: CardListItemVM) => void;
  onCancelEdit: () => void;
  onSaveEdit: (cardId: string, front: string, back: string) => Promise<void>;
  onDelete: (cardId: string) => void;
  onAccept: (cardId: string) => Promise<void>;
  onReject: (cardId: string) => void;
}

export function CardList({
  cards,
  editingCardId,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onDelete,
  onAccept,
  onReject,
}: CardListProps) {
  if (cards.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed">
        <p className="text-muted-foreground">Brak fiszek do wyświetlenia</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          isEditing={editingCardId === card.id}
          onStartEdit={() => onStartEdit(card)}
          onCancelEdit={onCancelEdit}
          onSaveEdit={(front, back) => onSaveEdit(card.id, front, back)}
          onDelete={() => onDelete(card.id)}
          onAccept={() => onAccept(card.id)}
          onReject={() => onReject(card.id)}
        />
      ))}
    </div>
  );
}
