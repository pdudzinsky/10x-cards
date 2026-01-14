import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "../../db/database.types";
import type { ProfileDTO } from "../../types";

export type SupabaseClientType = SupabaseClient<Database>;

/**
 * Retrieves user profile by ID
 * Returns null if profile does not exist
 */
export async function getProfile(supabase: SupabaseClientType, userId: string): Promise<ProfileDTO | null> {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();

  if (error) {
    // PGRST116 = No rows returned
    if (error.code === "PGRST116") {
      return null;
    }
    throw error;
  }

  return data;
}
