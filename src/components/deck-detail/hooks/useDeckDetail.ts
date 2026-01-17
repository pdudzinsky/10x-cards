import { useCallback, useEffect, useRef, useState } from "react";

import type { CardStatusFilter } from "../../../types";
import * as api from "../api";
import { ApiError } from "../api";
import type { CardListItemVM, DeckDetailVM } from "../types";
import { mapCardsToViewModel, mapDeckToViewModel } from "../types";

interface UseDeckDetailOptions {
  deckId: string;
  onUnauthorized?: () => void;
}

interface UseDeckDetailResult {
  // State
  status: "loading" | "error" | "notFound" | "ready";
  deck: DeckDetailVM | null;
  cards: CardListItemVM[];
  statusFilter: CardStatusFilter;
  isCardsLoading: boolean;
  error: string | null;

  // Computed
  hasUnverified: boolean;
  unverifiedCount: number;

  // Actions
  setStatusFilter: (filter: CardStatusFilter) => void;
  refetch: () => Promise<void>;

  // CRUD deck
  updateDeck: (name: string) => Promise<void>;
  deleteDeck: () => Promise<void>;

  // CRUD cards
  createCard: (front: string, back: string) => Promise<void>;
  updateCard: (cardId: string, front: string, back: string) => Promise<void>;
  deleteCard: (cardId: string) => Promise<void>;
  acceptCard: (cardId: string) => Promise<void>;
  rejectCard: (cardId: string) => Promise<void>;

  // Bulk operations
  acceptAll: () => Promise<void>;
  rejectAll: () => Promise<void>;
}

/**
 * Hook for managing deck detail view state
 */
export function useDeckDetail(options: UseDeckDetailOptions): UseDeckDetailResult {
  const { deckId, onUnauthorized } = options;

  // State
  const [status, setStatus] = useState<"loading" | "error" | "notFound" | "ready">("loading");
  const [deck, setDeck] = useState<DeckDetailVM | null>(null);
  const [cards, setCards] = useState<CardListItemVM[]>([]);
  const [statusFilter, setStatusFilter] = useState<CardStatusFilter>("all");
  const [isCardsLoading, setIsCardsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);

  // Fetch deck details
  const fetchDeck = useCallback(async () => {
    abortControllerRef.current?.abort();
    abortControllerRef.current = new AbortController();

    setStatus("loading");
    setError(null);

    try {
      const deckData = await api.fetchDeck(deckId, abortControllerRef.current.signal);
      setDeck(mapDeckToViewModel(deckData));
      setStatus("ready");
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return;
      }

      if (err instanceof ApiError) {
        if (err.status === 401) {
          onUnauthorized?.();
          return;
        }
        if (err.status === 404) {
          setStatus("notFound");
          return;
        }
      }

      setStatus("error");
      setError(err instanceof Error ? err.message : "Nie udało się pobrać tali");
    }
  }, [deckId, onUnauthorized]);

  // Fetch cards with current filter
  const fetchCards = useCallback(async () => {
    setIsCardsLoading(true);
    setError(null);

    try {
      const cardsData = await api.listCards(deckId, statusFilter);
      setCards(mapCardsToViewModel(cardsData.items));
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          onUnauthorized?.();
          return;
        }
        if (err.status === 404) {
          setStatus("notFound");
          return;
        }
      }

      setError(err instanceof Error ? err.message : "Nie udało się pobrać fiszek");
    } finally {
      setIsCardsLoading(false);
    }
  }, [deckId, statusFilter, onUnauthorized]);

  // Initial fetch on mount
  useEffect(() => {
    fetchDeck();

    return () => {
      abortControllerRef.current?.abort();
    };
  }, [fetchDeck]);

  // Fetch cards when deck is ready or filter changes
  useEffect(() => {
    if (status === "ready") {
      fetchCards();
    }
  }, [status, fetchCards]);

  // Refetch both deck and cards
  const refetch = useCallback(async () => {
    await fetchDeck();
  }, [fetchDeck]);

  // Update deck
  const handleUpdateDeck = useCallback(
    async (name: string) => {
      try {
        await api.updateDeck(deckId, { name });
        await fetchDeck(); // Refresh deck to update name
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          onUnauthorized?.();
          return;
        }
        throw err;
      }
    },
    [deckId, fetchDeck, onUnauthorized]
  );

  // Delete deck
  const handleDeleteDeck = useCallback(async () => {
    try {
      await api.deleteDeck(deckId);
      window.location.href = "/decks";
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized?.();
        return;
      }
      throw err;
    }
  }, [deckId, onUnauthorized]);

  // Create card
  const handleCreateCard = useCallback(
    async (front: string, back: string) => {
      try {
        await api.createCard(deckId, { front, back });
        await fetchCards();
        await fetchDeck(); // Refresh deck to update due_cards_count
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          onUnauthorized?.();
          return;
        }
        throw err;
      }
    },
    [deckId, fetchCards, fetchDeck, onUnauthorized]
  );

  // Update card
  const handleUpdateCard = useCallback(
    async (cardId: string, front: string, back: string) => {
      try {
        await api.updateCard(cardId, { front, back });
        await fetchCards();
        await fetchDeck();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          onUnauthorized?.();
          return;
        }
        throw err;
      }
    },
    [fetchCards, fetchDeck, onUnauthorized]
  );

  // Delete card
  const handleDeleteCard = useCallback(
    async (cardId: string) => {
      try {
        await api.deleteCard(cardId);
        await fetchCards();
        await fetchDeck();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          onUnauthorized?.();
          return;
        }
        throw err;
      }
    },
    [fetchCards, fetchDeck, onUnauthorized]
  );

  // Accept card
  const handleAcceptCard = useCallback(
    async (cardId: string) => {
      try {
        await api.acceptCard(cardId);
        await fetchCards();
        await fetchDeck();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          onUnauthorized?.();
          return;
        }
        throw err;
      }
    },
    [fetchCards, fetchDeck, onUnauthorized]
  );

  // Reject card (delete unverified card)
  const handleRejectCard = useCallback(
    async (cardId: string) => {
      try {
        await api.deleteCard(cardId);
        await fetchCards();
        await fetchDeck();
      } catch (err) {
        if (err instanceof ApiError && err.status === 401) {
          onUnauthorized?.();
          return;
        }
        throw err;
      }
    },
    [fetchCards, fetchDeck, onUnauthorized]
  );

  // Accept all cards
  const handleAcceptAll = useCallback(async () => {
    try {
      await api.acceptAllCards(deckId);
      await fetchCards();
      await fetchDeck();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized?.();
        return;
      }
      throw err;
    }
  }, [deckId, fetchCards, fetchDeck, onUnauthorized]);

  // Reject all cards (delete all unverified)
  const handleRejectAll = useCallback(async () => {
    try {
      await api.rejectAllCards(deckId);
      await fetchCards();
      await fetchDeck();
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        onUnauthorized?.();
        return;
      }
      throw err;
    }
  }, [deckId, fetchCards, fetchDeck, onUnauthorized]);

  // Computed values
  const hasUnverified = cards.some((card) => card.status === "unverified");
  const unverifiedCount = cards.filter((card) => card.status === "unverified").length;

  return {
    // State
    status,
    deck,
    cards,
    statusFilter,
    isCardsLoading,
    error,

    // Computed
    hasUnverified,
    unverifiedCount,

    // Actions
    setStatusFilter,
    refetch,

    // CRUD deck
    updateDeck: handleUpdateDeck,
    deleteDeck: handleDeleteDeck,

    // CRUD cards
    createCard: handleCreateCard,
    updateCard: handleUpdateCard,
    deleteCard: handleDeleteCard,
    acceptCard: handleAcceptCard,
    rejectCard: handleRejectCard,

    // Bulk operations
    acceptAll: handleAcceptAll,
    rejectAll: handleRejectAll,
  };
}
