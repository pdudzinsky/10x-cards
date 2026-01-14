import type { APIContext } from "astro";
import { z } from "zod";

import * as deckService from "../../../../lib/services/deck.service";

export const prerender = false;

// Zod schemas for validation
const GetDecksQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(20),
  offset: z.coerce.number().int().min(0).default(0),
});

const CreateDeckBodySchema = z.object({
  name: z.string().trim().min(1, "Name cannot be empty").max(100, "Name must be at most 100 characters"),
});

/**
 * GET /v1/decks
 * Returns paginated list of user's decks with due cards count
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

  try {
    // Parse and validate query params
    const url = new URL(context.request.url);
    const queryParams = {
      limit: url.searchParams.get("limit") ?? undefined,
      offset: url.searchParams.get("offset") ?? undefined,
    };

    const validated = GetDecksQuerySchema.parse(queryParams);

    // Call service
    const result = await deckService.listDecks(
      supabase,
      user.id,
      validated.limit,
      validated.offset
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

    // Database or other errors
    console.error("Error listing decks:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * POST /v1/decks
 * Creates a new deck for the authenticated user
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

  try {
    // Parse and validate body
    const body = await context.request.json();
    const validated = CreateDeckBodySchema.parse(body);

    // Call service
    const result = await deckService.createDeck(supabase, user.id, validated.name);

    return new Response(JSON.stringify(result), {
      status: 201,
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
    console.error("Error creating deck:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
