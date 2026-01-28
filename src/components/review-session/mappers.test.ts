import { describe, it, expect } from "vitest";
import { mapCardToViewModel, mapSessionToViewModel } from "./mappers";
import type { ReviewCardDTO, ReviewSessionDTO } from "../../types";
import type { ReviewCardVM, ReviewSessionVM } from "./types";

describe("mapCardToViewModel", () => {
  it("should map all DTO fields to ViewModel correctly", () => {
    const dto: ReviewCardDTO = {
      id: "card-123",
      front: "What is TypeScript?",
      back: "A typed superset of JavaScript",
    };

    const result: ReviewCardVM = mapCardToViewModel(dto);

    expect(result).toEqual({
      id: "card-123",
      front: "What is TypeScript?",
      back: "A typed superset of JavaScript",
    });
  });

  it("should preserve data types", () => {
    const dto: ReviewCardDTO = {
      id: "card-456",
      front: "Front content",
      back: "Back content",
    };

    const result = mapCardToViewModel(dto);

    expect(typeof result.id).toBe("string");
    expect(typeof result.front).toBe("string");
    expect(typeof result.back).toBe("string");
  });

  it("should handle empty strings in front and back", () => {
    const dto: ReviewCardDTO = {
      id: "card-789",
      front: "",
      back: "",
    };

    const result = mapCardToViewModel(dto);

    expect(result.front).toBe("");
    expect(result.back).toBe("");
  });

  it("should not mutate the original DTO", () => {
    const dto: ReviewCardDTO = {
      id: "card-original",
      front: "Original front",
      back: "Original back",
    };

    const originalDto = { ...dto };
    mapCardToViewModel(dto);

    expect(dto).toEqual(originalDto);
  });
});

describe("mapSessionToViewModel", () => {
  it("should map empty cards array with totalCards = 0", () => {
    const dto: ReviewSessionDTO = {
      cards: [],
    };

    const result: ReviewSessionVM = mapSessionToViewModel(dto);

    expect(result.cards).toEqual([]);
    expect(result.currentIndex).toBe(0);
    expect(result.totalCards).toBe(0);
  });

  it("should map session with 3 cards correctly", () => {
    const dto: ReviewSessionDTO = {
      cards: [
        { id: "card-1", front: "Front 1", back: "Back 1" },
        { id: "card-2", front: "Front 2", back: "Back 2" },
        { id: "card-3", front: "Front 3", back: "Back 3" },
      ],
    };

    const result = mapSessionToViewModel(dto);

    expect(result.cards).toHaveLength(3);
    expect(result.currentIndex).toBe(0);
    expect(result.totalCards).toBe(3);
  });

  it("should map each card in the array correctly", () => {
    const dto: ReviewSessionDTO = {
      cards: [
        { id: "card-a", front: "Question A", back: "Answer A" },
        { id: "card-b", front: "Question B", back: "Answer B" },
      ],
    };

    const result = mapSessionToViewModel(dto);

    expect(result.cards[0]).toEqual({
      id: "card-a",
      front: "Question A",
      back: "Answer A",
    });
    expect(result.cards[1]).toEqual({
      id: "card-b",
      front: "Question B",
      back: "Answer B",
    });
  });

  it("should always initialize currentIndex to 0", () => {
    const dto: ReviewSessionDTO = {
      cards: [{ id: "card-x", front: "Front X", back: "Back X" }],
    };

    const result = mapSessionToViewModel(dto);

    expect(result.currentIndex).toBe(0);
  });

  it("should calculate totalCards based on array length", () => {
    const dtoWith5Cards: ReviewSessionDTO = {
      cards: [
        { id: "1", front: "F1", back: "B1" },
        { id: "2", front: "F2", back: "B2" },
        { id: "3", front: "F3", back: "B3" },
        { id: "4", front: "F4", back: "B4" },
        { id: "5", front: "F5", back: "B5" },
      ],
    };

    const result = mapSessionToViewModel(dtoWith5Cards);

    expect(result.totalCards).toBe(5);
  });

  it("should not mutate the original DTO", () => {
    const dto: ReviewSessionDTO = {
      cards: [{ id: "card-immutable", front: "Original", back: "Data" }],
    };

    const originalDto = JSON.parse(JSON.stringify(dto));
    mapSessionToViewModel(dto);

    expect(dto).toEqual(originalDto);
  });

  it("should create new card objects in ViewModel", () => {
    const dto: ReviewSessionDTO = {
      cards: [{ id: "card-ref", front: "Test", back: "Data" }],
    };

    const result = mapSessionToViewModel(dto);

    // Verify that modifying result doesn't affect original DTO
    result.cards[0].front = "Modified";
    expect(dto.cards[0].front).toBe("Test");
  });
});
