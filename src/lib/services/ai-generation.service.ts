import type { GeneratedCard } from "../../types";

// ============================================================================
// AI Generation Service Interface
// ============================================================================

/**
 * Interface for AI-based card generation service.
 * Allows swapping between mock and real implementations.
 */
export interface AIGenerationService {
  generateCards(sourceText: string, count: number): Promise<GeneratedCard[]>;
}

// ============================================================================
// Mock Implementation
// ============================================================================

/**
 * Mock AI generation service that creates random flashcards.
 * Used for development and testing before real OpenRouter integration.
 */
export class MockAIGenerationService implements AIGenerationService {
  private readonly sampleQuestions = [
    "Co to jest",
    "Jak działa",
    "Czym charakteryzuje się",
    "Jakie są cechy",
    "Gdzie występuje",
    "Kiedy stosuje się",
    "Dlaczego ważne jest",
    "Jaki jest cel",
    "Co oznacza",
    "Jak definiuje się",
  ];

  async generateCards(sourceText: string, count: number): Promise<GeneratedCard[]> {
    // Extract words from source text for generating mock content
    const words = sourceText
      .split(/\s+/)
      .filter((word) => word.length > 4)
      .slice(0, 50);

    const cards: GeneratedCard[] = [];

    for (let i = 0; i < count; i++) {
      const questionType = this.sampleQuestions[i % this.sampleQuestions.length];
      const keyWord = words[i % words.length] || `pojęcie ${i + 1}`;

      // Generate mock front (question) - max 200 chars
      const front = this.truncate(`${questionType} ${keyWord}?`, 200);

      // Generate mock back (answer) - max 500 chars
      const back = this.truncate(
        `${keyWord} to ważne pojęcie związane z tematem. ` +
          `Odnosi się do treści źródłowej i wymaga dalszej weryfikacji przez użytkownika. ` +
          `Fragment źródła: "${this.extractFragment(sourceText, i)}"`,
        500
      );

      cards.push({ front, back });
    }

    return cards;
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength - 3) + "...";
  }

  private extractFragment(text: string, index: number): string {
    const fragmentLength = 50;
    const startPos = (index * 100) % Math.max(1, text.length - fragmentLength);
    return text.slice(startPos, startPos + fragmentLength).trim();
  }
}

// ============================================================================
// Factory Function
// ============================================================================

/**
 * Creates an AI generation service instance.
 * Currently returns mock implementation.
 * TODO: Return OpenRouterAIGenerationService when API key is available.
 */
export function createAIGenerationService(): AIGenerationService {
  // TODO: Check for OPENROUTER_API_KEY and return real implementation
  // const apiKey = import.meta.env.OPENROUTER_API_KEY;
  // if (apiKey) {
  //   return new OpenRouterAIGenerationService(apiKey);
  // }
  return new MockAIGenerationService();
}
