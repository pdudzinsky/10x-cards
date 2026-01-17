interface EmptyReviewStateProps {
  onBack: () => void;
}

export function EmptyReviewState({ onBack }: EmptyReviewStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="text-center max-w-md">
        <div className="mb-4 text-6xl">✓</div>
        <h2 className="text-2xl font-semibold mb-2">Brak fiszek do powtórki</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Świetna robota! Nie masz żadnych fiszek zaplanowanych na dzisiaj. Wróć tutaj jutro lub dodaj nowe fiszki do
          tej talii.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Powrót do talii
        </button>
      </div>
    </div>
  );
}
