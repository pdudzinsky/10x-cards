import { useCallback, useState } from "react";

import type { DialogsState } from "../../../types";

interface UseDialogsResult {
  dialogs: DialogsState;
  openDeleteDeck: () => void;
  closeDeleteDeck: () => void;
  openDeleteCard: (cardId: string) => void;
  closeDeleteCard: () => void;
  openRejectAll: () => void;
  closeRejectAll: () => void;
}

/**
 * Hook for managing confirmation dialogs state
 */
export function useDialogs(): UseDialogsResult {
  const [dialogs, setDialogs] = useState<DialogsState>({
    deleteDeck: false,
    deleteCard: { isOpen: false, cardId: null },
    rejectAll: false,
  });

  const openDeleteDeck = useCallback(() => {
    setDialogs((prev) => ({ ...prev, deleteDeck: true }));
  }, []);

  const closeDeleteDeck = useCallback(() => {
    setDialogs((prev) => ({ ...prev, deleteDeck: false }));
  }, []);

  const openDeleteCard = useCallback((cardId: string) => {
    setDialogs((prev) => ({
      ...prev,
      deleteCard: { isOpen: true, cardId },
    }));
  }, []);

  const closeDeleteCard = useCallback(() => {
    setDialogs((prev) => ({
      ...prev,
      deleteCard: { isOpen: false, cardId: null },
    }));
  }, []);

  const openRejectAll = useCallback(() => {
    setDialogs((prev) => ({ ...prev, rejectAll: true }));
  }, []);

  const closeRejectAll = useCallback(() => {
    setDialogs((prev) => ({ ...prev, rejectAll: false }));
  }, []);

  return {
    dialogs,
    openDeleteDeck,
    closeDeleteDeck,
    openDeleteCard,
    closeDeleteCard,
    openRejectAll,
    closeRejectAll,
  };
}
