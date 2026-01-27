import type { APIRoute } from "astro";
import { logout } from "@/lib/services/auth.service";

export const prerender = false;

export const POST: APIRoute = async ({ locals, cookies }) => {
  try {
    const supabase = locals.supabase;

    if (!supabase) {
      return new Response(JSON.stringify({ error: "Supabase client not initialized" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    await logout(supabase);

    // Usuń ciasteczka z tokenami
    cookies.delete("sb-access-token", { path: "/" });
    cookies.delete("sb-refresh-token", { path: "/" });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Logout error:", error);

    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Wystąpił błąd podczas wylogowania",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
