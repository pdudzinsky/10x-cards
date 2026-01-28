import { describe, it, expect } from "vitest";
import {
  validateFront,
  validateBack,
  validateCardForm,
  MAX_FRONT_LENGTH,
  MAX_BACK_LENGTH,
} from "./validation";

describe("Card Form Validation", () => {
  describe("validateFront", () => {
    describe("empty and whitespace validation", () => {
      it("should be invalid for empty string", () => {
        const result = validateFront("");
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Przód fiszki nie może być pusty");
      });

      it("should be invalid for whitespace-only string", () => {
        const result = validateFront("   ");
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Przód fiszki nie może być pusty");
      });

      it("should be invalid for tabs and newlines only", () => {
        const result = validateFront("\t\n  \n\t");
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Przód fiszki nie może być pusty");
      });
    });

    describe("length validation", () => {
      it("should be valid for 1 character", () => {
        const result = validateFront("a");
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should be valid for exactly MAX_FRONT_LENGTH characters", () => {
        const text = "a".repeat(MAX_FRONT_LENGTH);
        const result = validateFront(text);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should be invalid for MAX_FRONT_LENGTH + 1 characters", () => {
        const text = "a".repeat(MAX_FRONT_LENGTH + 1);
        const result = validateFront(text);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(`Przód fiszki może mieć maksymalnie ${MAX_FRONT_LENGTH} znaków`);
      });

      it("should be invalid for text much longer than MAX_FRONT_LENGTH", () => {
        const text = "a".repeat(500);
        const result = validateFront(text);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(`Przód fiszki może mieć maksymalnie ${MAX_FRONT_LENGTH} znaków`);
      });
    });

    describe("trimming behavior", () => {
      it("should trim whitespace before validation", () => {
        const text = "  hello  ";
        const result = validateFront(text);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should be invalid when text is too long after adding whitespace", () => {
        const text = " ".repeat(10) + "a".repeat(MAX_FRONT_LENGTH + 1) + " ".repeat(10);
        const result = validateFront(text);
        expect(result.isValid).toBe(false);
      });

      it("should be valid when trimmed text is exactly MAX_FRONT_LENGTH", () => {
        const text = "  " + "a".repeat(MAX_FRONT_LENGTH) + "  ";
        const result = validateFront(text);
        expect(result.isValid).toBe(true);
      });
    });

    describe("edge cases", () => {
      it("should handle unicode characters", () => {
        const text = "ąćęłńóśźż";
        const result = validateFront(text);
        expect(result.isValid).toBe(true);
      });

      it("should handle emojis", () => {
        const text = "Hello 👋 World";
        const result = validateFront(text);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("validateBack", () => {
    describe("empty and whitespace validation", () => {
      it("should be invalid for empty string", () => {
        const result = validateBack("");
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Tył fiszki nie może być pusty");
      });

      it("should be invalid for whitespace-only string", () => {
        const result = validateBack("   ");
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Tył fiszki nie może być pusty");
      });

      it("should be invalid for tabs and newlines only", () => {
        const result = validateBack("\t\n  \n\t");
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Tył fiszki nie może być pusty");
      });
    });

    describe("length validation", () => {
      it("should be valid for 1 character", () => {
        const result = validateBack("a");
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should be valid for exactly MAX_BACK_LENGTH characters", () => {
        const text = "a".repeat(MAX_BACK_LENGTH);
        const result = validateBack(text);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should be invalid for MAX_BACK_LENGTH + 1 characters", () => {
        const text = "a".repeat(MAX_BACK_LENGTH + 1);
        const result = validateBack(text);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(`Tył fiszki może mieć maksymalnie ${MAX_BACK_LENGTH} znaków`);
      });

      it("should be invalid for text much longer than MAX_BACK_LENGTH", () => {
        const text = "a".repeat(1000);
        const result = validateBack(text);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe(`Tył fiszki może mieć maksymalnie ${MAX_BACK_LENGTH} znaków`);
      });
    });

    describe("trimming behavior", () => {
      it("should trim whitespace before validation", () => {
        const text = "  hello  ";
        const result = validateBack(text);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should be invalid when text is too long after adding whitespace", () => {
        const text = " ".repeat(10) + "a".repeat(MAX_BACK_LENGTH + 1) + " ".repeat(10);
        const result = validateBack(text);
        expect(result.isValid).toBe(false);
      });

      it("should be valid when trimmed text is exactly MAX_BACK_LENGTH", () => {
        const text = "  " + "a".repeat(MAX_BACK_LENGTH) + "  ";
        const result = validateBack(text);
        expect(result.isValid).toBe(true);
      });
    });

    describe("edge cases", () => {
      it("should handle unicode characters", () => {
        const text = "ąćęłńóśźż";
        const result = validateBack(text);
        expect(result.isValid).toBe(true);
      });

      it("should handle emojis", () => {
        const text = "Hello 👋 World";
        const result = validateBack(text);
        expect(result.isValid).toBe(true);
      });
    });
  });

  describe("validateCardForm", () => {
    describe("both fields valid", () => {
      it("should return valid result for correct input", () => {
        const result = validateCardForm("Valid front", "Valid back");
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it("should return valid result for maximum length input", () => {
        const front = "a".repeat(MAX_FRONT_LENGTH);
        const back = "b".repeat(MAX_BACK_LENGTH);
        const result = validateCardForm(front, back);
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });
    });

    describe("front field invalid", () => {
      it("should return error when front is empty", () => {
        const result = validateCardForm("", "Valid back");
        expect(result.isValid).toBe(false);
        expect(result.errors.front).toBe("Przód fiszki nie może być pusty");
        expect(result.errors.back).toBeUndefined();
      });

      it("should return error when front is too long", () => {
        const front = "a".repeat(MAX_FRONT_LENGTH + 1);
        const result = validateCardForm(front, "Valid back");
        expect(result.isValid).toBe(false);
        expect(result.errors.front).toBe(`Przód fiszki może mieć maksymalnie ${MAX_FRONT_LENGTH} znaków`);
        expect(result.errors.back).toBeUndefined();
      });
    });

    describe("back field invalid", () => {
      it("should return error when back is empty", () => {
        const result = validateCardForm("Valid front", "");
        expect(result.isValid).toBe(false);
        expect(result.errors.front).toBeUndefined();
        expect(result.errors.back).toBe("Tył fiszki nie może być pusty");
      });

      it("should return error when back is too long", () => {
        const back = "a".repeat(MAX_BACK_LENGTH + 1);
        const result = validateCardForm("Valid front", back);
        expect(result.isValid).toBe(false);
        expect(result.errors.front).toBeUndefined();
        expect(result.errors.back).toBe(`Tył fiszki może mieć maksymalnie ${MAX_BACK_LENGTH} znaków`);
      });
    });

    describe("both fields invalid", () => {
      it("should return errors for both fields when empty", () => {
        const result = validateCardForm("", "");
        expect(result.isValid).toBe(false);
        expect(result.errors.front).toBe("Przód fiszki nie może być pusty");
        expect(result.errors.back).toBe("Tył fiszki nie może być pusty");
      });

      it("should return errors for both fields when too long", () => {
        const front = "a".repeat(MAX_FRONT_LENGTH + 1);
        const back = "b".repeat(MAX_BACK_LENGTH + 1);
        const result = validateCardForm(front, back);
        expect(result.isValid).toBe(false);
        expect(result.errors.front).toBe(`Przód fiszki może mieć maksymalnie ${MAX_FRONT_LENGTH} znaków`);
        expect(result.errors.back).toBe(`Tył fiszki może mieć maksymalnie ${MAX_BACK_LENGTH} znaków`);
      });

      it("should return errors when both are whitespace-only", () => {
        const result = validateCardForm("   ", "   ");
        expect(result.isValid).toBe(false);
        expect(result.errors.front).toBe("Przód fiszki nie może być pusty");
        expect(result.errors.back).toBe("Tył fiszki nie może być pusty");
      });
    });

    describe("trimming behavior", () => {
      it("should trim both fields before validation", () => {
        const result = validateCardForm("  front  ", "  back  ");
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });
    });

    describe("edge cases", () => {
      it("should handle unicode in both fields", () => {
        const result = validateCardForm("ąćę front", "łńó back");
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });

      it("should handle newlines in both fields", () => {
        const result = validateCardForm("front\nwith\nlines", "back\nwith\nlines");
        expect(result.isValid).toBe(true);
        expect(result.errors).toEqual({});
      });
    });
  });

  describe("constants", () => {
    it("should have correct MAX_FRONT_LENGTH", () => {
      expect(MAX_FRONT_LENGTH).toBe(200);
    });

    it("should have correct MAX_BACK_LENGTH", () => {
      expect(MAX_BACK_LENGTH).toBe(500);
    });
  });
});
