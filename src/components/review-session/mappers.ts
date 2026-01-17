import type { ReviewCardDTO, ReviewSessionDTO } from "../../types";
import type { ReviewCardVM, ReviewSessionVM } from "./types";

export function mapCardToViewModel(dto: ReviewCardDTO): ReviewCardVM {
  return {
    id: dto.id,
    front: dto.front,
    back: dto.back,
  };
}

export function mapSessionToViewModel(dto: ReviewSessionDTO): ReviewSessionVM {
  const cards = dto.cards.map(mapCardToViewModel);
  return {
    cards,
    currentIndex: 0,
    totalCards: cards.length,
  };
}
