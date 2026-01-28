/**
 * Validation utilities for AI generation form
 */

export const MIN_TEXT_LENGTH = 50;
export const MAX_TEXT_LENGTH = 10000;

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates source text for AI card generation
 * @param text - The source text to validate
 * @returns Validation result with error message if invalid
 */
export function validateSourceText(text: string): ValidationResult {
  const trimmedLength = text.trim().length;

  if (trimmedLength > 0 && trimmedLength < MIN_TEXT_LENGTH) {
    return {
      isValid: false,
      error: "Tekst musi mieć co najmniej 50 znaków",
    };
  }

  if (text.length > MAX_TEXT_LENGTH) {
    return {
      isValid: false,
      error: "Tekst nie może przekraczać 10 000 znaków",
    };
  }

  return { isValid: true };
}

/**
 * Validates if the form can be submitted
 * @param sourceText - The source text to validate
 * @returns True if form is valid for submission
 */
export function validateForm(sourceText: string): boolean {
  const trimmedLength = sourceText.trim().length;
  return trimmedLength >= MIN_TEXT_LENGTH && sourceText.length <= MAX_TEXT_LENGTH;
}
