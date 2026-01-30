import { DeckListItem } from "./DeckListItem";
import type { DeckListItemVM } from "./types";

interface DecksListProps {
  items: DeckListItemVM[];
}

export function DecksList({ items }: DecksListProps) {
  return (
    <ul className="space-y-3" data-testid="deck-list">
      {items.map((item) => (
        <DeckListItem key={item.id} item={item} />
      ))}
    </ul>
  );
}
