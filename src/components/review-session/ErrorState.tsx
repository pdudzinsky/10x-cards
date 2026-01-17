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
        <p className="text-gray-600 dark:text-gray-400 mb-6">{message}</p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Spróbuj ponownie
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Powrót do talii
          </button>
        </div>
      </div>
    </div>
  );
}
