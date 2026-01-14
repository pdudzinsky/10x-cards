import type { APIContext } from "astro";
import { z } from "zod";

import { verifyDeckOwnership } from "../../../../../lib/services/card.service";
import * as generationService from "../../../../../lib/services/generation.service";

export const prerender = false;

// ============================================================================
// Zod Schemas
// ============================================================================

const UuidSchema = z.string().uuid("Invalid UUID format");

const GenerateCardsBodySchema = z.object({
  source_text: z
    .string()
    .transform((s) => s.trim())
    .pipe(
      z
        .string()
        .min(50, "Source text must be at least 50 characters")
        .max(10000, "Source text must be at most 10000 characters")
    ),
  cards_count: z.union([z.literal(5), z.literal(10), z.literal(20)], {
    errorMap: () => ({ message: "cards_count must be 5, 10, or 20" }),
  }),
});

// ============================================================================
// POST /v1/decks/{deckId}/ai-generate
// ============================================================================

/**
 * POST /v1/decks/{deckId}/ai-generate
 * Generates AI cards based on source text and adds them to the deck.
 * Cards are created with 'unverified' status.
 */
export async function POST(context: APIContext) {
  const { user, supabase } = context.locals;

  // 1. Check authentication
  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  // 2. Validate deckId
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
    // 3. Parse and validate body
    const body = await context.request.json();
    const bodyValidation = GenerateCardsBodySchema.safeParse(body);
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

    // 4. Verify deck ownership
    const isDeckOwner = await verifyDeckOwnership(supabase, deckIdValidation.data, user.id);
    if (!isDeckOwner) {
      return new Response(JSON.stringify({ error: "Deck not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Generate and save cards
    const result = await generationService.generateAndSaveCards(
      supabase,
      user.id,
      deckIdValidation.data,
      bodyValidation.data.source_text,
      bodyValidation.data.cards_count
    );

    return new Response(JSON.stringify(result), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    // JSON parse error
    if (error instanceof SyntaxError) {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Daily limit exceeded
    if (error instanceof generationService.DailyLimitExceededError) {
      return new Response(
        JSON.stringify({
          error: "Daily generation limit exceeded",
          remaining_daily_limit: 0,
        }),
        {
          status: 403,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // AI generation error
    if (error instanceof generationService.AIGenerationError) {
      return new Response(JSON.stringify({ error: "AI generation failed" }), {
        status: 502,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Generic error
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
