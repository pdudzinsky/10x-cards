import { type FormEvent, useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

import { FormError } from "./FormError";
import { PasswordInput } from "./PasswordInput";

interface ResetPasswordFormProps {
  accessToken: string;
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

export function ResetPasswordForm({ accessToken }: ResetPasswordFormProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

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

      const passwordValidationError = validatePassword(password);
      const confirmPasswordValidationError = validateConfirmPassword(password, confirmPassword);

      if (passwordValidationError || confirmPasswordValidationError) {
        setPasswordError(passwordValidationError);
        setConfirmPasswordError(confirmPasswordValidationError);
        return;
      }

      setPasswordError(null);
      setConfirmPasswordError(null);
      setServerError(null);
      setIsLoading(true);

      try {
        const response = await fetch("/api/v1/auth/reset-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            password,
          }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            setServerError("Link resetowania hasła jest nieważny lub wygasł. Poproś o nowy.");
          } else {
            const data = await response.json();
            setServerError(data.message || "Wystąpił błąd. Spróbuj ponownie.");
          }
          return;
        }

        setSuccess(true);

        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);
      } catch (error) {
        setServerError("Wystąpił błąd połączenia. Spróbuj ponownie.");
      } finally {
        setIsLoading(false);
      }
    },
    [password, confirmPassword, accessToken]
  );

  const isSubmitDisabled = isLoading || password.length === 0 || confirmPassword.length === 0;

  if (!accessToken) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Nieprawidłowy link</h1>
          <p className="text-muted-foreground">Link resetowania hasła jest nieprawidłowy lub wygasł.</p>
        </div>

        <div className="text-center">
          <a href="/forgot-password" className="text-primary hover:underline">
            Poproś o nowy link
          </a>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Hasło zmienione!</h1>
          <p className="text-muted-foreground">
            Twoje hasło zostało pomyślnie zmienione. Za chwilę zostaniesz przekierowany na stronę logowania.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Ustaw nowe hasło</h1>
        <p className="text-muted-foreground">Wprowadź nowe hasło dla swojego konta</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="password">Nowe hasło</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Minimum 8 znaków, litera i cyfra"
            disabled={isLoading}
            autoComplete="new-password"
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? "password-error" : undefined}
          />
          {passwordError && <FormError message={passwordError} id="password-error" />}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirm-password">Potwierdź nowe hasło</Label>
          <PasswordInput
            id="confirm-password"
            value={confirmPassword}
            onChange={handleConfirmPasswordChange}
            placeholder="Wprowadź hasło ponownie"
            disabled={isLoading}
            autoComplete="new-password"
            aria-invalid={!!confirmPasswordError}
            aria-describedby={confirmPasswordError ? "confirm-password-error" : undefined}
          />
          {confirmPasswordError && <FormError message={confirmPasswordError} id="confirm-password-error" />}
        </div>

        {serverError && (
          <div className="rounded-md bg-destructive/10 p-3">
            <FormError message={serverError} />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
          {isLoading ? "Zapisywanie..." : "Zmień hasło"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Pamiętasz hasło?{" "}
        <a href="/login" className="text-primary hover:underline">
          Zaloguj się
        </a>
      </div>
    </div>
  );
}
