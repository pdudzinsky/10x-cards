import { AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DecksErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function DecksErrorState({ message, onRetry }: DecksErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <AlertCircle className="mb-4 h-12 w-12 text-destructive" />
      <p className="mb-4 text-muted-foreground">{message}</p>
      <Button onClick={onRetry} variant="outline">
        Spróbuj ponownie
      </Button>
    </div>
  );
}
