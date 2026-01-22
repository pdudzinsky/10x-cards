// ============================================================================
// OpenRouter Error Classes
// ============================================================================

/**
 * Base error class for all OpenRouter-related errors
 */
export class OpenRouterError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterError";
  }
}

/**
 * Configuration error (e.g., missing API key)
 */
export class OpenRouterConfigError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterConfigError";
  }
}

/**
 * Input validation error (e.g., text too short/long, invalid count)
 */
export class OpenRouterValidationError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterValidationError";
  }
}

/**
 * Authentication error (HTTP 401)
 */
export class OpenRouterAuthError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterAuthError";
  }
}

/**
 * Insufficient credits error (HTTP 402)
 */
export class OpenRouterInsufficientCreditsError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterInsufficientCreditsError";
  }
}

/**
 * Content moderation error (HTTP 403)
 */
export class OpenRouterModerationError extends OpenRouterError {
  public readonly metadata?: unknown;

  constructor(message: string, metadata?: unknown) {
    super(message);
    this.name = "OpenRouterModerationError";
    this.metadata = metadata;
  }
}

/**
 * Rate limit exceeded error (HTTP 429)
 */
export class OpenRouterRateLimitError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterRateLimitError";
  }
}

/**
 * Model unavailable error (HTTP 502, 503)
 */
export class OpenRouterModelError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterModelError";
  }
}

/**
 * Network/timeout error
 */
export class OpenRouterNetworkError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterNetworkError";
  }
}

/**
 * Response parsing error
 */
export class OpenRouterParseError extends OpenRouterError {
  constructor(message: string) {
    super(message);
    this.name = "OpenRouterParseError";
  }
}

/**
 * Generic API error with status code
 */
export class OpenRouterApiError extends OpenRouterError {
  public readonly statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "OpenRouterApiError";
    this.statusCode = statusCode;
  }
}
