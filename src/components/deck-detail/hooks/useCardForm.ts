import { useCallback, useState } from "react";

import type { CardFormState } from "../../../types";
import { validateCardForm } from "../validation";

interface UseCardFormResult {
  form: CardFormState;
  setField: (field: "front" | "back", value: string) => void;
  validate: () => boolean;
  reset: () => void;
  setInitialValues: (front: string, back: string) => void;
}

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
    const validationResult = validateCardForm(form.front, form.back);

    setForm((prev) => ({
      ...prev,
      errors: validationResult.errors,
    }));

    return validationResult.isValid;
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
