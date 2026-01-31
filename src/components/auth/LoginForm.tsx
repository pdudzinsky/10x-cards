import { type FormEvent, useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FormError } from "./FormError";
import { PasswordInput } from "./PasswordInput";

interface LoginFormProps {
  redirectTo?: string;
}

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
  return null;
}

export function LoginForm({ redirectTo = "/decks" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (token) {
      window.location.href = redirectTo;
    }
  }, [redirectTo]);

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

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const emailValidationError = validateEmail(email);
      const passwordValidationError = validatePassword(password);

      if (emailValidationError || passwordValidationError) {
        setEmailError(emailValidationError);
        setPasswordError(passwordValidationError);
        return;
      }

      setEmailError(null);
      setPasswordError(null);
      setServerError(null);
      setIsLoading(true);

      try {
        const response = await fetch("/api/v1/auth/login", {
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
          if (response.status === 401) {
            setServerError("Niepoprawny email lub hasło");
          } else {
            const data = await response.json();
            setServerError(data.message || "Wystąpił błąd. Spróbuj ponownie.");
          }
          return;
        }

        const data = await response.json();

        localStorage.setItem("auth_token", data.access_token);
        if (data.refresh_token) {
          localStorage.setItem("auth_refresh_token", data.refresh_token);
        }

        window.location.href = redirectTo;
      } catch {
        setServerError("Wystąpił błąd połączenia. Spróbuj ponownie.");
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, redirectTo]
  );

  const isSubmitDisabled = isLoading || email.trim().length === 0 || password.length === 0;

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Logowanie</h1>
        <p className="text-muted-foreground">Wprowadź swoje dane, aby się zalogować</p>
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
            data-testid="login-email"
          />
          {emailError && <FormError message={emailError} id="email-error" />}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Hasło</Label>
          <PasswordInput
            id="password"
            value={password}
            onChange={handlePasswordChange}
            placeholder="Wprowadź hasło"
            disabled={isLoading}
            autoComplete="current-password"
            aria-invalid={!!passwordError}
            aria-describedby={passwordError ? "password-error" : undefined}
            data-testid="login-password"
          />
          {passwordError && <FormError message={passwordError} id="password-error" />}
        </div>

        {serverError && (
          <div className="rounded-md bg-destructive/10 p-3">
            <FormError message={serverError} />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitDisabled} data-testid="login-submit">
          {isLoading ? "Logowanie..." : "Zaloguj się"}
        </Button>
      </form>

      <div className="space-y-2 text-center text-sm">
        <div>
          <a href="/forgot-password" className="text-primary hover:underline">
            Zapomniałeś hasła?
          </a>
        </div>
        <div className="text-muted-foreground">
          Nie masz konta?{" "}
          <a href="/register" className="text-primary hover:underline">
            Zarejestruj się
          </a>
        </div>
      </div>
    </div>
  );
}
