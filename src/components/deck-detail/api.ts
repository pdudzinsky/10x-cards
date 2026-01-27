import type {
  AcceptAllResponseDTO,
  CardDTO,
  CardListResponseDTO,
  CardStatusFilter,
  CreateCardCommand,
  DeckDetailDTO,
  DeckDTO,
  DeleteUnverifiedResponseDTO,
  UpdateCardCommand,
  UpdateDeckCommand,
} from "../../types";
import { getAuthHeaders } from "../../lib/api/auth-headers";

/**
 * API error with status code
 */
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Fetches deck details with due cards count
 * GET /api/v1/decks/{deckId}
 */
export async function fetchDeck(deckId: string, signal?: AbortSignal): Promise<DeckDetailDTO> {
  const response = await fetch(`/api/v1/decks/${deckId}`, {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Failed to fetch deck", response.status, data.details);
  }

  return response.json();
}

/**
 * Updates a deck's name
 * PATCH /api/v1/decks/{deckId}
 */
export async function updateDeck(deckId: string, command: UpdateDeckCommand): Promise<DeckDTO> {
  const response = await fetch(`/api/v1/decks/${deckId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Failed to update deck", response.status, data.details);
  }

  return response.json();
}

/**
 * Deletes a deck and all its cards
 * DELETE /api/v1/decks/{deckId}
 */
export async function deleteDeck(deckId: string): Promise<void> {
  const response = await fetch(`/api/v1/decks/${deckId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Failed to delete deck", response.status, data.details);
  }
}

/**
 * Lists cards in a deck with optional status filtering
 * GET /api/v1/decks/{deckId}/cards?status={filter}
 */
export async function listCards(
  deckId: string,
  status: CardStatusFilter,
  signal?: AbortSignal
): Promise<CardListResponseDTO> {
  const url = new URL(`/api/v1/decks/${deckId}/cards`, window.location.origin);
  url.searchParams.set("status", status);

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Failed to fetch cards", response.status, data.details);
  }

  return response.json();
}

/**
 * Creates a new card in the deck
 * POST /api/v1/decks/{deckId}/cards
 */
export async function createCard(deckId: string, command: CreateCardCommand): Promise<CardDTO> {
  const response = await fetch(`/api/v1/decks/${deckId}/cards`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Failed to create card", response.status, data.details);
  }

  return response.json();
}

/**
 * Updates a card's content
 * PATCH /api/v1/cards/{cardId}
 */
export async function updateCard(cardId: string, command: UpdateCardCommand): Promise<CardDTO> {
  const response = await fetch(`/api/v1/cards/${cardId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Failed to update card", response.status, data.details);
  }

  return response.json();
}

/**
 * Deletes a card
 * DELETE /api/v1/cards/{cardId}
 */
export async function deleteCard(cardId: string): Promise<void> {
  const response = await fetch(`/api/v1/cards/${cardId}`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Failed to delete card", response.status, data.details);
  }
}

/**
 * Accepts a single card (sets status to accepted)
 * POST /api/v1/cards/{cardId}/accept
 */
export async function acceptCard(cardId: string): Promise<{ id: string; status: string; next_review_at: string }> {
  const response = await fetch(`/api/v1/cards/${cardId}/accept`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Failed to accept card", response.status, data.details);
  }

  return response.json();
}

/**
 * Accepts all unverified cards in a deck
 * POST /api/v1/decks/{deckId}/cards/accept-all
 */
export async function acceptAllCards(deckId: string): Promise<AcceptAllResponseDTO> {
  const response = await fetch(`/api/v1/decks/${deckId}/cards/accept-all`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Failed to accept all cards", response.status, data.details);
  }

  return response.json();
}

/**
 * Deletes all unverified cards in a deck (reject all)
 * DELETE /api/v1/decks/{deckId}/cards/unverified
 */
export async function rejectAllCards(deckId: string): Promise<DeleteUnverifiedResponseDTO> {
  const response = await fetch(`/api/v1/decks/${deckId}/cards/unverified`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Failed to reject all cards", response.status, data.details);
  }

  return response.json();
}
