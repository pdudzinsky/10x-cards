import type { ReviewSessionDTO, ReviewAnswerResponseDTO } from "../../types";
import type { ReviewGrade } from "./types";
import { getAuthHeaders } from "../../lib/api/auth-headers";

// Klasa błędu API
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

// Rozpoczęcie sesji
export async function startReviewSession(deckId: string): Promise<ReviewSessionDTO> {
  const response = await fetch(`/api/v1/decks/${deckId}/reviews/start`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
    },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Nie udało się rozpocząć sesji", response.status, data.details);
  }

  return response.json();
}

// Wysłanie oceny
export async function submitAnswer(cardId: string, grade: ReviewGrade): Promise<ReviewAnswerResponseDTO> {
  const response = await fetch(`/api/v1/reviews/${cardId}/answer`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify({ grade }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new ApiError(data.error || "Nie udało się zapisać oceny", response.status, data.details);
  }

  return response.json();
}
