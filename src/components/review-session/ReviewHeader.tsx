interface ReviewHeaderProps {
  currentIndex: number;
  totalCards: number;
  onFinish: () => void;
}

export function ReviewHeader({ currentIndex, totalCards, onFinish }: ReviewHeaderProps) {
  return (
    <header className="bg-card border-b border-border sticky top-0 z-10">
      <div className="max-w-4xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={onFinish}
              className="text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Powrót do talii"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <h1 className="text-xl font-semibold text-foreground">Powtórka</h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-sm text-muted-foreground">
              {currentIndex + 1} z {totalCards}
            </div>
            <button
              onClick={onFinish}
              className="px-3 py-1.5 text-sm bg-secondary text-secondary-foreground rounded-md hover:bg-secondary/80 transition-colors"
            >
              Zakończ
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
