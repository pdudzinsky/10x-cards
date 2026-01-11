import type { APIContext } from "astro";
import { z } from "zod";

import * as deckService from "../../../../lib/services/deck.service";
import { DeckNotFoundError } from "../../../../lib/services/deck.service";

export const prerender = false;

// Zod schemas for validation
const DeckIdSchema = z.string().uuid("Invalid deck ID format");

const UpdateDeckBodySchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").max(100, "Name must be at most 100 characters"),
});

/**
 * PATCH /v1/decks/{deckId}
 * Updates deck name
 */
export async function PATCH(context: APIContext) {
  const { user, supabase } = context.locals;

  // Check authentication
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Validate deckId from params
    const deckId = context.params.deckId;
    const validatedDeckId = DeckIdSchema.parse(deckId);

    // Parse and validate body
    const body = await context.request.json();
    const validated = UpdateDeckBodySchema.parse(body);

    // Call service
    const result = await deckService.updateDeck(
      supabase,
      user.id,
      validatedDeckId,
      validated.name
    );

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Validation error
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Deck not found
    if (error instanceof DeckNotFoundError) {
      return new Response(JSON.stringify({ error: "Deck not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // JSON parse error
    if (error instanceof SyntaxError) {
      return new Response(
        JSON.stringify({
          error: "Invalid JSON",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Database or other errors
    console.error("Error updating deck:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * DELETE /v1/decks/{deckId}
 * Deletes deck and all its cards (cascade)
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

  try {
    // Validate deckId from params
    const deckId = context.params.deckId;
    const validatedDeckId = DeckIdSchema.parse(deckId);

    // Call service
    await deckService.deleteDeck(supabase, user.id, validatedDeckId);

    return new Response(null, {
      status: 204,
    });
  } catch (error) {
    // Validation error
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: "Invalid input",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Deck not found
    if (error instanceof DeckNotFoundError) {
      return new Response(JSON.stringify({ error: "Deck not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Database or other errors
    console.error("Error deleting deck:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
