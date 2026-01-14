import type { APIContext } from "astro";
import { z } from "zod";

import * as reviewService from "../../../../../../lib/services/review.service";

export const prerender = false;

// ============================================================================
// Zod Schemas
// ============================================================================

const UuidSchema = z.string().uuid("Invalid UUID format");

// ============================================================================
// POST /v1/decks/{deckId}/reviews/start
// ============================================================================

/**
 * POST /v1/decks/{deckId}/reviews/start
 * Starts a review session for a deck
 * Returns cards that are due for review (status = 'accepted' and next_review_at <= now())
 * Updates deck's last_used_at timestamp
 */
export async function POST(context: APIContext) {
  const { user, supabase } = context.locals;

  // Check authentication
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Validate deckId
  const { deckId } = context.params;
  const deckIdValidation = UuidSchema.safeParse(deckId);
  if (!deckIdValidation.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid deck ID",
        details: deckIdValidation.error.errors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Verify deck ownership
    const deckExists = await reviewService.verifyDeckOwnership(supabase, deckIdValidation.data, user.id);
    if (!deckExists) {
      return new Response(JSON.stringify({ error: "Deck not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get cards for review
    const session = await reviewService.getCardsForReview(supabase, deckIdValidation.data, user.id);

    // Update deck's last_used_at
    await reviewService.updateDeckLastUsedAt(supabase, deckIdValidation.data, user.id);

    return new Response(JSON.stringify(session), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
