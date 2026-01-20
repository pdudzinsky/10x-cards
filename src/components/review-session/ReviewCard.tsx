import { Button } from "../ui/button";
import type { ReviewCardVM } from "./types";

interface ReviewCardProps {
  card: ReviewCardVM;
  isFlipped: boolean;
  onFlip: () => void;
}

export function ReviewCard({ card, isFlipped, onFlip }: ReviewCardProps) {
  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-card rounded-lg shadow-md p-6 mb-8 border border-border">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Pytanie</h3>
          <div className="text-lg text-foreground whitespace-pre-wrap">{card.front}</div>
        </div>

        {isFlipped ? (
          <div className="border-t border-border pt-6">
            <h3 className="text-sm font-medium text-muted-foreground mb-2">Odpowiedź</h3>
            <div className="text-lg text-foreground whitespace-pre-wrap">{card.back}</div>
          </div>
        ) : (
          <div className="border-t border-border pt-6">
            <Button onClick={onFlip} className="w-full">
              Pokaż odpowiedź
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
