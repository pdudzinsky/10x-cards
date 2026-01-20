import type { APIContext } from "astro";

import * as profileService from "../../../lib/services/profile.service";
import * as generationService from "../../../lib/services/generation.service";

export const prerender = false;

/**
 * GET /v1/profile
 * Returns the authenticated user's profile with AI generation limits
 */
export async function GET(context: APIContext) {
  const { user, supabase } = context.locals;

  if (!user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const profile = await profileService.getProfile(supabase, user.id);

    if (!profile) {
      return new Response(JSON.stringify({ error: "Profile not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Calculate remaining daily limit
    const dailyLimit = await generationService.checkDailyLimit(supabase, user.id);

    // Return profile with computed daily_ai_generations_remaining field
    const profileWithLimit = {
      ...profile,
      daily_ai_generations_remaining: dailyLimit,
    };

    return new Response(JSON.stringify(profileWithLimit), {
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
