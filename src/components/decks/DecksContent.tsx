import { DecksEmptyState } from "./DecksEmptyState";
import { DecksErrorState } from "./DecksErrorState";
import { DecksList } from "./DecksList";
import { DecksLoadingState } from "./DecksLoadingState";
import { DecksPagination } from "./DecksPagination";
import type { DecksListVM } from "./types";

interface DecksContentProps {
  vm: DecksListVM;
  onRetry: () => void;
  onPrev: () => void;
  onNext: () => void;
  onCreateClick: () => void;
}

export function DecksContent({ vm, onRetry, onPrev, onNext, onCreateClick }: DecksContentProps) {
  if (vm.status === "loading") {
    return <DecksLoadingState />;
  }

  if (vm.status === "error" && vm.error) {
    return <DecksErrorState message={vm.error.message} onRetry={onRetry} />;
  }

  if (vm.items.length === 0) {
    return <DecksEmptyState onCreateClick={onCreateClick} />;
  }

  return (
    <section>
      <DecksList items={vm.items} />
      <DecksPagination pagination={vm.pagination} onPrev={onPrev} onNext={onNext} />
    </section>
  );
}
