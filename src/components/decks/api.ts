import type { CreateDeckCommand, DeckDTO, PaginatedDecksResponseDTO } from "../../types";
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
 * Lists user's decks with pagination
 */
export async function listDecks(
  limit: number,
  offset: number,
  signal?: AbortSignal
): Promise<PaginatedDecksResponseDTO> {
  const url = new URL("/api/v1/decks", window.location.origin);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));

  const response = await fetch(url.toString(), {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
    signal,
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Failed to fetch decks", response.status, data.details);
  }

  return response.json();
}

/**
 * Creates a new deck
 */
export async function createDeck(command: CreateDeckCommand): Promise<DeckDTO> {
  const response = await fetch("/api/v1/decks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Failed to create deck", response.status, data.details);
  }

  return response.json();
}
