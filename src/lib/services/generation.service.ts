import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../db/database.types";
import type { GenerateCardsResponseDTO } from "../../types";
import { createAIGenerationService } from "./ai-generation.service";

export type SupabaseClientType = SupabaseClient<Database>;

const DAILY_GENERATION_LIMIT = 5;

// ============================================================================
// Custom Errors
// ============================================================================

export class DailyLimitExceededError extends Error {
  public remainingLimit = 0;

  constructor() {
    super("Daily generation limit exceeded");
    this.name = "DailyLimitExceededError";
  }
}

export class AIGenerationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AIGenerationError";
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Gets today's date in Europe/Warsaw timezone as ISO date string (YYYY-MM-DD)
 */
function getTodayInWarsaw(): string {
  return new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Warsaw" });
}

/**
 * Checks remaining daily generation limit for a user.
 * Returns remaining limit (0-5).
 */
export async function checkDailyLimit(supabase: SupabaseClientType, userId: string): Promise<number> {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("ai_generation_date, ai_generation_count")
    .eq("id", userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!profile) {
    // No profile means full limit available
    return DAILY_GENERATION_LIMIT;
  }

  const today = getTodayInWarsaw();

  // If date is different or null, full limit available
  if (profile.ai_generation_date !== today) {
    return DAILY_GENERATION_LIMIT;
  }

  // Return remaining limit
  return Math.max(0, DAILY_GENERATION_LIMIT - profile.ai_generation_count);
}

/**
 * Increments generation count for user.
 * Creates profile if it doesn't exist, resets date if it's a new day.
 * Returns the new remaining limit.
 */
async function incrementGenerationCount(supabase: SupabaseClientType, userId: string): Promise<number> {
  const today = getTodayInWarsaw();

  // First, get current profile state
  const { data: profile, error: selectError } = await supabase
    .from("profiles")
    .select("ai_generation_date, ai_generation_count")
    .eq("id", userId)
    .maybeSingle();

  if (selectError) {
    throw selectError;
  }

  let newCount: number;

  if (!profile) {
    // No profile exists - create one with count = 1
    const { error: insertError } = await supabase.from("profiles").insert({
      id: userId,
      ai_generation_date: today,
      ai_generation_count: 1,
    });

    if (insertError) {
      throw insertError;
    }

    return DAILY_GENERATION_LIMIT - 1;
  }

  if (profile.ai_generation_date !== today) {
    // New day - reset to 1
    newCount = 1;
  } else {
    // Same day - increment
    newCount = profile.ai_generation_count + 1;
  }

  // Update profile
  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      ai_generation_date: today,
      ai_generation_count: newCount,
    })
    .eq("id", userId);

  if (updateError) {
    throw updateError;
  }

  return DAILY_GENERATION_LIMIT - newCount;
}

// ============================================================================
// Main Service Function
// ============================================================================

/**
 * Generates AI cards and saves them to the database.
 * Handles daily limit checking and incrementing.
 *
 * @param supabase - Supabase client
 * @param userId - User ID
 * @param deckId - Deck ID to add cards to
 * @param sourceText - Source text for AI generation
 * @param cardsCount - Number of cards to generate (5, 10, or 20)
 * @returns Response with generated count and remaining limit
 * @throws DailyLimitExceededError if limit exceeded
 * @throws AIGenerationError if AI service fails
 */
export async function generateAndSaveCards(
  supabase: SupabaseClientType,
  userId: string,
  deckId: string,
  sourceText: string,
  cardsCount: 5 | 10 | 20
): Promise<GenerateCardsResponseDTO> {
  // Check daily limit first
  const remainingBefore = await checkDailyLimit(supabase, userId);

  if (remainingBefore <= 0) {
    throw new DailyLimitExceededError();
  }

  // Generate cards using AI service
  const aiService = createAIGenerationService();
  let generatedCards;

  try {
    generatedCards = await aiService.generateCards(sourceText, cardsCount);
  } catch (error) {
    throw new AIGenerationError(error instanceof Error ? error.message : "AI generation failed");
  }

  if (!generatedCards || generatedCards.length === 0) {
    throw new AIGenerationError("AI service returned no cards");
  }

  // Prepare cards for bulk insert
  const cardsToInsert = generatedCards.map((card) => ({
    deck_id: deckId,
    owner_id: userId,
    front: card.front.trim(),
    back: card.back.trim(),
    status: "unverified" as const,
    interval_days: 0,
    repetitions: 0,
    ease_factor_x100: 250,
  }));

  // Bulk insert cards
  const { error: insertError } = await supabase.from("cards").insert(cardsToInsert);

  if (insertError) {
    throw insertError;
  }

  // Increment generation count
  const remainingAfter = await incrementGenerationCount(supabase, userId);

  return {
    generated: generatedCards.length,
    remaining_daily_limit: remainingAfter,
  };
}
