import type { GenerateCardsCommand, GenerateCardsResponseDTO, ProfileDTO } from "../../types";
import { getAuthHeaders } from "../../lib/api/auth-headers";

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
 * Pobiera profil użytkownika z limitem generacji
 * GET /api/v1/profile
 */
export async function fetchProfile(): Promise<ProfileDTO> {
  const response = await fetch("/api/v1/profile", {
    method: "GET",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Failed to fetch profile", response.status, data.details);
  }

  return response.json();
}

/**
 * Generuje fiszki AI dla danej tali
 * POST /api/v1/decks/{deckId}/ai-generate
 */
export async function generateCards(deckId: string, command: GenerateCardsCommand): Promise<GenerateCardsResponseDTO> {
  const response = await fetch(`/api/v1/decks/${deckId}/ai-generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Failed to generate cards", response.status, data.details);
  }

  return response.json();
}
