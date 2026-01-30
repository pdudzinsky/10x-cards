import { Badge } from "@/components/ui/badge";

import type { DeckListItemVM } from "./types";

interface DeckListItemProps {
  item: DeckListItemVM;
}

export function DeckListItem({ item }: DeckListItemProps) {
  return (
    <li data-testid="deck-list-item">
      <a
        href={`/decks/${item.id}`}
        data-testid={`deck-item-${item.id}`}
        className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="font-medium" data-testid="deck-name">
          {item.name}
        </span>
        <Badge variant={item.dueCardsCount > 0 ? "default" : "secondary"} data-testid="deck-due-count">
          {item.dueCardsCount} do powtórki
        </Badge>
      </a>
    </li>
  );
}
