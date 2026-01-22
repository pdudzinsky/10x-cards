// ============================================================================
// OpenRouter Service Types
// ============================================================================

/**
 * OpenRouter service configuration
 */
export interface OpenRouterConfig {
  /** OpenRouter API key (required) */
  apiKey: string;
  /** API base URL (optional, default: https://openrouter.ai/api/v1) */
  baseUrl?: string;
  /** Model name (optional, default: openai/gpt-4o-mini) */
  model?: string;
  /** Generation temperature (optional, default: 0.7) */
  temperature?: number;
  /** Max tokens in response (optional, default: 2048) */
  maxTokens?: number;
  /** App name for X-Title header (optional) */
  appName?: string;
  /** App URL for HTTP-Referer header (optional) */
  appUrl?: string;
}

/**
 * Chat message structure
 */
export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * JSON Schema response format for structured outputs
 */
export interface ResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    strict: boolean;
    schema: Record<string, unknown>;
  };
}

/**
 * Chat completion request body
 */
export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  response_format?: ResponseFormat;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

/**
 * Chat completion API response
 */
export interface ChatCompletionResponse {
  id: string;
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  model: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Parsed flashcards response from model
 */
export interface FlashcardsResponse {
  cards: Array<{
    front: string;
    back: string;
  }>;
}
