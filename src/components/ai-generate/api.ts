import type { GenerateCardsCommand, GenerateCardsResponseDTO } from "../../types";

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
 * Generuje fiszki AI dla danej tali
 * POST /api/v1/decks/{deckId}/ai-generate
 */
export async function generateCards(deckId: string, command: GenerateCardsCommand): Promise<GenerateCardsResponseDTO> {
  const response = await fetch(`/api/v1/decks/${deckId}/ai-generate`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(command),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Failed to generate cards", response.status, data.details);
  }

  return response.json();
}
