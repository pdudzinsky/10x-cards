import type { APIRoute } from "astro";
import { ZodError } from "zod";

import { forgotPasswordSchema } from "@/lib/schemas/auth.schemas";
import { sendPasswordResetEmail } from "@/lib/services/auth.service";
import { AuthError } from "@/lib/errors/auth.errors";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals, url }) => {
  try {
    // Parse request body
    const body = await request.json();

    // Validate input with Zod
    const validatedData = forgotPasswordSchema.parse(body);

    // Construct redirect URL for password reset
    const origin = url.origin;
    const redirectTo = `${origin}/reset-password`;

    // Call auth service
    await sendPasswordResetEmail(locals.supabase, validatedData.email, redirectTo);

    // Always return 200 for security (don't reveal if email exists)
    return new Response(
      JSON.stringify({
        message: "Jeśli konto z tym adresem email istnieje, wysłaliśmy link do resetowania hasła.",
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
    console.error("Forgot password error:", error);
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
