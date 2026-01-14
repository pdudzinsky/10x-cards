import type { APIContext } from "astro";
import { z } from "zod";

import * as cardService from "../../../../../../lib/services/card.service";

export const prerender = false;

const UuidSchema = z.string().uuid("Invalid UUID format");

/**
 * DELETE /v1/decks/{deckId}/cards/unverified
 * Deletes all unverified cards in a deck
 */
export async function DELETE(context: APIContext) {
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
    const isDeckOwner = await cardService.verifyDeckOwnership(supabase, deckIdValidation.data, user.id);
    if (!isDeckOwner) {
      return new Response(JSON.stringify({ error: "Deck not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Delete all unverified cards
    const result = await cardService.deleteAllUnverifiedCards(supabase, deckIdValidation.data);

    return new Response(JSON.stringify(result), {
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
