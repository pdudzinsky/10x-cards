import type { APIRoute } from "astro";

import { refreshSession } from "@/lib/services/auth.service";
import { AuthError } from "@/lib/errors/auth.errors";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();
    const { refresh_token } = body;

    if (!refresh_token) {
      return new Response(
        JSON.stringify({
          message: "Refresh token jest wymagany",
          code: "MISSING_REFRESH_TOKEN",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Call auth service to refresh session
    const { session } = await refreshSession(locals.supabase, refresh_token);

    // Return new tokens
    return new Response(
      JSON.stringify({
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
    // Handle custom auth errors
    if (error instanceof AuthError) {
      return new Response(
        JSON.stringify({
          message: error.message,
          code: error.code,
        }),
        {
          status: error.statusCode,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Handle unknown errors
    console.error("Refresh token error:", error);
    return new Response(
      JSON.stringify({
        message: "Wystąpił błąd. Spróbuj ponownie.",
        code: "UNKNOWN_ERROR",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
