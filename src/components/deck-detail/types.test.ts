import { describe, it, expect } from "vitest";
import { mapDeckToViewModel, mapCardToViewModel, mapCardsToViewModel } from "./types";
import type { DeckDetailDTO, CardListItemDTO } from "../../types";
import type { DeckDetailVM, CardListItemVM } from "./types";

describe("mapDeckToViewModel", () => {
  it("should transform snake_case to camelCase correctly", () => {
    const dto: DeckDetailDTO = {
      id: "deck-123",
      name: "My Deck",
      due_cards_count: 5,
      created_at: "2024-01-01T00:00:00Z",
      last_used_at: "2024-01-15T12:00:00Z",
    };

    const result: DeckDetailVM = mapDeckToViewModel(dto);

    expect(result.dueCardsCount).toBe(5);
    expect(result.createdAt).toBe("2024-01-01T00:00:00Z");
    expect(result.lastUsedAt).toBe("2024-01-15T12:00:00Z");
  });

  it("should map null last_used_at to undefined", () => {
    const dto: DeckDetailDTO = {
      id: "deck-456",
      name: "New Deck",
      due_cards_count: 0,
      created_at: "2024-01-01T00:00:00Z",
      last_used_at: null,
    };

    const result = mapDeckToViewModel(dto);

    expect(result.lastUsedAt).toBeUndefined();
    expect(result).not.toHaveProperty("last_used_at");
  });

  it("should map non-null last_used_at to string", () => {
    const dto: DeckDetailDTO = {
      id: "deck-789",
      name: "Used Deck",
      due_cards_count: 3,
      created_at: "2024-01-01T00:00:00Z",
      last_used_at: "2024-02-01T10:30:00Z",
    };

    const result = mapDeckToViewModel(dto);

    expect(result.lastUsedAt).toBe("2024-02-01T10:30:00Z");
  });

  it("should preserve all required fields", () => {
    const dto: DeckDetailDTO = {
      id: "deck-abc",
      name: "Complete Deck",
      due_cards_count: 10,
      created_at: "2024-01-01T00:00:00Z",
      last_used_at: null,
    };

    const result = mapDeckToViewModel(dto);

    expect(result.id).toBe("deck-abc");
    expect(result.name).toBe("Complete Deck");
    expect(result.dueCardsCount).toBe(10);
    expect(result.createdAt).toBe("2024-01-01T00:00:00Z");
  });

  it("should preserve ISO date format", () => {
    const isoDate = "2024-03-15T14:30:45.123Z";
    const dto: DeckDetailDTO = {
      id: "deck-date",
      name: "Date Test",
      due_cards_count: 0,
      created_at: isoDate,
      last_used_at: isoDate,
    };

    const result = mapDeckToViewModel(dto);

    expect(result.createdAt).toBe(isoDate);
    expect(result.lastUsedAt).toBe(isoDate);
  });
});

describe("mapCardToViewModel", () => {
  it("should map all fields correctly", () => {
    const dto: CardListItemDTO = {
      id: "card-123",
      front: "Question",
      back: "Answer",
      status: "accepted",
      next_review_at: "2024-01-20T00:00:00Z",
    };

    const result: CardListItemVM = mapCardToViewModel(dto);

    expect(result.id).toBe("card-123");
    expect(result.front).toBe("Question");
    expect(result.back).toBe("Answer");
    expect(result.status).toBe("accepted");
    expect(result.nextReviewAt).toBe("2024-01-20T00:00:00Z");
  });

  it("should map null next_review_at to undefined", () => {
    const dto: CardListItemDTO = {
      id: "card-456",
      front: "New Card",
      back: "Not reviewed yet",
      status: "unverified",
      next_review_at: null,
    };

    const result = mapCardToViewModel(dto);

    expect(result.nextReviewAt).toBeUndefined();
    expect(result).not.toHaveProperty("next_review_at");
  });

  it("should map non-null next_review_at to string", () => {
    const dto: CardListItemDTO = {
      id: "card-789",
      front: "Reviewed Card",
      back: "Has next review",
      status: "accepted",
      next_review_at: "2024-02-01T00:00:00Z",
    };

    const result = mapCardToViewModel(dto);

    expect(result.nextReviewAt).toBe("2024-02-01T00:00:00Z");
  });

  it("should preserve status value for unverified", () => {
    const dto: CardListItemDTO = {
      id: "card-unverified",
      front: "Question",
      back: "Answer",
      status: "unverified",
      next_review_at: null,
    };

    const result = mapCardToViewModel(dto);

    expect(result.status).toBe("unverified");
  });

  it("should preserve status value for accepted", () => {
    const dto: CardListItemDTO = {
      id: "card-accepted",
      front: "Question",
      back: "Answer",
      status: "accepted",
      next_review_at: null,
    };

    const result = mapCardToViewModel(dto);

    expect(result.status).toBe("accepted");
  });

  it("should preserve ISO date format in next_review_at", () => {
    const isoDate = "2024-03-15T14:30:45.123Z";
    const dto: CardListItemDTO = {
      id: "card-date",
      front: "Test",
      back: "Date",
      status: "accepted",
      next_review_at: isoDate,
    };

    const result = mapCardToViewModel(dto);

    expect(result.nextReviewAt).toBe(isoDate);
  });
});

describe("mapCardsToViewModel", () => {
  it("should map empty array to empty array", () => {
    const dtos: CardListItemDTO[] = [];

    const result: CardListItemVM[] = mapCardsToViewModel(dtos);

    expect(result).toEqual([]);
    expect(result).toHaveLength(0);
  });

  it("should map array with 3 elements correctly", () => {
    const dtos: CardListItemDTO[] = [
      {
        id: "card-1",
        front: "Front 1",
        back: "Back 1",
        status: "unverified",
        next_review_at: null,
      },
      {
        id: "card-2",
        front: "Front 2",
        back: "Back 2",
        status: "accepted",
        next_review_at: "2024-01-15T00:00:00Z",
      },
      {
        id: "card-3",
        front: "Front 3",
        back: "Back 3",
        status: "unverified",
        next_review_at: null,
      },
    ];

    const result = mapCardsToViewModel(dtos);

    expect(result).toHaveLength(3);
  });

  it("should correctly transform each element", () => {
    const dtos: CardListItemDTO[] = [
      {
        id: "card-a",
        front: "Question A",
        back: "Answer A",
        status: "accepted",
        next_review_at: "2024-01-20T00:00:00Z",
      },
      {
        id: "card-b",
        front: "Question B",
        back: "Answer B",
        status: "unverified",
        next_review_at: null,
      },
    ];

    const result = mapCardsToViewModel(dtos);

    expect(result[0]).toEqual({
      id: "card-a",
      front: "Question A",
      back: "Answer A",
      status: "accepted",
      nextReviewAt: "2024-01-20T00:00:00Z",
    });

    expect(result[1]).toEqual({
      id: "card-b",
      front: "Question B",
      back: "Answer B",
      status: "unverified",
      nextReviewAt: undefined,
    });
  });

  it("should handle mixed null and non-null next_review_at values", () => {
    const dtos: CardListItemDTO[] = [
      {
        id: "card-1",
        front: "F1",
        back: "B1",
        status: "accepted",
        next_review_at: null,
      },
      {
        id: "card-2",
        front: "F2",
        back: "B2",
        status: "accepted",
        next_review_at: "2024-01-10T00:00:00Z",
      },
      {
        id: "card-3",
        front: "F3",
        back: "B3",
        status: "unverified",
        next_review_at: null,
      },
    ];

    const result = mapCardsToViewModel(dtos);

    expect(result[0].nextReviewAt).toBeUndefined();
    expect(result[1].nextReviewAt).toBe("2024-01-10T00:00:00Z");
    expect(result[2].nextReviewAt).toBeUndefined();
  });

  it("should not mutate the original DTO array", () => {
    const dtos: CardListItemDTO[] = [
      {
        id: "card-immutable",
        front: "Original",
        back: "Data",
        status: "unverified",
        next_review_at: null,
      },
    ];

    const originalDtos = JSON.parse(JSON.stringify(dtos));
    mapCardsToViewModel(dtos);

    expect(dtos).toEqual(originalDtos);
  });

  it("should create new objects in result array", () => {
    const dtos: CardListItemDTO[] = [
      {
        id: "card-ref",
        front: "Test",
        back: "Data",
        status: "accepted",
        next_review_at: null,
      },
    ];

    const result = mapCardsToViewModel(dtos);

    // Verify that modifying result doesn't affect original DTO
    result[0].front = "Modified";
    expect(dtos[0].front).toBe("Test");
  });

  it("should preserve order of elements", () => {
    const dtos: CardListItemDTO[] = [
      { id: "card-1", front: "F1", back: "B1", status: "unverified", next_review_at: null },
      { id: "card-2", front: "F2", back: "B2", status: "accepted", next_review_at: null },
      { id: "card-3", front: "F3", back: "B3", status: "unverified", next_review_at: null },
    ];

    const result = mapCardsToViewModel(dtos);

    expect(result[0].id).toBe("card-1");
    expect(result[1].id).toBe("card-2");
    expect(result[2].id).toBe("card-3");
  });
});
