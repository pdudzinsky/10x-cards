import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import path from "path";

// Load .env-test explicitly for cleanup helpers
dotenv.config({ path: path.resolve(process.cwd(), ".env-test") });

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Cleanup all test data from database using service role key
 * This bypasses RLS and is much faster than API calls
 */
export async function cleanupTestData() {
  try {
    // Create Supabase client with service role key (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // Delete all cards first (foreign key constraint)
    const { error: cardsError } = await supabase
      .from("cards")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (cardsError) {
      console.error("Failed to cleanup cards:", cardsError);
    }

    // Delete all decks
    const { error: decksError } = await supabase
      .from("decks")
      .delete()
      .neq("id", "00000000-0000-0000-0000-000000000000");

    if (decksError) {
      console.error("Failed to cleanup decks:", decksError);
    }
  } catch (error) {
    console.error("Failed to cleanup test data:", error);
  }
}

/**
 * Cleanup specific user's data (for isolated tests)
 */
export async function cleanupUserData(userId: string) {
  try {
    const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

    // First, get all deck IDs for the user
    const { data: userDecks } = await supabase.from("decks").select("id").eq("owner_id", userId);

    if (userDecks && userDecks.length > 0) {
      const deckIds = userDecks.map((deck) => deck.id);

      // Delete all cards in those decks
      const { error: cardsError } = await supabase.from("cards").delete().in("deck_id", deckIds);

      if (cardsError) {
        console.error("Failed to cleanup user cards:", cardsError);
      }
    }

    // Delete user's decks
    const { error: decksError } = await supabase.from("decks").delete().eq("owner_id", userId);

    if (decksError) {
      console.error("Failed to cleanup user decks:", decksError);
    }
  } catch (error) {
    console.error("Failed to cleanup user data:", error);
  }
}
