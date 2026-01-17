import { Button } from "../ui/button";

interface AIGenerateHeaderProps {
  onBack: () => void;
}

export function AIGenerateHeader({ onBack }: AIGenerateHeaderProps) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <Button variant="ghost" size="sm" onClick={onBack} className="gap-2" aria-label="Wróć do tali">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Wstecz
      </Button>
      <h1 className="text-2xl font-bold">Generowanie fiszek AI</h1>
    </div>
  );
}
