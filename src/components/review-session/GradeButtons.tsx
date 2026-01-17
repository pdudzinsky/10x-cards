import type { ReviewGrade } from "./types";

interface GradeButtonsProps {
  onGrade: (grade: ReviewGrade) => void;
  isSubmitting: boolean;
  disabled: boolean;
}

const GRADE_LABELS: Record<ReviewGrade, string> = {
  0: "Kompletna czarna dziura",
  1: "Niepoprawna odpowiedź",
  2: "Poprawna z dużym wysiłkiem",
  3: "Poprawna z wahaniem",
  4: "Poprawna po chwili zastanowienia",
  5: "Perfekcyjna odpowiedź",
};

export function GradeButtons({ onGrade, isSubmitting, disabled }: GradeButtonsProps) {
  const handleGrade = (grade: ReviewGrade) => {
    if (!disabled && !isSubmitting) {
      onGrade(grade);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4">
      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Jak dobrze pamiętałeś tę fiszkę?</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {([0, 1, 2, 3, 4, 5] as const).map((grade) => (
          <button
            key={grade}
            onClick={() => handleGrade(grade)}
            disabled={disabled || isSubmitting}
            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-gray-200 dark:disabled:hover:border-gray-700 disabled:hover:bg-white dark:disabled:hover:bg-gray-800"
          >
            <span className="text-left">
              <span className="block text-sm font-medium text-gray-900 dark:text-gray-100">{GRADE_LABELS[grade]}</span>
            </span>
            <span className="text-2xl font-bold text-gray-400 dark:text-gray-600">{grade}</span>
          </button>
        ))}
      </div>
      {isSubmitting && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">Zapisywanie oceny...</div>
      )}
    </div>
  );
}
