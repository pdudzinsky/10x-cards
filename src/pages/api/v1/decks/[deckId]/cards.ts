import type { APIContext } from "astro";
import { z } from "zod";

import * as cardService from "../../../../../lib/services/card.service";

export const prerender = false;

// ============================================================================
// Zod Schemas
// ============================================================================

const UuidSchema = z.string().uuid("Invalid UUID format");

const StatusFilterSchema = z.enum(["all", "unverified", "accepted"]).default("all");

const CreateCardBodySchema = z.object({
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
// GET /v1/decks/{deckId}/cards
// ============================================================================

/**
 * GET /v1/decks/{deckId}/cards
 * Returns list of cards in a deck with optional status filtering
 * Query params: status (all | unverified | accepted)
 */
export async function GET(context: APIContext) {
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

  // Validate status query param
  const url = new URL(context.request.url);
  const statusParam = url.searchParams.get("status") ?? "all";
  const statusValidation = StatusFilterSchema.safeParse(statusParam);
  if (!statusValidation.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid status filter",
        details: statusValidation.error.errors,
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

    // List cards
    const result = await cardService.listCards(supabase, deckIdValidation.data, statusValidation.data);

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

// ============================================================================
// POST /v1/decks/{deckId}/cards
// ============================================================================

/**
 * POST /v1/decks/{deckId}/cards
 * Creates a new card in the deck (manual creation - immediately accepted)
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
    // Parse and validate body
    const body = await context.request.json();
    const bodyValidation = CreateCardBodySchema.safeParse(body);
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

    // Verify deck ownership
    const isDeckOwner = await cardService.verifyDeckOwnership(supabase, deckIdValidation.data, user.id);
    if (!isDeckOwner) {
      return new Response(JSON.stringify({ error: "Deck not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Create card
    const result = await cardService.createCard(
      supabase,
      user.id,
      deckIdValidation.data,
      bodyValidation.data.front,
      bodyValidation.data.back
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
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
