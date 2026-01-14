import type { APIContext } from "astro";
import { z } from "zod";

import * as reviewService from "../../../../../lib/services/review.service";

export const prerender = false;

// ============================================================================
// Zod Schemas
// ============================================================================

const UuidSchema = z.string().uuid("Invalid UUID format");

const ReviewAnswerBodySchema = z.object({
  grade: z.union([z.literal(0), z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)], {
    errorMap: () => ({ message: "Invalid grade (must be 0-5)" }),
  }),
});

// ============================================================================
// POST /v1/reviews/{cardId}/answer
// ============================================================================

/**
 * POST /v1/reviews/{cardId}/answer
 * Records user's answer for a card and calculates new SM-2 parameters
 * Grade scale: 0 (complete blackout) to 5 (perfect response)
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
    // Parse and validate body
    const body = await context.request.json();
    const bodyValidation = ReviewAnswerBodySchema.safeParse(body);
    if (!bodyValidation.success) {
      return new Response(
        JSON.stringify({
          error: bodyValidation.error.errors[0]?.message || "Invalid grade (must be 0-5)",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const { grade } = bodyValidation.data;

    // Get card with SM-2 parameters
    const cardParams = await reviewService.getCardWithSM2Params(supabase, cardIdValidation.data, user.id);

    // Check if card is available for review
    if (cardParams.status !== "accepted") {
      return new Response(JSON.stringify({ error: "Card is not available for review" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Calculate new SM-2 parameters
    const sm2Result = reviewService.calculateSM2(grade, {
      interval_days: cardParams.interval_days,
      repetitions: cardParams.repetitions,
      ease_factor_x100: cardParams.ease_factor_x100,
    });

    // Update card with new parameters
    const result = await reviewService.updateCardSM2(supabase, cardIdValidation.data, user.id, sm2Result);

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // Card not found
    if (error instanceof reviewService.CardNotFoundError) {
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

    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
