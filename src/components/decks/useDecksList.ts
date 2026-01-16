import { useCallback, useEffect, useRef, useState } from "react";

import type { PaginatedDecksResponseDTO } from "../../types";
import { ApiError, listDecks } from "./api";
import type { DeckListItemVM, DecksListVM, PaginationVM } from "./types";

const DEFAULT_LIMIT = 20;

/**
 * Maps API response to DecksListVM
 */
function mapToViewModel(data: PaginatedDecksResponseDTO): {
  items: DeckListItemVM[];
  pagination: PaginationVM;
} {
  const items: DeckListItemVM[] = data.items.map((item) => ({
    id: item.id,
    name: item.name,
    dueCardsCount: item.due_cards_count,
    lastUsedAt: item.last_used_at ?? undefined,
  }));

  const currentPage = Math.floor(data.offset / data.limit) + 1;
  const totalPages = Math.max(1, Math.ceil(data.total / data.limit));

  const pagination: PaginationVM = {
    limit: data.limit,
    offset: data.offset,
    total: data.total,
    currentPage,
    totalPages,
    hasPrev: data.offset > 0,
    hasNext: data.offset + data.limit < data.total,
  };

  return { items, pagination };
}

/**
 * Creates initial pagination state
 */
function createInitialPagination(): PaginationVM {
  return {
    limit: DEFAULT_LIMIT,
    offset: 0,
    total: 0,
    currentPage: 1,
    totalPages: 1,
    hasPrev: false,
    hasNext: false,
  };
}

interface UseDeckListResult {
  vm: DecksListVM;
  actions: {
    retry: () => void;
    goPrev: () => void;
    goNext: () => void;
    reset: () => void;
  };
}

interface UseDeckListOptions {
  onUnauthorized?: () => void;
}

/**
 * Hook for managing decks list with pagination
 */
export function useDecksList(options: UseDeckListOptions = {}): UseDeckListResult {
  const { onUnauthorized } = options;

  const [status, setStatus] = useState<"loading" | "error" | "ready">("loading");
  const [items, setItems] = useState<DeckListItemVM[]>([]);
  const [pagination, setPagination] = useState<PaginationVM>(createInitialPagination);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);

  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchDecks = useCallback(
    async (currentOffset: number) => {
      // Cancel any pending request
      abortControllerRef.current?.abort();
      abortControllerRef.current = new AbortController();

      setStatus("loading");
      setErrorMessage(null);

      try {
        const data = await listDecks(DEFAULT_LIMIT, currentOffset, abortControllerRef.current.signal);
        const { items: mappedItems, pagination: mappedPagination } = mapToViewModel(data);

        setItems(mappedItems);
        setPagination(mappedPagination);
        setStatus("ready");
      } catch (error) {
        // Don't update state if request was aborted
        if (error instanceof Error && error.name === "AbortError") {
          return;
        }

        // Handle 401 - unauthorized
        if (error instanceof ApiError && error.status === 401) {
          onUnauthorized?.();
          return;
        }

        setStatus("error");
        setErrorMessage(error instanceof Error ? error.message : "Nie udało się pobrać tali");
      }
    },
    [onUnauthorized]
  );

  // Fetch on mount and when offset changes
  useEffect(() => {
    fetchDecks(offset);

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchDecks, offset]);

  const retry = useCallback(() => {
    fetchDecks(offset);
  }, [fetchDecks, offset]);

  const goPrev = useCallback(() => {
    const newOffset = Math.max(0, offset - DEFAULT_LIMIT);
    setOffset(newOffset);
  }, [offset]);

  const goNext = useCallback(() => {
    if (offset + DEFAULT_LIMIT < pagination.total) {
      setOffset(offset + DEFAULT_LIMIT);
    }
  }, [offset, pagination.total]);

  const reset = useCallback(() => {
    setOffset(0);
    fetchDecks(0);
  }, [fetchDecks]);

  const vm: DecksListVM = {
    status,
    items,
    pagination,
    error: errorMessage ? { message: errorMessage } : null,
  };

  return {
    vm,
    actions: {
      retry,
      goPrev,
      goNext,
      reset,
    },
  };
}
