import { Button } from "../ui/button";

interface ErrorScreenProps {
  message: string;
  onRetry: () => void;
}

export function ErrorScreen({ message, onRetry }: ErrorScreenProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-red-600">Wystąpił błąd</h2>
        <p className="mt-2 text-muted-foreground">{message}</p>
      </div>
      <Button onClick={onRetry} variant="outline">
        Spróbuj ponownie
      </Button>
    </div>
  );
}
