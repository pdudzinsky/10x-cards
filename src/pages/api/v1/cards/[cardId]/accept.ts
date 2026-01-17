import type { APIContext } from "astro";
import { z } from "zod";

import * as cardService from "../../../../../lib/services/card.service";

export const prerender = false;

// ============================================================================
// Zod Schemas
// ============================================================================

const UuidSchema = z.string().uuid("Invalid UUID format");

// ============================================================================
// POST /v1/cards/{cardId}/accept
// ============================================================================

/**
 * POST /v1/cards/{cardId}/accept
 * Accepts a single unverified card and initializes SM-2 scheduling
 * Idempotent: if card is already accepted, returns 200 with current state
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

  // Validate cardId
  const { cardId } = context.params;
  const cardIdValidation = UuidSchema.safeParse(cardId);
  if (!cardIdValidation.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid card ID",
        details: cardIdValidation.error.errors,
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  try {
    // Accept card
    const result = await cardService.acceptCard(supabase, user.id, cardIdValidation.data);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Card not found
    if (error instanceof cardService.CardNotFoundError) {
      return new Response(JSON.stringify({ error: "Card not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
