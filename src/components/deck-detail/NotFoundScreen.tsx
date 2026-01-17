import { Button } from "../ui/button";

interface NotFoundScreenProps {
  onBack: () => void;
}

export function NotFoundScreen({ onBack }: NotFoundScreenProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center gap-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold">Talia nie została znaleziona</h2>
        <p className="mt-2 text-muted-foreground">Talia, której szukasz, nie istnieje lub została usunięta.</p>
      </div>
      <Button onClick={onBack} variant="outline">
        Powrót do listy tali
      </Button>
    </div>
  );
}
