import { defineMiddleware } from "astro:middleware";
import { createClient } from "@supabase/supabase-js";

import type { Database } from "../db/database.types";

const supabaseUrl = import.meta.env.SUPABASE_URL;
const supabaseAnonKey = import.meta.env.SUPABASE_KEY;

export const onRequest = defineMiddleware(async (context, next) => {
  // Extract Bearer token from Authorization header
  const authHeader = context.request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (token) {
    // Create Supabase client with user's access token
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    // Verify token and get user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    context.locals.supabase = supabase;
    context.locals.user = user ? { id: user.id } : null;
  } else {
    // No token - create anonymous client
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    context.locals.supabase = supabase;
    context.locals.user = null;
  }

  return next();
});
