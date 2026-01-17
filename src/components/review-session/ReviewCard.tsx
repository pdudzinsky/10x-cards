import type { ReviewCardVM } from "./types";

interface ReviewCardProps {
  card: ReviewCardVM;
  isFlipped: boolean;
  onFlip: () => void;
}

export function ReviewCard({ card, isFlipped, onFlip }: ReviewCardProps) {
  return (
    <div className="max-w-2xl mx-auto px-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-8">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Pytanie</h3>
          <div className="text-lg text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{card.front}</div>
        </div>

        {isFlipped ? (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Odpowiedź</h3>
            <div className="text-lg text-gray-900 dark:text-gray-100 whitespace-pre-wrap">{card.back}</div>
          </div>
        ) : (
          <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              onClick={onFlip}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
            >
              Pokaż odpowiedź
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
