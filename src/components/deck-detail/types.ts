import type { CardListItemDTO, DeckDetailDTO } from "../../types";

// ============================================================================
// ViewModel Types for Deck Detail View
// ============================================================================

/**
 * Deck detail view model (mapped from DeckDetailDTO)
 */
export interface DeckDetailVM {
  id: string;
  name: string;
  dueCardsCount: number;
  createdAt: string;
  lastUsedAt?: string;
}

/**
 * Card list item view model (mapped from CardListItemDTO)
 */
export interface CardListItemVM {
  id: string;
  front: string;
  back: string;
  status: "unverified" | "accepted";
  nextReviewAt?: string;
}

/**
 * Error view model
 */
export interface ErrorVM {
  message: string;
}

/**
 * Main view model for DeckDetailView
 */
export interface DeckDetailViewVM {
  status: "loading" | "error" | "notFound" | "ready";
  deck: DeckDetailVM | null;
  cards: CardListItemVM[];
  error: ErrorVM | null;
}

/**
 * Maps DeckDetailDTO to DeckDetailVM
 */
export function mapDeckToViewModel(dto: DeckDetailDTO): DeckDetailVM {
  return {
    id: dto.id,
    name: dto.name,
    dueCardsCount: dto.due_cards_count,
    createdAt: dto.created_at,
    lastUsedAt: dto.last_used_at ?? undefined,
  };
}

/**
 * Maps CardListItemDTO to CardListItemVM
 */
export function mapCardToViewModel(dto: CardListItemDTO): CardListItemVM {
  return {
    id: dto.id,
    front: dto.front,
    back: dto.back,
    status: dto.status,
    nextReviewAt: dto.next_review_at ?? undefined,
  };
}

/**
 * Maps array of CardListItemDTO to CardListItemVM
 */
export function mapCardsToViewModel(dtos: CardListItemDTO[]): CardListItemVM[] {
  return dtos.map(mapCardToViewModel);
}
