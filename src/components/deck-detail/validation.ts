/**
 * Validation utilities for card form
 */

export const MAX_FRONT_LENGTH = 200;
export const MAX_BACK_LENGTH = 500;

export interface CardFieldValidationResult {
  isValid: boolean;
  error?: string;
}

export interface CardFormValidationResult {
  isValid: boolean;
  errors: {
    front?: string;
    back?: string;
  };
}

/**
 * Validates the front field of a card
 * @param front - The front text to validate
 * @returns Validation result with error message if invalid
 */
export function validateFront(front: string): CardFieldValidationResult {
  const trimmed = front.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: "Przód fiszki nie może być pusty",
    };
  }

  if (trimmed.length > MAX_FRONT_LENGTH) {
    return {
      isValid: false,
      error: `Przód fiszki może mieć maksymalnie ${MAX_FRONT_LENGTH} znaków`,
    };
  }

  return { isValid: true };
}

/**
 * Validates the back field of a card
 * @param back - The back text to validate
 * @returns Validation result with error message if invalid
 */
export function validateBack(back: string): CardFieldValidationResult {
  const trimmed = back.trim();

  if (trimmed.length === 0) {
    return {
      isValid: false,
      error: "Tył fiszki nie może być pusty",
    };
  }

  if (trimmed.length > MAX_BACK_LENGTH) {
    return {
      isValid: false,
      error: `Tył fiszki może mieć maksymalnie ${MAX_BACK_LENGTH} znaków`,
    };
  }

  return { isValid: true };
}

/**
 * Validates the entire card form
 * @param front - The front text
 * @param back - The back text
 * @returns Validation result with all errors
 */
export function validateCardForm(front: string, back: string): CardFormValidationResult {
  const frontResult = validateFront(front);
  const backResult = validateBack(back);

  const errors: { front?: string; back?: string } = {};
  let isValid = true;

  if (!frontResult.isValid) {
    errors.front = frontResult.error;
    isValid = false;
  }

  if (!backResult.isValid) {
    errors.back = backResult.error;
    isValid = false;
  }

  return { isValid, errors };
}
