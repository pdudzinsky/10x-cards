import type { APIRoute } from "astro";
import { ZodError } from "zod";

import { loginSchema } from "@/lib/schemas/auth.schemas";
import { login } from "@/lib/services/auth.service";
import { AuthError } from "@/lib/errors/auth.errors";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input with Zod
    const validatedData = loginSchema.parse(body);

    // Call auth service
    const { user, session } = await login(locals.supabase, validatedData.email, validatedData.password);

    // Return tokens and user data
    return new Response(
      JSON.stringify({
        user: {
          id: user.id,
          email: user.email,
        },
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
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const firstError = error.errors[0];
      return new Response(
        JSON.stringify({
          message: firstError.message,
          code: "VALIDATION_ERROR",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

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
    console.error("Login error:", error);
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
