import type { SupabaseClient, User, Session } from "@supabase/supabase-js";
import { AuthApiError } from "@supabase/supabase-js";

import type { Database } from "@/db/database.types";
import { InvalidCredentialsError, EmailAlreadyExistsError, AuthError } from "@/lib/errors/auth.errors";

export interface LoginResult {
  user: User;
  session: Session;
}

export interface RegisterResult {
  user: User;
  session: Session | null;
}

/**
 * Logowanie użytkownika przy użyciu email i hasła
 */
export async function login(supabase: SupabaseClient<Database>, email: string, password: string): Promise<LoginResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Map Supabase errors to custom errors
    if (error instanceof AuthApiError) {
      if (error.message === "Invalid login credentials" || error.status === 400) {
        throw new InvalidCredentialsError();
      }
    }
    throw new AuthError(error.message || "Wystąpił błąd podczas logowania", 500, "LOGIN_ERROR");
  }

  if (!data.user || !data.session) {
    throw new AuthError("Brak danych sesji", 500, "NO_SESSION_DATA");
  }

  return {
    user: data.user,
    session: data.session,
  };
}

/**
 * Rejestracja nowego użytkownika
 * Zwraca sesję jeśli email verification jest wyłączona (auto-confirm)
 */
export async function register(
  supabase: SupabaseClient<Database>,
  email: string,
  password: string
): Promise<RegisterResult> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    // Map Supabase errors to custom errors
    if (error instanceof AuthApiError) {
      if (error.message.includes("already registered") || error.status === 422) {
        throw new EmailAlreadyExistsError();
      }
    }
    throw new AuthError(error.message || "Wystąpił błąd podczas rejestracji", 500, "REGISTER_ERROR");
  }

  if (!data.user) {
    throw new AuthError("Brak danych użytkownika", 500, "NO_USER_DATA");
  }

  return {
    user: data.user,
    session: data.session,
  };
}

/**
 * Wylogowanie użytkownika
 */
export async function logout(supabase: SupabaseClient<Database>): Promise<void> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new AuthError(error.message || "Wystąpił błąd podczas wylogowania", 500, "LOGOUT_ERROR");
  }
}

/**
 * Wysłanie emaila z linkiem do resetu hasła
 */
export async function sendPasswordResetEmail(
  supabase: SupabaseClient<Database>,
  email: string,
  redirectTo: string
): Promise<void> {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo,
  });

  if (error) {
    throw new AuthError(error.message || "Wystąpił błąd podczas wysyłania emaila", 500, "RESET_EMAIL_ERROR");
  }
}

/**
 * Ustawienie nowego hasła
 */
export async function resetPassword(supabase: SupabaseClient<Database>, newPassword: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    throw new AuthError(error.message || "Wystąpił błąd podczas zmiany hasła", 500, "RESET_PASSWORD_ERROR");
  }
}

/**
 * Pobranie aktualnie zalogowanego użytkownika
 */
export async function getCurrentUser(supabase: SupabaseClient<Database>): Promise<User | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) {
    throw new AuthError(error.message || "Wystąpił błąd podczas pobierania użytkownika", 500, "GET_USER_ERROR");
  }

  return user;
}

/**
 * Odświeżenie sesji przy użyciu refresh token
 */
export async function refreshSession(
  supabase: SupabaseClient<Database>,
  refreshToken: string
): Promise<{ session: Session }> {
  const { data, error } = await supabase.auth.refreshSession({
    refresh_token: refreshToken,
  });

  if (error) {
    throw new AuthError(error.message || "Nie można odświeżyć sesji", 401, "REFRESH_TOKEN_ERROR");
  }

  if (!data.session) {
    throw new AuthError("Brak danych sesji", 401, "NO_SESSION_DATA");
  }

  return {
    session: data.session,
  };
}
