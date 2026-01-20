import { Button } from "../ui/button";

interface EmptyReviewStateProps {
  onBack: () => void;
}

export function EmptyReviewState({ onBack }: EmptyReviewStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="mb-4 text-6xl">✓</div>
        <h2 className="text-2xl font-semibold mb-2">Brak fiszek do powtórki</h2>
        <p className="text-muted-foreground mb-6">
          Świetna robota! Nie masz żadnych fiszek zaplanowanych na dzisiaj. Wróć tutaj jutro lub dodaj nowe fiszki do
          tej talii.
        </p>
        <Button onClick={onBack}>Powrót do talii</Button>
      </div>
    </div>
  );
}
