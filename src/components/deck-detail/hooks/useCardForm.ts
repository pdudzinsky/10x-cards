import { useCallback, useState } from "react";

import type { CardFormState } from "../../../types";

interface UseCardFormResult {
  form: CardFormState;
  setField: (field: "front" | "back", value: string) => void;
  validate: () => boolean;
  reset: () => void;
  setInitialValues: (front: string, back: string) => void;
}

const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

/**
 * Hook for managing card form state (create/edit)
 */
export function useCardForm(): UseCardFormResult {
  const [form, setForm] = useState<CardFormState>({
    front: "",
    back: "",
    errors: {},
  });

  const setField = useCallback((field: "front" | "back", value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
      errors: {
        ...prev.errors,
        [field]: undefined, // Clear error when field changes
      },
    }));
  }, []);

  const validate = useCallback((): boolean => {
    const errors: { front?: string; back?: string } = {};
    let isValid = true;

    // Validate front
    const frontTrimmed = form.front.trim();
    if (frontTrimmed.length === 0) {
      errors.front = "Przód fiszki nie może być pusty";
      isValid = false;
    } else if (frontTrimmed.length > MAX_FRONT_LENGTH) {
      errors.front = `Przód fiszki może mieć maksymalnie ${MAX_FRONT_LENGTH} znaków`;
      isValid = false;
    }

    // Validate back
    const backTrimmed = form.back.trim();
    if (backTrimmed.length === 0) {
      errors.back = "Tył fiszki nie może być pusty";
      isValid = false;
    } else if (backTrimmed.length > MAX_BACK_LENGTH) {
      errors.back = `Tył fiszki może mieć maksymalnie ${MAX_BACK_LENGTH} znaków`;
      isValid = false;
    }

    setForm((prev) => ({
      ...prev,
      errors,
    }));

    return isValid;
  }, [form.front, form.back]);

  const reset = useCallback(() => {
    setForm({
      front: "",
      back: "",
      errors: {},
    });
  }, []);

  const setInitialValues = useCallback((front: string, back: string) => {
    setForm({
      front,
      back,
      errors: {},
    });
  }, []);

  return {
    form,
    setField,
    validate,
    reset,
    setInitialValues,
  };
}
