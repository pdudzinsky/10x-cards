import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../db/database.types";
import type { CardDTO, CardListItemDTO, CardListResponseDTO } from "../../types";

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
 * Error thrown when trying to delete an unverified card
 */
export class CardNotDeletableError extends Error {
  constructor(cardId: string) {
    super(`Card with id ${cardId} is unverified and cannot be deleted`);
    this.name = "CardNotDeletableError";
  }
}

/**
 * Error thrown when trying to accept an already accepted card
 */
export class CardAlreadyAcceptedError extends Error {
  constructor(cardId: string) {
    super(`Card with id ${cardId} is already accepted`);
    this.name = "CardAlreadyAcceptedError";
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
// Helper Functions
// ============================================================================

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

// ============================================================================
// Card Service Functions
// ============================================================================

export type StatusFilter = "all" | "unverified" | "accepted";

/**
 * Lists cards in a deck with optional status filtering
 * Sorting: unverified first, then accepted sorted by next_review_at ASC
 */
export async function listCards(
  supabase: SupabaseClientType,
  deckId: string,
  statusFilter: StatusFilter
): Promise<CardListResponseDTO> {
  let query = supabase.from("cards").select("id, front, back, status, next_review_at").eq("deck_id", deckId);

  // Apply status filter if not "all"
  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter);
  }

  // Order: unverified first (status DESC since 'unverified' > 'accepted' alphabetically),
  // then by next_review_at ASC for review order
  const { data, error } = await query
    .order("status", { ascending: false })
    .order("next_review_at", { ascending: true });

  if (error) {
    throw error;
  }

  const items: CardListItemDTO[] = (data || []).map((card) => ({
    id: card.id,
    front: card.front,
    back: card.back,
    status: card.status,
    next_review_at: card.next_review_at,
  }));

  return { items };
}

/**
 * Creates a new card in a deck
 * Manual cards are immediately accepted with next_review_at = now()
 */
export async function createCard(
  supabase: SupabaseClientType,
  userId: string,
  deckId: string,
  front: string,
  back: string
): Promise<{ id: string; status: string; next_review_at: string }> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("cards")
    .insert({
      deck_id: deckId,
      owner_id: userId,
      front: front.trim(),
      back: back.trim(),
      status: "accepted",
      next_review_at: now,
      interval_days: 0,
      repetitions: 0,
      ease_factor_x100: 250,
    })
    .select("id, status, next_review_at")
    .single();

  if (error) {
    throw error;
  }

  if (!data || !data.next_review_at) {
    throw new Error("Failed to create card - no data returned");
  }

  return {
    id: data.id,
    status: data.status,
    next_review_at: data.next_review_at,
  };
}

/**
 * Updates a card's front and back content
 * Always sets status to 'accepted', resets SM-2 params, and updates next_review_at to now()
 */
export async function updateCard(
  supabase: SupabaseClientType,
  userId: string,
  cardId: string,
  front: string,
  back: string
): Promise<CardDTO> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("cards")
    .update({
      front: front.trim(),
      back: back.trim(),
      status: "accepted",
      next_review_at: now,
      updated_at: now,
      interval_days: 0,
      repetitions: 0,
      ease_factor_x100: 250,
    })
    .eq("id", cardId)
    .eq("owner_id", userId)
    .select(
      "id, front, back, status, next_review_at, created_at, updated_at, interval_days, repetitions, ease_factor_x100, last_reviewed_at"
    )
    .single();

  if (error) {
    // PGRST116 means no rows returned (not found or no permission)
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
 * Deletes a card
 * Only accepted cards can be deleted - unverified cards return 409 Conflict
 */
export async function deleteCard(supabase: SupabaseClientType, userId: string, cardId: string): Promise<void> {
  // First, check if card exists and get its status
  const { data: card, error: selectError } = await supabase
    .from("cards")
    .select("status")
    .eq("id", cardId)
    .eq("owner_id", userId)
    .single();

  if (selectError || !card) {
    throw new CardNotFoundError(cardId);
  }

  // Check if card is deletable (only accepted cards can be deleted)
  if (card.status === "unverified") {
    throw new CardNotDeletableError(cardId);
  }

  // Delete the card
  const { error: deleteError } = await supabase
    .from("cards")
    .delete()
    .eq("id", cardId)
    .eq("owner_id", userId)
    .eq("status", "accepted");

  if (deleteError) {
    throw deleteError;
  }
}

/**
 * Accepts a single unverified card
 * Sets status to 'accepted', next_review_at to now(), updated_at to now()
 * Idempotent: if card is already accepted, returns current state without error
 */
export async function acceptCard(
  supabase: SupabaseClientType,
  userId: string,
  cardId: string
): Promise<{ id: string; status: string; next_review_at: string }> {
  // First, check if card exists and get its current state
  const { data: card, error: selectError } = await supabase
    .from("cards")
    .select("id, status, next_review_at")
    .eq("id", cardId)
    .eq("owner_id", userId)
    .single();

  if (selectError || !card) {
    throw new CardNotFoundError(cardId);
  }

  // If already accepted, return current state (idempotent)
  if (card.status === "accepted") {
    return {
      id: card.id,
      status: card.status,
      next_review_at: card.next_review_at!,
    };
  }

  const now = new Date().toISOString();

  // Update card to accepted status
  const { data, error } = await supabase
    .from("cards")
    .update({
      status: "accepted",
      next_review_at: now,
      updated_at: now,
    })
    .eq("id", cardId)
    .eq("owner_id", userId)
    .eq("status", "unverified")
    .select("id, status, next_review_at")
    .single();

  if (error) {
    throw error;
  }

  if (!data || !data.next_review_at) {
    throw new Error("Failed to accept card - no data returned");
  }

  return {
    id: data.id,
    status: data.status,
    next_review_at: data.next_review_at,
  };
}

/**
 * Accepts all unverified cards in a deck
 * Sets status to 'accepted', next_review_at to now(), updated_at to now()
 */
export async function acceptAllUnverifiedCards(
  supabase: SupabaseClientType,
  deckId: string
): Promise<{ accepted: number }> {
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from("cards")
    .update({
      status: "accepted",
      next_review_at: now,
      updated_at: now,
    })
    .eq("deck_id", deckId)
    .eq("status", "unverified")
    .select("id");

  if (error) {
    throw error;
  }

  return { accepted: data?.length ?? 0 };
}

/**
 * Deletes all unverified cards in a deck
 */
export async function deleteAllUnverifiedCards(
  supabase: SupabaseClientType,
  deckId: string
): Promise<{ deleted: number }> {
  // First count cards to delete (DELETE doesn't return count in Supabase)
  const { data: toDelete, error: countError } = await supabase
    .from("cards")
    .select("id")
    .eq("deck_id", deckId)
    .eq("status", "unverified");

  if (countError) {
    throw countError;
  }

  const count = toDelete?.length ?? 0;

  if (count === 0) {
    return { deleted: 0 };
  }

  const { error: deleteError } = await supabase.from("cards").delete().eq("deck_id", deckId).eq("status", "unverified");

  if (deleteError) {
    throw deleteError;
  }

  return { deleted: count };
}
