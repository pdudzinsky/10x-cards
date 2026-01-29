import { describe, it, expect } from "vitest";
import { mapErrorToType, getErrorMessage } from "./error-utils";

describe("AI Generate Error Utils", () => {
  describe("mapErrorToType", () => {
    describe("defined status codes", () => {
      it("should map 400 to validation", () => {
        expect(mapErrorToType(400)).toBe("validation");
      });

      it("should map 401 to unauthorized", () => {
        expect(mapErrorToType(401)).toBe("unauthorized");
      });

      it("should map 403 to limit_exceeded", () => {
        expect(mapErrorToType(403)).toBe("limit_exceeded");
      });

      it("should map 404 to not_found", () => {
        expect(mapErrorToType(404)).toBe("not_found");
      });

      it("should map 502 to generation_failed", () => {
        expect(mapErrorToType(502)).toBe("generation_failed");
      });
    });

    describe("undefined status codes", () => {
      it("should map 500 to unknown", () => {
        expect(mapErrorToType(500)).toBe("unknown");
      });

      it("should map 503 to unknown", () => {
        expect(mapErrorToType(503)).toBe("unknown");
      });

      it("should map 999 to unknown", () => {
        expect(mapErrorToType(999)).toBe("unknown");
      });

      it("should map 0 to unknown", () => {
        expect(mapErrorToType(0)).toBe("unknown");
      });

      it("should map negative status code to unknown", () => {
        expect(mapErrorToType(-1)).toBe("unknown");
      });
    });
  });

  describe("getErrorMessage", () => {
    describe("validation error", () => {
      it("should return default message when apiMessage is not provided", () => {
        const message = getErrorMessage("validation");
        expect(message).toBe("Tekst musi mieć od 50 do 10 000 znaków");
      });

      it("should return apiMessage when provided", () => {
        const apiMessage = "Custom validation error from API";
        const message = getErrorMessage("validation", apiMessage);
        expect(message).toBe(apiMessage);
      });

      it("should return default message when apiMessage is empty string", () => {
        // Empty string is falsy, so default message is used
        const message = getErrorMessage("validation", "");
        expect(message).toBe("Tekst musi mieć od 50 do 10 000 znaków");
      });
    });

    describe("limit_exceeded error", () => {
      it("should return correct message", () => {
        const message = getErrorMessage("limit_exceeded");
        expect(message).toBe("Przekroczono dzienny limit generacji");
      });

      it("should ignore apiMessage parameter", () => {
        const message = getErrorMessage("limit_exceeded", "Some API message");
        expect(message).toBe("Przekroczono dzienny limit generacji");
      });
    });

    describe("not_found error", () => {
      it("should return correct message", () => {
        const message = getErrorMessage("not_found");
        expect(message).toBe("Talia nie została znaleziona");
      });
    });

    describe("generation_failed error", () => {
      it("should return correct message", () => {
        const message = getErrorMessage("generation_failed");
        expect(message).toBe("Błąd generacji AI. Spróbuj ponownie");
      });
    });

    describe("unauthorized error", () => {
      it("should return correct message", () => {
        const message = getErrorMessage("unauthorized");
        expect(message).toBe("Musisz być zalogowany");
      });
    });

    describe("unknown error", () => {
      it("should return correct message", () => {
        const message = getErrorMessage("unknown");
        expect(message).toBe("Wystąpił nieoczekiwany błąd. Spróbuj ponownie");
      });
    });

    describe("all error types coverage", () => {
      const errorTypes: Array<
        "validation" | "limit_exceeded" | "not_found" | "generation_failed" | "unauthorized" | "unknown"
      > = ["validation", "limit_exceeded", "not_found", "generation_failed", "unauthorized", "unknown"];

      it("should return non-empty message for all error types", () => {
        errorTypes.forEach((errorType) => {
          const message = getErrorMessage(errorType);
          expect(message).toBeTruthy();
          expect(message.length).toBeGreaterThan(0);
        });
      });

      it("should return Polish messages for all error types", () => {
        errorTypes.forEach((errorType) => {
          const message = getErrorMessage(errorType);
          // Check if message contains Polish characters or common Polish words
          expect(message).toMatch(/[ąćęłńóśźżĄĆĘŁŃÓŚŹŻ]|nie|lub|i|w|z/);
        });
      });
    });
  });
});
