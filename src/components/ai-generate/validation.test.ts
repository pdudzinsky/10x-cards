import { describe, it, expect } from "vitest";
import { validateSourceText, validateForm, MIN_TEXT_LENGTH, MAX_TEXT_LENGTH } from "./validation";

describe("AI Generate Validation", () => {
  describe("validateSourceText", () => {
    describe("empty and whitespace text", () => {
      it("should be valid for empty text", () => {
        const result = validateSourceText("");
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should be valid for whitespace-only text", () => {
        const result = validateSourceText("   ");
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    describe("minimum length validation", () => {
      it("should be invalid for text with 49 characters", () => {
        const text = "a".repeat(49);
        const result = validateSourceText(text);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Tekst musi mieć co najmniej 50 znaków");
      });

      it("should be valid for text with exactly 50 characters", () => {
        const text = "a".repeat(50);
        const result = validateSourceText(text);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should be valid for text with 51 characters", () => {
        const text = "a".repeat(51);
        const result = validateSourceText(text);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });

    describe("maximum length validation", () => {
      it("should be valid for text with exactly 10000 characters", () => {
        const text = "a".repeat(10000);
        const result = validateSourceText(text);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should be invalid for text with 10001 characters", () => {
        const text = "a".repeat(10001);
        const result = validateSourceText(text);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Tekst nie może przekraczać 10 000 znaków");
      });

      it("should be invalid for text with more than 10000 characters", () => {
        const text = "a".repeat(15000);
        const result = validateSourceText(text);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Tekst nie może przekraczać 10 000 znaków");
      });
    });

    describe("trimming behavior", () => {
      it("should check trimmed length for minimum validation", () => {
        const text = "hello" + " ".repeat(50); // 5 chars + 50 spaces
        const result = validateSourceText(text);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Tekst musi mieć co najmniej 50 znaków");
      });

      it("should check raw length for maximum validation", () => {
        const text = " ".repeat(10001);
        const result = validateSourceText(text);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Tekst nie może przekraczać 10 000 znaków");
      });

      it("should trim whitespace at both ends for minimum length check", () => {
        const text = "   " + "a".repeat(49) + "   ";
        const result = validateSourceText(text);
        expect(result.isValid).toBe(false);
        expect(result.error).toBe("Tekst musi mieć co najmniej 50 znaków");
      });
    });

    describe("edge cases", () => {
      it("should handle newlines and tabs in text", () => {
        const text = "a".repeat(50) + "\n\t\n";
        const result = validateSourceText(text);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });

      it("should handle unicode characters", () => {
        const text = "ąćęłńóśźż".repeat(6); // 54 characters
        const result = validateSourceText(text);
        expect(result.isValid).toBe(true);
        expect(result.error).toBeUndefined();
      });
    });
  });

  describe("validateForm", () => {
    it("should return true for valid text (50 characters)", () => {
      const text = "a".repeat(50);
      expect(validateForm(text)).toBe(true);
    });

    it("should return true for valid text (between 50 and 10000)", () => {
      const text = "a".repeat(500);
      expect(validateForm(text)).toBe(true);
    });

    it("should return true for valid text (exactly 10000 characters)", () => {
      const text = "a".repeat(10000);
      expect(validateForm(text)).toBe(true);
    });

    it("should return false for empty text", () => {
      expect(validateForm("")).toBe(false);
    });

    it("should return false for text shorter than 50 characters after trim", () => {
      const text = "a".repeat(49);
      expect(validateForm(text)).toBe(false);
    });

    it("should return false for text longer than 10000 characters", () => {
      const text = "a".repeat(10001);
      expect(validateForm(text)).toBe(false);
    });

    it("should check trimmed length for minimum validation", () => {
      const text = "  " + "a".repeat(48) + "  "; // 48 after trim
      expect(validateForm(text)).toBe(false);
    });

    it("should check raw length for maximum validation", () => {
      const text = "a".repeat(9999) + " ".repeat(2); // 10001 total
      expect(validateForm(text)).toBe(false);
    });
  });

  describe("constants", () => {
    it("should have correct MIN_TEXT_LENGTH", () => {
      expect(MIN_TEXT_LENGTH).toBe(50);
    });

    it("should have correct MAX_TEXT_LENGTH", () => {
      expect(MAX_TEXT_LENGTH).toBe(10000);
    });
  });
});
