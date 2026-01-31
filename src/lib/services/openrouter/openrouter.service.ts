import type { GeneratedCard } from "../../../types";
import type { AIGenerationService } from "../ai-generation.service";
import type {
  OpenRouterConfig,
  ChatCompletionRequest,
  ChatCompletionResponse,
  ResponseFormat,
  FlashcardsResponse,
} from "./openrouter.types";
import {
  OpenRouterConfigError,
  OpenRouterValidationError,
  OpenRouterAuthError,
  OpenRouterInsufficientCreditsError,
  OpenRouterModerationError,
  OpenRouterRateLimitError,
  OpenRouterModelError,
  OpenRouterNetworkError,
  OpenRouterParseError,
  OpenRouterApiError,
} from "./openrouter.errors";
import { OPENROUTER_DEFAULTS, SYSTEM_PROMPT, FLASHCARDS_JSON_SCHEMA } from "./openrouter.config";

// ============================================================================
// OpenRouter Service Implementation
// ============================================================================

/**
 * OpenRouter AI service for generating flashcards.
 * Implements AIGenerationService interface for seamless integration.
 */
export class OpenRouterService implements AIGenerationService {
  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly model: string;
  private readonly temperature: number;
  private readonly maxTokens: number;
  private readonly appName: string;
  private readonly appUrl: string;

  constructor(config: OpenRouterConfig) {
    if (!config.apiKey) {
      throw new OpenRouterConfigError("API key is required");
    }

    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? OPENROUTER_DEFAULTS.BASE_URL;
    this.model = config.model ?? OPENROUTER_DEFAULTS.MODEL;
    this.temperature = config.temperature ?? OPENROUTER_DEFAULTS.TEMPERATURE;
    this.maxTokens = config.maxTokens ?? OPENROUTER_DEFAULTS.MAX_TOKENS;
    this.appName = config.appName ?? "10x-cards";
    this.appUrl = config.appUrl ?? "";
  }

  // ============================================================================
  // Public Interface
  // ============================================================================

  /**
   * Generate flashcards from source text using OpenRouter API
   */
  async generateCards(sourceText: string, count: number): Promise<GeneratedCard[]> {
    this.validateInput(sourceText, count);

    const sanitizedText = this.sanitizeInput(sourceText);
    const requestBody = this.buildRequestBody(sanitizedText, count);

    const response = await this.sendRequest(requestBody);

    if (!response.ok) {
      await this.handleErrorResponse(response);
    }

    const data: ChatCompletionResponse = await response.json();
    return this.parseResponse(data);
  }

  // ============================================================================
  // Private Methods - Input Processing
  // ============================================================================

  /**
   * Validate input parameters before sending request
   */
  private validateInput(sourceText: string, count: number): void {
    if (!sourceText || sourceText.trim().length < OPENROUTER_DEFAULTS.MIN_SOURCE_TEXT_LENGTH) {
      throw new OpenRouterValidationError(
        `Source text must be at least ${OPENROUTER_DEFAULTS.MIN_SOURCE_TEXT_LENGTH} characters`
      );
    }

    if (sourceText.length > OPENROUTER_DEFAULTS.MAX_SOURCE_TEXT_LENGTH) {
      throw new OpenRouterValidationError(
        `Source text must not exceed ${OPENROUTER_DEFAULTS.MAX_SOURCE_TEXT_LENGTH} characters`
      );
    }

    if (!OPENROUTER_DEFAULTS.ALLOWED_CARD_COUNTS.includes(count as 5 | 10 | 20)) {
      throw new OpenRouterValidationError(`Card count must be ${OPENROUTER_DEFAULTS.ALLOWED_CARD_COUNTS.join(", ")}`);
    }
  }

  /**
   * Sanitize input text by removing control characters
   */
  private sanitizeInput(text: string): string {
    // Remove control characters except newline and tab
    // eslint-disable-next-line no-control-regex
    return text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");
  }

  // ============================================================================
  // Private Methods - Request Building
  // ============================================================================

  /**
   * Build system message defining model behavior
   */
  private buildSystemMessage(): string {
    return SYSTEM_PROMPT;
  }

  /**
   * Build user message with source text and instructions
   */
  private buildUserMessage(sourceText: string, count: number): string {
    return `Przeanalizuj poniższy tekst i wygeneruj dokładnie ${count} fiszek edukacyjnych.

TEKST ŹRÓDŁOWY:
${sourceText}

Wygeneruj ${count} fiszek w formacie JSON zgodnym ze schematem.`;
  }

  /**
   * Build JSON Schema response format for structured outputs
   */
  private buildResponseFormat(): ResponseFormat {
    return {
      type: "json_schema",
      json_schema: {
        name: "flashcards_response",
        strict: true,
        schema: FLASHCARDS_JSON_SCHEMA,
      },
    };
  }

  /**
   * Build complete request body
   */
  private buildRequestBody(sourceText: string, count: number): ChatCompletionRequest {
    return {
      model: this.model,
      messages: [
        {
          role: "system",
          content: this.buildSystemMessage(),
        },
        {
          role: "user",
          content: this.buildUserMessage(sourceText, count),
        },
      ],
      response_format: this.buildResponseFormat(),
      temperature: this.temperature,
      max_tokens: this.maxTokens,
    };
  }

  /**
   * Build HTTP headers for request
   */
  private buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    };

    if (this.appUrl) {
      headers["HTTP-Referer"] = this.appUrl;
    }

    if (this.appName) {
      headers["X-Title"] = this.appName;
    }

    return headers;
  }

  // ============================================================================
  // Private Methods - HTTP Communication
  // ============================================================================

  /**
   * Send HTTP request to OpenRouter API
   */
  private async sendRequest(body: ChatCompletionRequest): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), OPENROUTER_DEFAULTS.REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: this.buildHeaders(),
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      return response;
    } catch (error) {
      if (error instanceof Error && error.name === "AbortError") {
        throw new OpenRouterNetworkError(
          `Request timeout after ${OPENROUTER_DEFAULTS.REQUEST_TIMEOUT_MS / 1000} seconds`
        );
      }
      throw new OpenRouterNetworkError(error instanceof Error ? error.message : "Network error");
    } finally {
      clearTimeout(timeoutId);
    }
  }

  // ============================================================================
  // Private Methods - Error Handling
  // ============================================================================

  /**
   * Handle error responses from API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: { error?: { message?: string; code?: number; metadata?: unknown } } = {};

    try {
      errorData = await response.json();
    } catch {
      // Ignore JSON parsing errors
    }

    const message = errorData.error?.message || `HTTP ${response.status}`;
    const metadata = errorData.error?.metadata;

    switch (response.status) {
      case 400:
        throw new OpenRouterValidationError(message);
      case 401:
        throw new OpenRouterAuthError(message);
      case 402:
        throw new OpenRouterInsufficientCreditsError(message);
      case 403:
        throw new OpenRouterModerationError(message, metadata);
      case 408:
        throw new OpenRouterNetworkError("Request timeout");
      case 429:
        throw new OpenRouterRateLimitError(message);
      case 502:
      case 503:
        throw new OpenRouterModelError(message);
      default:
        throw new OpenRouterApiError(message, response.status);
    }
  }

  // ============================================================================
  // Private Methods - Response Processing
  // ============================================================================

  /**
   * Parse and validate API response
   */
  private parseResponse(data: ChatCompletionResponse): GeneratedCard[] {
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      throw new OpenRouterParseError("Empty response from model");
    }

    let parsed: FlashcardsResponse;

    try {
      parsed = JSON.parse(content);
    } catch {
      throw new OpenRouterParseError("Invalid JSON in response");
    }

    if (!Array.isArray(parsed.cards)) {
      throw new OpenRouterParseError("Response missing 'cards' array");
    }

    return parsed.cards.map((card, index) => {
      if (typeof card.front !== "string" || typeof card.back !== "string") {
        throw new OpenRouterParseError(`Invalid card at index ${index}`);
      }

      // Truncate to max allowed lengths
      return {
        front: card.front.slice(0, 200),
        back: card.back.slice(0, 500),
      };
    });
  }
}
