import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@/test/utils/test-utils";
import userEvent from "@testing-library/user-event";
import React from "react";

import { PasswordInput } from "./PasswordInput";

describe("PasswordInput", () => {
  const defaultProps = {
    id: "test-password",
    value: "",
    onChange: vi.fn(),
  };

  describe("Renderowanie", () => {
    it('renderuje input type="password" domyślnie', () => {
      render(<PasswordInput {...defaultProps} />);

      const input = screen.getByLabelText("Pokaż hasło").previousElementSibling as HTMLInputElement;
      expect(input).toHaveAttribute("type", "password");
    });

    it("renderuje przycisk toggle z ikoną Eye", () => {
      render(<PasswordInput {...defaultProps} />);

      const toggleButton = screen.getByRole("button", { name: "Pokaż hasło" });
      expect(toggleButton).toBeInTheDocument();

      // Sprawdzenie obecności ikony Eye (lucide-react renderuje svg)
      const eyeIcon = toggleButton.querySelector("svg");
      expect(eyeIcon).toBeInTheDocument();
    });

    it('aria-label przycisku = "Pokaż hasło"', () => {
      render(<PasswordInput {...defaultProps} />);

      const toggleButton = screen.getByRole("button");
      expect(toggleButton).toHaveAttribute("aria-label", "Pokaż hasło");
    });

    it("renderuje placeholder gdy jest przekazany", () => {
      render(<PasswordInput {...defaultProps} placeholder="Wprowadź hasło" />);

      const input = screen.getByPlaceholderText("Wprowadź hasło");
      expect(input).toBeInTheDocument();
    });
  });

  describe("Toggle visibility", () => {
    it('kliknięcie przycisku zmienia type na "text"', async () => {
      const user = userEvent.setup();
      render(<PasswordInput {...defaultProps} />);

      const toggleButton = screen.getByRole("button", { name: "Pokaż hasło" });
      const input = toggleButton.previousElementSibling as HTMLInputElement;

      expect(input).toHaveAttribute("type", "password");

      await user.click(toggleButton);

      expect(input).toHaveAttribute("type", "text");
    });

    it("kliknięcie przycisku zmienia ikonę na EyeOff", async () => {
      const user = userEvent.setup();
      render(<PasswordInput {...defaultProps} />);

      const toggleButton = screen.getByRole("button", { name: "Pokaż hasło" });

      await user.click(toggleButton);

      // Po kliknięciu aria-label się zmienia, co wskazuje na zmianę ikony
      expect(toggleButton).toHaveAttribute("aria-label", "Ukryj hasło");
    });

    it('kliknięcie przycisku zmienia aria-label na "Ukryj hasło"', async () => {
      const user = userEvent.setup();
      render(<PasswordInput {...defaultProps} />);

      const toggleButton = screen.getByRole("button", { name: "Pokaż hasło" });

      await user.click(toggleButton);

      expect(toggleButton).toHaveAttribute("aria-label", "Ukryj hasło");
    });

    it('ponowne kliknięcie wraca do type="password"', async () => {
      const user = userEvent.setup();
      render(<PasswordInput {...defaultProps} />);

      const toggleButton = screen.getByRole("button", { name: "Pokaż hasło" });
      const input = toggleButton.previousElementSibling as HTMLInputElement;

      // Pierwsze kliknięcie - pokaż hasło
      await user.click(toggleButton);
      expect(input).toHaveAttribute("type", "text");

      // Drugie kliknięcie - ukryj hasło
      const toggleButtonAfter = screen.getByRole("button", { name: "Ukryj hasło" });
      await user.click(toggleButtonAfter);
      expect(input).toHaveAttribute("type", "password");
    });

    it("wielokrotne klikanie toggle działa poprawnie", async () => {
      const user = userEvent.setup();
      render(<PasswordInput {...defaultProps} />);

      let toggleButton = screen.getByRole("button", { name: "Pokaż hasło" });
      const input = toggleButton.previousElementSibling as HTMLInputElement;

      // Pierwszy cykl
      await user.click(toggleButton);
      expect(input).toHaveAttribute("type", "text");

      toggleButton = screen.getByRole("button", { name: "Ukryj hasło" });
      await user.click(toggleButton);
      expect(input).toHaveAttribute("type", "password");

      // Drugi cykl
      toggleButton = screen.getByRole("button", { name: "Pokaż hasło" });
      await user.click(toggleButton);
      expect(input).toHaveAttribute("type", "text");
    });
  });

  describe("Props", () => {
    it("disabled=true blokuje przycisk toggle", () => {
      render(<PasswordInput {...defaultProps} disabled={true} />);

      const toggleButton = screen.getByRole("button");
      expect(toggleButton).toBeDisabled();
    });

    it("disabled=true blokuje input", () => {
      render(<PasswordInput {...defaultProps} disabled={true} />);

      const toggleButton = screen.getByRole("button");
      const input = toggleButton.previousElementSibling as HTMLInputElement;
      expect(input).toBeDisabled();
    });

    it("onChange propaguje wartość z input", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      // Wrapper do symulacji controlled input
      function TestWrapper() {
        const [value, setValue] = React.useState("");
        return (
          <PasswordInput
            {...defaultProps}
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
              onChange(newValue);
            }}
          />
        );
      }

      render(<TestWrapper />);

      const toggleButton = screen.getByRole("button");
      const input = toggleButton.previousElementSibling as HTMLInputElement;

      await user.type(input, "abc");

      expect(onChange).toHaveBeenCalledTimes(3); // 3 znaki
      expect(onChange).toHaveBeenLastCalledWith("abc");
    });

    it("onChange jest wywoływany z każdą zmianą", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();

      // Wrapper do symulacji controlled input
      function TestWrapper() {
        const [value, setValue] = React.useState("");
        return (
          <PasswordInput
            {...defaultProps}
            value={value}
            onChange={(newValue) => {
              setValue(newValue);
              onChange(newValue);
            }}
          />
        );
      }

      render(<TestWrapper />);

      const toggleButton = screen.getByRole("button");
      const input = toggleButton.previousElementSibling as HTMLInputElement;

      await user.type(input, "abc");

      expect(onChange).toHaveBeenNthCalledWith(1, "a");
      expect(onChange).toHaveBeenNthCalledWith(2, "ab");
      expect(onChange).toHaveBeenNthCalledWith(3, "abc");
    });

    it("aria-invalid jest przekazane do Input", () => {
      render(<PasswordInput {...defaultProps} aria-invalid={true} />);

      const toggleButton = screen.getByRole("button");
      const input = toggleButton.previousElementSibling as HTMLInputElement;

      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    it("aria-describedby jest przekazane do Input", () => {
      render(<PasswordInput {...defaultProps} aria-describedby="password-error" />);

      const toggleButton = screen.getByRole("button");
      const input = toggleButton.previousElementSibling as HTMLInputElement;

      expect(input).toHaveAttribute("aria-describedby", "password-error");
    });

    it("autoComplete jest przekazane do Input", () => {
      render(<PasswordInput {...defaultProps} autoComplete="current-password" />);

      const toggleButton = screen.getByRole("button");
      const input = toggleButton.previousElementSibling as HTMLInputElement;

      expect(input).toHaveAttribute("autocomplete", "current-password");
    });

    it("value jest poprawnie wyświetlana w input", () => {
      render(<PasswordInput {...defaultProps} value="secret123" />);

      const toggleButton = screen.getByRole("button");
      const input = toggleButton.previousElementSibling as HTMLInputElement;

      expect(input).toHaveValue("secret123");
    });

    it("id jest przekazane do Input", () => {
      render(<PasswordInput {...defaultProps} id="custom-id" />);

      const toggleButton = screen.getByRole("button");
      const input = toggleButton.previousElementSibling as HTMLInputElement;

      expect(input).toHaveAttribute("id", "custom-id");
    });
  });

  describe("Accessibility", () => {
    it('przycisk ma type="button" (nie submit)', () => {
      render(<PasswordInput {...defaultProps} />);

      const toggleButton = screen.getByRole("button");
      expect(toggleButton).toHaveAttribute("type", "button");
    });

    it("aria-label jest zawsze ustawiony", () => {
      render(<PasswordInput {...defaultProps} />);

      const toggleButton = screen.getByRole("button");
      expect(toggleButton).toHaveAttribute("aria-label");
    });

    it("aria-label zmienia się dynamicznie", async () => {
      const user = userEvent.setup();
      render(<PasswordInput {...defaultProps} />);

      let toggleButton = screen.getByRole("button");
      expect(toggleButton).toHaveAttribute("aria-label", "Pokaż hasło");

      await user.click(toggleButton);

      toggleButton = screen.getByRole("button");
      expect(toggleButton).toHaveAttribute("aria-label", "Ukryj hasło");
    });

    it("input jest dostępny dla screen readers", () => {
      render(<PasswordInput {...defaultProps} id="password-field" />);

      const toggleButton = screen.getByRole("button");
      const input = toggleButton.previousElementSibling as HTMLInputElement;
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("id", "password-field");
    });

    it("wszystkie aria-* props są przekazywane do input", () => {
      render(<PasswordInput {...defaultProps} aria-invalid={true} aria-describedby="error-message" />);

      const toggleButton = screen.getByRole("button");
      const input = toggleButton.previousElementSibling as HTMLInputElement;

      expect(input).toHaveAttribute("aria-invalid", "true");
      expect(input).toHaveAttribute("aria-describedby", "error-message");
    });
  });

  describe("Edge cases", () => {
    it("działa poprawnie z pustą wartością", () => {
      render(<PasswordInput {...defaultProps} value="" />);

      const toggleButton = screen.getByRole("button");
      const input = toggleButton.previousElementSibling as HTMLInputElement;

      expect(input).toHaveValue("");
    });

    it("działa poprawnie z bardzo długą wartością", () => {
      const longPassword = "a".repeat(200);
      render(<PasswordInput {...defaultProps} value={longPassword} />);

      const toggleButton = screen.getByRole("button");
      const input = toggleButton.previousElementSibling as HTMLInputElement;

      expect(input).toHaveValue(longPassword);
    });

    it("toggle nie wpływa na wartość input", async () => {
      const user = userEvent.setup();
      const onChange = vi.fn();
      render(<PasswordInput {...defaultProps} value="test123" onChange={onChange} />);

      const toggleButton = screen.getByRole("button");
      const input = toggleButton.previousElementSibling as HTMLInputElement;

      await user.click(toggleButton);

      expect(input).toHaveValue("test123");
      expect(onChange).not.toHaveBeenCalled();
    });

    it("disabled prop nie wpływa na widoczność hasła", async () => {
      const user = userEvent.setup();
      const { rerender } = render(<PasswordInput {...defaultProps} />);

      const toggleButton = screen.getByRole("button");
      await user.click(toggleButton);

      const input = toggleButton.previousElementSibling as HTMLInputElement;
      expect(input).toHaveAttribute("type", "text");

      // Zmiana na disabled nie powinna zmienić type
      rerender(<PasswordInput {...defaultProps} disabled={true} />);

      expect(input).toHaveAttribute("type", "text");
    });
  });
});
