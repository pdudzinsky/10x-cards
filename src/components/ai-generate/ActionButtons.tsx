import type { ActionButtonsProps } from "./types";
import { Button } from "../ui/button";

export function ActionButtons({ isSubmitting, isDisabled, remainingLimit, onSubmit, onCancel }: ActionButtonsProps) {
  const isLimitExceeded = remainingLimit !== null && remainingLimit <= 0;

  return (
    <div className="space-y-3 pt-4">
      {isLimitExceeded && (
        <div className="text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-md p-3">
          <p className="font-medium">Osiągnięto dzienny limit generacji</p>
          <p className="mt-1 text-xs">Limit zostanie odnowiony dzisiaj o północy (00:00)</p>
        </div>
      )}
      <div className="flex gap-3">
        <Button type="button" onClick={onSubmit} disabled={isDisabled || isSubmitting} className="flex-1">
          {isSubmitting ? (
            <>
              <svg
                className="mr-2 h-4 w-4 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generowanie...
            </>
          ) : (
            "Generuj"
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting} className="flex-1">
          Anuluj
        </Button>
      </div>
    </div>
  );
}
