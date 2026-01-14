import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../db/database.types";
import type { ReviewCardDTO, ReviewSessionDTO, ReviewAnswerResponseDTO } from "../../types";

export type SupabaseClientType = SupabaseClient<Database>;

// ============================================================================
// Custom Errors
// ============================================================================

/**
 * Error thrown when card is not found or user doesn't have permission
 */
export class CardNotFoundError extends Error {
  constructor(cardId: string) {
    super(`Card with id ${cardId} not found or you don't have permission to access it`);
    this.name = "CardNotFoundError";
  }
}

/**
 * Error thrown when card is not available for review (not 'accepted' status)
 */
export class CardNotAvailableForReviewError extends Error {
  constructor(cardId: string) {
    super(`Card with id ${cardId} is not available for review`);
    this.name = "CardNotAvailableForReviewError";
  }
}

/**
 * Error thrown when deck is not found or user doesn't have permission
 */
export class DeckNotFoundError extends Error {
  constructor(deckId: string) {
    super(`Deck with id ${deckId} not found or you don't have permission to access it`);
    this.name = "DeckNotFoundError";
  }
}

// ============================================================================
// Internal Types
// ============================================================================

/**
 * SM-2 parameters for a card
 */
interface SM2Parameters {
  interval_days: number;
  repetitions: number;
  ease_factor_x100: number;
}

/**
 * Result of SM-2 calculation
 */
interface SM2Result {
  interval_days: number;
  repetitions: number;
  ease_factor_x100: number;
  next_review_at: string;
  last_reviewed_at: string;
}

// ============================================================================
// SM-2 Algorithm
// ============================================================================

/**
 * Calculates new SM-2 parameters based on user's grade
 * Implementation based on original SM-2 algorithm:
 * - grade >= 3: card is recalled successfully, increase interval
 * - grade < 3: card is not recalled, reset to beginning
 *
 * @param grade - User's grade (0-5)
 * @param currentParams - Current SM-2 parameters
 * @returns New SM-2 parameters with next_review_at
 */
export function calculateSM2(grade: 0 | 1 | 2 | 3 | 4 | 5, currentParams: SM2Parameters): SM2Result {
  const now = new Date();

  let newInterval: number;
  let newRepetitions: number;

  if (grade >= 3) {
    // Successful recall
    if (currentParams.repetitions === 0) {
      newInterval = 1;
    } else if (currentParams.repetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(currentParams.interval_days * (currentParams.ease_factor_x100 / 100));
    }
    newRepetitions = currentParams.repetitions + 1;
  } else {
    // Failed recall - reset
    newRepetitions = 0;
    newInterval = 1;
  }

  // Calculate new ease factor: EF' = EF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02))
  const efDelta = 0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02);
  let newEaseFactorX100 = currentParams.ease_factor_x100 + Math.round(efDelta * 100);

  // Minimum EF = 1.3 (130 in x100 format)
  newEaseFactorX100 = Math.max(130, newEaseFactorX100);

  // Calculate next review date
  const nextReviewAt = new Date(now.getTime() + newInterval * 24 * 60 * 60 * 1000);

  return {
    interval_days: newInterval,
    repetitions: newRepetitions,
    ease_factor_x100: newEaseFactorX100,
    next_review_at: nextReviewAt.toISOString(),
    last_reviewed_at: now.toISOString(),
  };
}

// ============================================================================
// Review Service Functions
// ============================================================================

/**
 * Gets cards that are due for review in a deck
 * Returns cards with status 'accepted' and next_review_at <= now()
 * Ordered by next_review_at ASC (most overdue first)
 */
export async function getCardsForReview(
  supabase: SupabaseClientType,
  deckId: string,
  userId: string
): Promise<ReviewSessionDTO> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("cards")
    .select("id, front, back")
    .eq("deck_id", deckId)
    .eq("owner_id", userId)
    .eq("status", "accepted")
    .lte("next_review_at", now)
    .order("next_review_at", { ascending: true });

  if (error) {
    throw error;
  }

  const cards: ReviewCardDTO[] = (data || []).map((card) => ({
    id: card.id,
    front: card.front,
    back: card.back,
  }));

  return { cards };
}

/**
 * Updates the deck's last_used_at timestamp
 */
export async function updateDeckLastUsedAt(
  supabase: SupabaseClientType,
  deckId: string,
  userId: string
): Promise<void> {
  const now = new Date().toISOString();

  const { error } = await supabase.from("decks").update({ last_used_at: now }).eq("id", deckId).eq("owner_id", userId);

  if (error) {
    throw error;
  }
}

/**
 * Gets a card with its SM-2 parameters for review
 * Verifies ownership and that card has 'accepted' status
 */
export async function getCardWithSM2Params(
  supabase: SupabaseClientType,
  cardId: string,
  userId: string
): Promise<SM2Parameters & { status: string }> {
  const { data, error } = await supabase
    .from("cards")
    .select("interval_days, repetitions, ease_factor_x100, status")
    .eq("id", cardId)
    .eq("owner_id", userId)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new CardNotFoundError(cardId);
    }
    throw error;
  }

  if (!data) {
    throw new CardNotFoundError(cardId);
  }

  return data;
}

/**
 * Updates a card with new SM-2 parameters after review
 */
export async function updateCardSM2(
  supabase: SupabaseClientType,
  cardId: string,
  userId: string,
  sm2Result: SM2Result
): Promise<ReviewAnswerResponseDTO> {
  const { error } = await supabase
    .from("cards")
    .update({
      interval_days: sm2Result.interval_days,
      repetitions: sm2Result.repetitions,
      ease_factor_x100: sm2Result.ease_factor_x100,
      next_review_at: sm2Result.next_review_at,
      last_reviewed_at: sm2Result.last_reviewed_at,
      updated_at: sm2Result.last_reviewed_at,
    })
    .eq("id", cardId)
    .eq("owner_id", userId);

  if (error) {
    throw error;
  }

  return {
    next_review_at: sm2Result.next_review_at,
    interval_days: sm2Result.interval_days,
    ease_factor: sm2Result.ease_factor_x100 / 100,
  };
}

/**
 * Verifies that the deck exists and belongs to the user
 */
export async function verifyDeckOwnership(
  supabase: SupabaseClientType,
  deckId: string,
  userId: string
): Promise<boolean> {
  const { data, error } = await supabase.from("decks").select("id").eq("id", deckId).eq("owner_id", userId).single();

  if (error || !data) {
    return false;
  }

  return true;
}
