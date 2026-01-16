import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { PaginationVM } from "./types";

interface DecksPaginationProps {
  pagination: PaginationVM;
  onPrev: () => void;
  onNext: () => void;
}

export function DecksPagination({ pagination, onPrev, onNext }: DecksPaginationProps) {
  const { currentPage, totalPages, hasPrev, hasNext } = pagination;

  if (totalPages <= 1) {
    return null;
  }

  return (
    <nav aria-label="Paginacja" className="mt-6 flex items-center justify-center gap-4">
      <Button variant="outline" size="sm" onClick={onPrev} disabled={!hasPrev} aria-label="Poprzednia strona">
        <ChevronLeft className="h-4 w-4" />
        Poprzednia
      </Button>

      <span className="text-sm text-muted-foreground">
        Strona {currentPage} z {totalPages}
      </span>

      <Button variant="outline" size="sm" onClick={onNext} disabled={!hasNext} aria-label="Następna strona">
        Następna
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  );
}
