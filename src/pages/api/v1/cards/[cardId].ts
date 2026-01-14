import type { APIContext } from "astro";
import { z } from "zod";

import * as cardService from "../../../../lib/services/card.service";

export const prerender = false;

// ============================================================================
// Zod Schemas
// ============================================================================

const UuidSchema = z.string().uuid("Invalid UUID format");

const UpdateCardBodySchema = z.object({
  front: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, "Front cannot be empty").max(200, "Front must be at most 200 characters")),
  back: z
    .string()
    .transform((s) => s.trim())
    .pipe(z.string().min(1, "Back cannot be empty").max(500, "Back must be at most 500 characters")),
});

// ============================================================================
// PATCH /v1/cards/{cardId}
// ============================================================================

/**
 * PATCH /v1/cards/{cardId}
 * Updates a card's front and back content
 * Always sets status to 'accepted' and resets SM-2 parameters
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
    // Parse and validate body
    const body = await context.request.json();
    const bodyValidation = UpdateCardBodySchema.safeParse(body);
    if (!bodyValidation.success) {
      return new Response(
        JSON.stringify({
          error: "Validation error",
          details: bodyValidation.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Update card
    const result = await cardService.updateCard(
      supabase,
      user.id,
      cardIdValidation.data,
      bodyValidation.data.front,
      bodyValidation.data.back
    );

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

    // JSON parse error
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    console.error("Error updating card:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// ============================================================================
// DELETE /v1/cards/{cardId}
// ============================================================================

/**
 * DELETE /v1/cards/{cardId}
 * Permanently deletes a card
 * Only accepted cards can be deleted - unverified cards return 409 Conflict
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
    // Delete card
    await cardService.deleteCard(supabase, user.id, cardIdValidation.data);

    return new Response(null, { status: 204 });
  } catch (error) {
    // Card not found
    if (error instanceof cardService.CardNotFoundError) {
      return new Response(JSON.stringify({ error: "Card not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Card not deletable (unverified)
    if (error instanceof cardService.CardNotDeletableError) {
      return new Response(
        JSON.stringify({
          error: "Card not deletable - unverified cards cannot be deleted",
        }),
        {
          status: 409,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    console.error("Error deleting card:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
