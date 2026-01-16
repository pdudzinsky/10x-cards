import { Badge } from "@/components/ui/badge";

import type { DeckListItemVM } from "./types";

interface DeckListItemProps {
  item: DeckListItemVM;
}

export function DeckListItem({ item }: DeckListItemProps) {
  return (
    <li>
      <a
        href={`/decks/${item.id}`}
        className="flex items-center justify-between rounded-lg border bg-card p-4 transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <span className="font-medium">{item.name}</span>
        <Badge variant={item.dueCardsCount > 0 ? "default" : "secondary"}>{item.dueCardsCount} do powtórki</Badge>
      </a>
    </li>
  );
}
