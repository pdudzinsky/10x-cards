import { type FormEvent, useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FormError } from "./FormError";
import { PasswordInput } from "./PasswordInput";

function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (trimmed.length === 0) {
    return "Email jest wymagany";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "Wprowadź poprawny adres email";
  }
  return null;
}

function validatePassword(password: string): string | null {
  if (password.length === 0) {
    return "Hasło jest wymagane";
  }
  if (password.length < 8) {
    return "Hasło musi mieć co najmniej 8 znaków";
  }
  if (!/[A-Za-z]/.test(password)) {
    return "Hasło musi zawierać co najmniej jedną literę";
  }
  if (!/[0-9]/.test(password)) {
    return "Hasło musi zawierać co najmniej jedną cyfrę";
  }
  return null;
}

function validateConfirmPassword(password: string, confirmPassword: string): string | null {
  if (confirmPassword.length === 0) {
    return "Potwierdzenie hasła jest wymagane";
  }
  if (password !== confirmPassword) {
    return "Hasła muszą być identyczne";
  }
  return null;
}

export function RegisterForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      window.location.href = "/decks";
    }
  }, []);

  const handleEmailChange = useCallback((value: string) => {
    setEmail(value);
    if (value.trim().length > 0) {
      setEmailError(null);
    }
    setServerError(null);
  }, []);

  const handlePasswordChange = useCallback((value: string) => {
    setPassword(value);
    if (value.length > 0) {
      setPasswordError(null);
    }
    setServerError(null);
  }, []);

  const handleConfirmPasswordChange = useCallback((value: string) => {
    setConfirmPassword(value);
    if (value.length > 0) {
      setConfirmPasswordError(null);
    }
    setServerError(null);
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const emailValidationError = validateEmail(email);
      const passwordValidationError = validatePassword(password);
      const confirmPasswordValidationError = validateConfirmPassword(password, confirmPassword);

      if (emailValidationError || passwordValidationError || confirmPasswordValidationError) {
        setEmailError(emailValidationError);
        setPasswordError(passwordValidationError);
        setConfirmPasswordError(confirmPasswordValidationError);
        return;
      }

      setEmailError(null);
      setPasswordError(null);
      setConfirmPasswordError(null);
      setServerError(null);
      setIsLoading(true);

      try {
        const response = await fetch("/api/v1/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
            password,
          }),
        });

        if (!response.ok) {
          if (response.status === 409) {
            setServerError("Konto z tym adresem email już istnieje");
          } else {
            const data = await response.json();
            setServerError(data.message || "Wystąpił błąd. Spróbuj ponownie.");
          }
          return;
        }

        const data = await response.json();

        // If tokens are returned (auto-confirm enabled), save to localStorage and redirect to /decks
        if (data.access_token && data.refresh_token) {
          localStorage.setItem("auth_token", data.access_token);
          localStorage.setItem("auth_refresh_token", data.refresh_token);

          setSuccess(true);

          setTimeout(() => {
            window.location.href = "/decks";
          }, 2000);
        } else {
          // If no tokens (email verification required), redirect to login
          setSuccess(true);

          setTimeout(() => {
            window.location.href = "/login";
          }, 2000);
        }
      } catch {
        setServerError("Wystąpił błąd połączenia. Spróbuj ponownie.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, confirmPassword]
  );

  const isSubmitDisabled =
    isLoading || email.trim().length === 0 || password.length === 0 || confirmPassword.length === 0;

  if (success) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Rejestracja udana!</h1>
          <p className="text-muted-foreground">
            Konto zostało utworzone. Za chwilę zostaniesz przekierowany do aplikacji.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Rejestracja</h1>
        <p className="text-muted-foreground">Utwórz nowe konto, aby zacząć korzystać z aplikacji</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => handleEmailChange(e.target.value)}
            placeholder="twoj@email.com"
            disabled={isLoading}
            autoComplete="email"
            aria-invalid={!!emailError}
            aria-describedby={emailError ? "email-error" : undefined}
            data-testid="register-email"
          />
          {emailError && <FormError message={emailError} id="email-error" />}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Minimum 8 znaków, litera i cyfra"
            disabled={isLoading}
            autoComplete="new-password"
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? "password-error" : undefined}
            data-testid="register-password"
          />
          {passwordError && <FormError message={passwordError} id="password-error" />}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Potwierdź hasło</Label>
          <PasswordInput
            id="confirm-password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="Wprowadź hasło ponownie"
            disabled={isLoading}
            autoComplete="new-password"
            aria-invalid={!!confirmPasswordError}
            aria-describedby={confirmPasswordError ? "confirm-password-error" : undefined}
            data-testid="register-confirm-password"
          />
          {confirmPasswordError && <FormError message={confirmPasswordError} id="confirm-password-error" />}
        </div>

        {serverError && (
          <div className="rounded-md bg-destructive/10 p-3">
            <FormError message={serverError} />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitDisabled} data-testid="register-submit">
          {isLoading ? "Rejestracja..." : "Zarejestruj się"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Masz już konto?{" "}
        <a href="/login" className="text-primary hover:underline">
          Zaloguj się
        </a>
      </div>
    </div>
  );
}
