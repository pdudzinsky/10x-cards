import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_KEY!;

export async function cleanupTestUser(email: string) {
  try {
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user by email
    const { data: users } = await supabase.from("users").select("id").eq("email", email).single();

    if (users) {
      // Delete user (this should cascade delete decks and cards)
      await supabase.from("users").delete().eq("id", users.id);
    }
  } catch (error) {
    console.error(`Failed to cleanup test user ${email}:`, error);
  }
}
