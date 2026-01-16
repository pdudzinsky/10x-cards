import { Skeleton } from "@/components/ui/skeleton";

interface DecksLoadingStateProps {
  rows?: number;
}

export function DecksLoadingState({ rows = 6 }: DecksLoadingStateProps) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="flex items-center justify-between rounded-lg border p-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-6 w-16 rounded-full" />
        </div>
      ))}
    </div>
  );
}
