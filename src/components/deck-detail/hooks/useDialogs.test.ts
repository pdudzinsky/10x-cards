import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";

import { useDialogs } from "./useDialogs";

describe("useDialogs", () => {
  describe("Initial state", () => {
    it("wszystkie dialogi są zamknięte", () => {
      const { result } = renderHook(() => useDialogs());

      expect(result.current.dialogs.deleteDeck).toBe(false);
      expect(result.current.dialogs.deleteCard).toEqual({
        isOpen: false,
        cardId: null,
      });
      expect(result.current.dialogs.rejectAll).toBe(false);
    });
  });

  describe("DeleteDeck dialog", () => {
    it("openDeleteDeck() ustawia deleteDeck na true", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.openDeleteDeck();
      });

      expect(result.current.dialogs.deleteDeck).toBe(true);
    });

    it("closeDeleteDeck() ustawia deleteDeck na false", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.openDeleteDeck();
      });

      expect(result.current.dialogs.deleteDeck).toBe(true);

      act(() => {
        result.current.closeDeleteDeck();
      });

      expect(result.current.dialogs.deleteDeck).toBe(false);
    });

    it("wielokrotne open/close działa poprawnie", () => {
      const { result } = renderHook(() => useDialogs());

      // Pierwszy cykl
      act(() => {
        result.current.openDeleteDeck();
      });
      expect(result.current.dialogs.deleteDeck).toBe(true);

      act(() => {
        result.current.closeDeleteDeck();
      });
      expect(result.current.dialogs.deleteDeck).toBe(false);

      // Drugi cykl
      act(() => {
        result.current.openDeleteDeck();
      });
      expect(result.current.dialogs.deleteDeck).toBe(true);

      act(() => {
        result.current.closeDeleteDeck();
      });
      expect(result.current.dialogs.deleteDeck).toBe(false);
    });
  });

  describe("DeleteCard dialog", () => {
    it("openDeleteCard() otwiera dialog i zapisuje cardId", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.openDeleteCard("abc-123");
      });

      expect(result.current.dialogs.deleteCard).toEqual({
        isOpen: true,
        cardId: "abc-123",
      });
    });

    it("openDeleteCard() z różnymi ID zapisuje poprawne wartości", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.openDeleteCard("first-id");
      });

      expect(result.current.dialogs.deleteCard.cardId).toBe("first-id");

      act(() => {
        result.current.openDeleteCard("second-id");
      });

      expect(result.current.dialogs.deleteCard.cardId).toBe("second-id");
    });

    it("closeDeleteCard() zamyka dialog i czyści cardId", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.openDeleteCard("abc-123");
      });

      expect(result.current.dialogs.deleteCard.isOpen).toBe(true);
      expect(result.current.dialogs.deleteCard.cardId).toBe("abc-123");

      act(() => {
        result.current.closeDeleteCard();
      });

      expect(result.current.dialogs.deleteCard).toEqual({
        isOpen: false,
        cardId: null,
      });
    });

    it("wielokrotne open/close z różnymi ID działa poprawnie", () => {
      const { result } = renderHook(() => useDialogs());

      // Pierwszy cykl
      act(() => {
        result.current.openDeleteCard("card-1");
      });
      expect(result.current.dialogs.deleteCard).toEqual({
        isOpen: true,
        cardId: "card-1",
      });

      act(() => {
        result.current.closeDeleteCard();
      });
      expect(result.current.dialogs.deleteCard).toEqual({
        isOpen: false,
        cardId: null,
      });

      // Drugi cykl z innym ID
      act(() => {
        result.current.openDeleteCard("card-2");
      });
      expect(result.current.dialogs.deleteCard).toEqual({
        isOpen: true,
        cardId: "card-2",
      });
    });
  });

  describe("RejectAll dialog", () => {
    it("openRejectAll() ustawia rejectAll na true", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.openRejectAll();
      });

      expect(result.current.dialogs.rejectAll).toBe(true);
    });

    it("closeRejectAll() ustawia rejectAll na false", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.openRejectAll();
      });

      expect(result.current.dialogs.rejectAll).toBe(true);

      act(() => {
        result.current.closeRejectAll();
      });

      expect(result.current.dialogs.rejectAll).toBe(false);
    });

    it("wielokrotne open/close działa poprawnie", () => {
      const { result } = renderHook(() => useDialogs());

      // Pierwszy cykl
      act(() => {
        result.current.openRejectAll();
      });
      expect(result.current.dialogs.rejectAll).toBe(true);

      act(() => {
        result.current.closeRejectAll();
      });
      expect(result.current.dialogs.rejectAll).toBe(false);

      // Drugi cykl
      act(() => {
        result.current.openRejectAll();
      });
      expect(result.current.dialogs.rejectAll).toBe(true);
    });
  });

  describe("Izolacja stanów dialogów", () => {
    it("otwarcie deleteDeck nie wpływa na deleteCard", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.openDeleteDeck();
      });

      expect(result.current.dialogs.deleteDeck).toBe(true);
      expect(result.current.dialogs.deleteCard).toEqual({
        isOpen: false,
        cardId: null,
      });
    });

    it("otwarcie deleteDeck nie wpływa na rejectAll", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.openDeleteDeck();
      });

      expect(result.current.dialogs.deleteDeck).toBe(true);
      expect(result.current.dialogs.rejectAll).toBe(false);
    });

    it("otwarcie deleteCard nie wpływa na deleteDeck", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.openDeleteCard("test-id");
      });

      expect(result.current.dialogs.deleteCard.isOpen).toBe(true);
      expect(result.current.dialogs.deleteDeck).toBe(false);
    });

    it("otwarcie deleteCard nie wpływa na rejectAll", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.openDeleteCard("test-id");
      });

      expect(result.current.dialogs.deleteCard.isOpen).toBe(true);
      expect(result.current.dialogs.rejectAll).toBe(false);
    });

    it("otwarcie rejectAll nie wpływa na deleteDeck", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.openRejectAll();
      });

      expect(result.current.dialogs.rejectAll).toBe(true);
      expect(result.current.dialogs.deleteDeck).toBe(false);
    });

    it("otwarcie rejectAll nie wpływa na deleteCard", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.openRejectAll();
      });

      expect(result.current.dialogs.rejectAll).toBe(true);
      expect(result.current.dialogs.deleteCard).toEqual({
        isOpen: false,
        cardId: null,
      });
    });

    it("zamknięcie deleteCard nie wpływa na inne dialogi", () => {
      const { result } = renderHook(() => useDialogs());

      // Otwórz wszystkie dialogi
      act(() => {
        result.current.openDeleteDeck();
        result.current.openDeleteCard("test-id");
        result.current.openRejectAll();
      });

      // Zamknij tylko deleteCard
      act(() => {
        result.current.closeDeleteCard();
      });

      expect(result.current.dialogs.deleteCard.isOpen).toBe(false);
      expect(result.current.dialogs.deleteDeck).toBe(true);
      expect(result.current.dialogs.rejectAll).toBe(true);
    });

    it("zamknięcie deleteDeck nie wpływa na inne dialogi", () => {
      const { result } = renderHook(() => useDialogs());

      // Otwórz wszystkie dialogi
      act(() => {
        result.current.openDeleteDeck();
        result.current.openDeleteCard("test-id");
        result.current.openRejectAll();
      });

      // Zamknij tylko deleteDeck
      act(() => {
        result.current.closeDeleteDeck();
      });

      expect(result.current.dialogs.deleteDeck).toBe(false);
      expect(result.current.dialogs.deleteCard.isOpen).toBe(true);
      expect(result.current.dialogs.rejectAll).toBe(true);
    });

    it("zamknięcie rejectAll nie wpływa na inne dialogi", () => {
      const { result } = renderHook(() => useDialogs());

      // Otwórz wszystkie dialogi
      act(() => {
        result.current.openDeleteDeck();
        result.current.openDeleteCard("test-id");
        result.current.openRejectAll();
      });

      // Zamknij tylko rejectAll
      act(() => {
        result.current.closeRejectAll();
      });

      expect(result.current.dialogs.rejectAll).toBe(false);
      expect(result.current.dialogs.deleteDeck).toBe(true);
      expect(result.current.dialogs.deleteCard.isOpen).toBe(true);
    });

    it("można otworzyć wiele dialogów jednocześnie", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.openDeleteDeck();
        result.current.openDeleteCard("test-id");
        result.current.openRejectAll();
      });

      expect(result.current.dialogs.deleteDeck).toBe(true);
      expect(result.current.dialogs.deleteCard).toEqual({
        isOpen: true,
        cardId: "test-id",
      });
      expect(result.current.dialogs.rejectAll).toBe(true);
    });
  });

  describe("Stabilność funkcji (useCallback)", () => {
    it("funkcje są stabilne między re-renderami", () => {
      const { result, rerender } = renderHook(() => useDialogs());

      const initialFunctions = {
        openDeleteDeck: result.current.openDeleteDeck,
        closeDeleteDeck: result.current.closeDeleteDeck,
        openDeleteCard: result.current.openDeleteCard,
        closeDeleteCard: result.current.closeDeleteCard,
        openRejectAll: result.current.openRejectAll,
        closeRejectAll: result.current.closeRejectAll,
      };

      // Wywołaj akcję żeby zmienić state
      act(() => {
        result.current.openDeleteDeck();
      });

      rerender();

      // Funkcje powinny być te same (referential equality)
      expect(result.current.openDeleteDeck).toBe(initialFunctions.openDeleteDeck);
      expect(result.current.closeDeleteDeck).toBe(initialFunctions.closeDeleteDeck);
      expect(result.current.openDeleteCard).toBe(initialFunctions.openDeleteCard);
      expect(result.current.closeDeleteCard).toBe(initialFunctions.closeDeleteCard);
      expect(result.current.openRejectAll).toBe(initialFunctions.openRejectAll);
      expect(result.current.closeRejectAll).toBe(initialFunctions.closeRejectAll);
    });
  });

  describe("Edge cases", () => {
    it("openDeleteCard() z pustym stringiem zapisuje pustego stringa", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.openDeleteCard("");
      });

      expect(result.current.dialogs.deleteCard).toEqual({
        isOpen: true,
        cardId: "",
      });
    });

    it("closeDeleteCard() gdy dialog jest już zamknięty nie powoduje problemów", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.closeDeleteCard();
      });

      expect(result.current.dialogs.deleteCard).toEqual({
        isOpen: false,
        cardId: null,
      });
    });

    it("closeDeleteDeck() gdy dialog jest już zamknięty nie powoduje problemów", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.closeDeleteDeck();
      });

      expect(result.current.dialogs.deleteDeck).toBe(false);
    });

    it("closeRejectAll() gdy dialog jest już zamknięty nie powoduje problemów", () => {
      const { result } = renderHook(() => useDialogs());

      act(() => {
        result.current.closeRejectAll();
      });

      expect(result.current.dialogs.rejectAll).toBe(false);
    });

    it("openDeleteCard() z bardzo długim ID działa poprawnie", () => {
      const { result } = renderHook(() => useDialogs());
      const longId = "a".repeat(1000);

      act(() => {
        result.current.openDeleteCard(longId);
      });

      expect(result.current.dialogs.deleteCard).toEqual({
        isOpen: true,
        cardId: longId,
      });
    });

    it("openDeleteCard() ze specjalnymi znakami działa poprawnie", () => {
      const { result } = renderHook(() => useDialogs());
      const specialId = "test-!@#$%^&*()_+-={}[]|:;<>?,./";

      act(() => {
        result.current.openDeleteCard(specialId);
      });

      expect(result.current.dialogs.deleteCard).toEqual({
        isOpen: true,
        cardId: specialId,
      });
    });
  });
});
