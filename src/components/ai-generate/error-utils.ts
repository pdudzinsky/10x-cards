/**
 * Error handling utilities for AI generation
 */

import type { AIGenerateError } from "./types";

/**
 * Maps HTTP status code to error type
 * @param status - HTTP status code
 * @returns Mapped error type
 */
export function mapErrorToType(status: number): AIGenerateError["type"] {
  switch (status) {
    case 400:
      return "validation";
    case 401:
      return "unauthorized";
    case 403:
      return "limit_exceeded";
    case 404:
      return "not_found";
    case 502:
      return "generation_failed";
    default:
      return "unknown";
  }
}

/**
 * Gets user-friendly error message for error type
 * @param errorType - Type of error
 * @param apiMessage - Optional message from API (used for validation errors)
 * @returns User-friendly error message in Polish
 */
export function getErrorMessage(errorType: AIGenerateError["type"], apiMessage?: string): string {
  switch (errorType) {
    case "validation":
      return apiMessage || "Tekst musi mieć od 50 do 10 000 znaków";
    case "limit_exceeded":
      return "Przekroczono dzienny limit generacji";
    case "not_found":
      return "Talia nie została znaleziona";
    case "generation_failed":
      return "Błąd generacji AI. Spróbuj ponownie";
    case "unauthorized":
      return "Musisz być zalogowany";
    case "unknown":
      return "Wystąpił nieoczekiwany błąd. Spróbuj ponownie";
  }
}
