import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../db/database.types";
import type { DeckDTO, DeckListItemDTO, PaginatedDecksResponseDTO } from "../../types";

export type SupabaseClientType = SupabaseClient<Database>;

/**
 * Error thrown when deck is not found or user doesn't have permission
 */
export class DeckNotFoundError extends Error {
  constructor(deckId: string) {
    super(`Deck with id ${deckId} not found or you don't have permission to access it`);
    this.name = "DeckNotFoundError";
  }
}

/**
 * Lists user's decks with pagination and due cards count
 */
export async function listDecks(
  supabase: SupabaseClientType,
  userId: string,
  limit: number,
  offset: number
): Promise<PaginatedDecksResponseDTO> {
  // Get total count
  const { count, error: countError } = await supabase
    .from("decks")
    .select("*", { count: "exact", head: true })
    .eq("owner_id", userId);

  if (countError) {
    throw countError;
  }

  // Get paginated decks
  const { data: decks, error: decksError } = await supabase
    .from("decks")
    .select("id, name, last_used_at")
    .eq("owner_id", userId)
    .order("last_used_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (decksError) {
    throw decksError;
  }

  // For each deck, count due cards
  const items: DeckListItemDTO[] = await Promise.all(
    (decks || []).map(async (deck) => {
      const { count: dueCount, error: countError } = await supabase
        .from("cards")
        .select("*", { count: "exact", head: true })
        .eq("deck_id", deck.id)
        .eq("status", "accepted")
        .lte("next_review_at", new Date().toISOString());

      if (countError) {
        console.error(`Error counting due cards for deck ${deck.id}:`, countError);
        // If counting fails, default to 0
        return {
          ...deck,
          due_cards_count: 0,
        };
      }

      return {
        ...deck,
        due_cards_count: dueCount || 0,
      };
    })
  );

  return {
    items,
    limit,
    offset,
    total: count || 0,
  };
}

/**
 * Creates a new deck for the user
 */
export async function createDeck(
  supabase: SupabaseClientType,
  userId: string,
  name: string
): Promise<DeckDTO> {
  const trimmedName = name.trim();

  const { data, error } = await supabase
    .from("decks")
    .insert({
      owner_id: userId,
      name: trimmedName,
    })
    .select("id, name, created_at, last_used_at")
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error("Failed to create deck - no data returned");
  }

  return data;
}

/**
 * Updates deck name
 */
export async function updateDeck(
  supabase: SupabaseClientType,
  userId: string,
  deckId: string,
  name: string
): Promise<DeckDTO> {
  const trimmedName = name.trim();

  const { data, error, count } = await supabase
    .from("decks")
    .update({ name: trimmedName })
    .eq("id", deckId)
    .eq("owner_id", userId)
    .select("id, name, created_at, last_used_at")
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new DeckNotFoundError(deckId);
  }

  return data;
}

/**
 * Deletes a deck and all its cards (cascade)
 */
export async function deleteDeck(
  supabase: SupabaseClientType,
  userId: string,
  deckId: string
): Promise<void> {
  // First check if deck exists and user has permission
  const { data: deck, error: selectError } = await supabase
    .from("decks")
    .select("id")
    .eq("id", deckId)
    .eq("owner_id", userId)
    .single();

  if (selectError || !deck) {
    throw new DeckNotFoundError(deckId);
  }

  // Delete the deck (cascade will delete all cards)
  const { error } = await supabase
    .from("decks")
    .delete()
    .eq("id", deckId)
    .eq("owner_id", userId);

  if (error) {
    throw error;
  }
}
