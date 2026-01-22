// ============================================================================
// OpenRouter Service Configuration
// ============================================================================

/**
 * Default configuration values for OpenRouter service
 */
export const OPENROUTER_DEFAULTS = {
  BASE_URL: "https://openrouter.ai/api/v1",
  MODEL: "openai/gpt-4o-mini",
  TEMPERATURE: 0.7,
  MAX_TOKENS: 2048,
  REQUEST_TIMEOUT_MS: 60000,
  MIN_SOURCE_TEXT_LENGTH: 100,
  MAX_SOURCE_TEXT_LENGTH: 15000,
  ALLOWED_CARD_COUNTS: [5, 10, 20] as const,
} as const;

/**
 * System prompt for flashcard generation
 */
export const SYSTEM_PROMPT = `Jesteś ekspertem w tworzeniu fiszek edukacyjnych. Twoim zadaniem jest analiza podanego tekstu i wygenerowanie wysokiej jakości fiszek do nauki metodą spaced repetition.

Zasady tworzenia fiszek:
1. Każda fiszka musi zawierać jedno konkretne pytanie (front) i zwięzłą odpowiedź (back)
2. Pytania powinny być jasne, precyzyjne i testować zrozumienie materiału
3. Odpowiedzi powinny być zwięzłe, ale kompletne
4. Unikaj pytań zbyt ogólnych lub zbyt szczegółowych
5. Fiszki powinny być niezależne od siebie (można je powtarzać w dowolnej kolejności)
6. Używaj języka polskiego
7. Front nie może przekraczać 200 znaków
8. Back nie może przekraczać 500 znaków`;

/**
 * JSON Schema for flashcards response
 */
export const FLASHCARDS_JSON_SCHEMA = {
  type: "object",
  properties: {
    cards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          front: {
            type: "string",
            description: "Pytanie na fiszce (max 200 znaków)",
          },
          back: {
            type: "string",
            description: "Odpowiedź na fiszce (max 500 znaków)",
          },
        },
        required: ["front", "back"],
        additionalProperties: false,
      },
    },
  },
  required: ["cards"],
  additionalProperties: false,
} as const;
