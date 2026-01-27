import type { APIRoute } from "astro";
import { ZodError } from "zod";

import { resetPasswordSchema } from "@/lib/schemas/auth.schemas";
import { resetPassword } from "@/lib/services/auth.service";
import { AuthError, InvalidTokenError } from "@/lib/errors/auth.errors";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Check if user is authenticated (token from Authorization header)
    if (!locals.user) {
      throw new InvalidTokenError();
    }

    // Parse request body
    const body = await request.json();

    // Validate input with Zod
    const validatedData = resetPasswordSchema.parse(body);

    // Call auth service with authenticated supabase client
    await resetPassword(locals.supabase, validatedData.password);

    return new Response(
      JSON.stringify({
        message: "Hasło zostało pomyślnie zmienione.",
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
    console.error("Reset password error:", error);
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
