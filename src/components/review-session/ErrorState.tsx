import { Button } from "../ui/button";

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  onBack: () => void;
}

export function ErrorState({ message, onRetry, onBack }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="mb-4 text-6xl text-red-500">⚠️</div>
        <h2 className="text-2xl font-semibold mb-2">Wystąpił błąd</h2>
        <p className="text-muted-foreground mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onRetry}>Spróbuj ponownie</Button>
          <Button onClick={onBack} variant="secondary">
            Powrót do talii
          </Button>
        </div>
      </div>
    </div>
  );
}
