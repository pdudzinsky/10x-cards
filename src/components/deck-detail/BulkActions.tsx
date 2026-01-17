import { useState } from "react";

import { Button } from "../ui/button";

interface BulkActionsProps {
  unverifiedCount: number;
  onAcceptAll: () => Promise<void>;
  onRejectAll: () => void;
}

export function BulkActions({ unverifiedCount, onAcceptAll, onRejectAll }: BulkActionsProps) {
  const [isAccepting, setIsAccepting] = useState(false);

  const handleAcceptAll = async () => {
    setIsAccepting(true);
    try {
      await onAcceptAll();
    } finally {
      setIsAccepting(false);
    }
  };

  return (
    <div className="flex items-center justify-between rounded-lg border bg-muted/50 p-4">
      <p className="text-sm text-muted-foreground">
        {unverifiedCount} {unverifiedCount === 1 ? "fiszka" : unverifiedCount < 5 ? "fiszki" : "fiszek"}{" "}
        niezweryfikowane
      </p>
      <div className="flex gap-2">
        <Button onClick={handleAcceptAll} disabled={isAccepting} size="sm">
          {isAccepting ? "Akceptowanie..." : "Zaakceptuj wszystkie"}
        </Button>
        <Button onClick={onRejectAll} variant="destructive" size="sm">
          Odrzuć wszystkie
        </Button>
      </div>
    </div>
  );
}
