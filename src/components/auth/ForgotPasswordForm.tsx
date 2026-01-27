import { type FormEvent, useCallback, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { FormError } from "./FormError";

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

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
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

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();

      const emailValidationError = validateEmail(email);

      if (emailValidationError) {
        setEmailError(emailValidationError);
        return;
      }

      setEmailError(null);
      setServerError(null);
      setIsLoading(true);

      try {
        const response = await fetch("/api/v1/auth/forgot-password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          setServerError(data.message || "Wystąpił błąd. Spróbuj ponownie.");
          return;
        }

        setSuccess(true);
      } catch (error) {
        setServerError("Wystąpił błąd połączenia. Spróbuj ponownie.");
      } finally {
        setIsLoading(false);
      }
    },
    [email]
  );

  const isSubmitDisabled = isLoading || email.trim().length === 0;

  if (success) {
    return (
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Email wysłany</h1>
          <p className="text-muted-foreground">
            Jeśli konto z tym adresem email istnieje, wysłaliśmy na nie link do resetowania hasła. Sprawdź swoją
            skrzynkę pocztową.
          </p>
        </div>

        <div className="text-center">
          <a href="/login" className="text-primary hover:underline">
            Powrót do logowania
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold">Zapomniałeś hasła?</h1>
        <p className="text-muted-foreground">Wprowadź swój adres email, a wyślemy Ci link do resetowania hasła</p>
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
          />
          {emailError && <FormError message={emailError} id="email-error" />}
        </div>

        {serverError && (
          <div className="rounded-md bg-destructive/10 p-3">
            <FormError message={serverError} />
          </div>
        )}

        <Button type="submit" className="w-full" disabled={isSubmitDisabled}>
          {isLoading ? "Wysyłanie..." : "Wyślij link resetujący"}
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
