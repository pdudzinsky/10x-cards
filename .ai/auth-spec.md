# Specyfikacja Architektury Modułu Autentykacji

## UWAGA: Kluczowe aktualizacje specyfikacji

**Data aktualizacji**: 2026-01-26

Specyfikacja została zaktualizowana aby być zgodną z:

1. **Obecną architekturą projektu**: Używa Bearer tokens zamiast cookies (zgodnie z istniejącym middleware)
2. **PRD**: Wszystkie User Stories (US-001, US-002, US-003) są realizowalne
3. **Minimalizm MVP**: Usunięto nadmiarowe elementy, skoncentrowano się na kluczowych funkcjonalnościach

**Główne zmiany względem pierwszej wersji**:

- ✅ Bearer tokens w `localStorage` zamiast cookies (zgodnie z obecnym middleware)
- ✅ Brak wymogu instalacji `@supabase/ssr`
- ✅ Uproszczenie layoutów (możliwość użycia istniejącego `Layout.astro`)
- ✅ Opcjonalność endpointów `/api/v1/auth/logout` i `/api/v1/auth/me`
- ✅ Jasna definicja strony głównej `/`
- ✅ Dodanie SQL triggera dla automatycznego tworzenia profilu
- ✅ Ochrona ścieżek może być na poziomie stron zamiast w middleware (elastyczność)

---

## STATUS IMPLEMENTACJI

### ✅ Już zaimplementowane (nie wymaga pracy)

1. **Middleware** (`src/middleware/index.ts`)
   - ✅ Obsługa Bearer tokens z nagłówka `Authorization`
   - ✅ Weryfikacja tokena przez `supabase.auth.getUser()`
   - ✅ Ustawienie `context.locals.user` i `context.locals.supabase`
   - **NIE WYMAGA ZMIAN** - działa zgodnie z założeniami

2. **Layout** (`src/layouts/Layout.astro`)
   - ✅ Podstawowy layout z ThemeToggle
   - ✅ Obsługa dark mode
   - ✅ Toaster dla notyfikacji
   - **Może być użyty dla stron auth** (bez tworzenia AuthLayout)

3. **Komponenty UI z shadcn/ui**
   - ✅ `Button`, `Input`, `Label`, `Textarea`, `Dialog`
   - **Gotowe do użycia** w formularzach auth

4. **Supabase Client** (`src/db/supabase.client.ts`)
   - ✅ Skonfigurowany klient Supabase
   - ✅ Typy Database
   - **Gotowy do użycia** w API endpoints

5. **Strona główna** (`src/pages/index.astro`)
   - ✅ Istnieje (używa Welcome component)
   - ⚠️ **WYMAGA MODYFIKACJI**: dodanie logiki przekierowania zalogowanych do `/decks`

### ❌ Nie zaimplementowane (do zrobienia)

1. **Strony auth** - WSZYSTKIE do utworzenia:
   - ❌ `src/pages/login.astro`
   - ❌ `src/pages/register.astro`
   - ❌ `src/pages/forgot-password.astro`
   - ❌ `src/pages/reset-password.astro`

2. **API Endpoints auth** - WSZYSTKIE do utworzenia:
   - ❌ `src/pages/api/v1/auth/register.ts`
   - ❌ `src/pages/api/v1/auth/login.ts`
   - ❌ `src/pages/api/v1/auth/forgot-password.ts`
   - ❌ `src/pages/api/v1/auth/reset-password.ts`
   - ❌ `src/pages/api/v1/auth/logout.ts` (opcjonalnie)
   - ❌ `src/pages/api/v1/auth/me.ts` (opcjonalnie)

3. **Komponenty React auth** - WSZYSTKIE do utworzenia:
   - ❌ `src/components/auth/LoginForm.tsx`
   - ❌ `src/components/auth/RegisterForm.tsx`
   - ❌ `src/components/auth/ForgotPasswordForm.tsx`
   - ❌ `src/components/auth/ResetPasswordForm.tsx`
   - ❌ `src/components/auth/PasswordInput.tsx` (komponent z toggle widoczności)
   - ❌ `src/components/auth/FormError.tsx` (wyświetlanie błędów)
   - ❌ `src/components/auth/FormSuccess.tsx` (wyświetlanie sukcesów)
   - ❌ `src/components/auth/NavBar.tsx` lub `UserMenu.tsx` (opcjonalnie, dla wylogowania)

4. **Serwisy** - DO UTWORZENIA:
   - ❌ `src/lib/services/auth.service.ts`

5. **Walidacja** - DO UTWORZENIA:
   - ❌ `src/lib/schemas/auth.schemas.ts` (Zod schemas)

6. **Błędy** - DO UTWORZENIA:
   - ❌ `src/lib/errors/auth.errors.ts`

7. **Ochrona stron** - DO DODANIA:
   - ⚠️ `src/pages/decks.astro` - dodać guard clause
   - ⚠️ `src/pages/decks/[deckId].astro` - dodać guard clause
   - ⚠️ `src/pages/decks/[deckId]/ai-generate.astro` - dodać guard clause
   - ⚠️ `src/pages/decks/[deckId]/review.astro` - dodać guard clause

8. **Trigger SQL** - DO UTWORZENIA w Supabase:
   - ❌ Trigger automatycznego tworzenia profilu przy rejestracji

9. **AuthLayout** (opcjonalnie) - NIE KONIECZNE:
   - 🔵 `src/layouts/AuthLayout.astro` - można pominąć i użyć istniejącego `Layout.astro`

---

## 1. Przegląd

Dokument opisuje architekturę modułu rejestracji, logowania i odzyskiwania hasła dla aplikacji 10x-cards. Specyfikacja obejmuje warstwę interfejsu użytkownika, logikę backendową oraz integrację z Supabase Auth, zgodnie z wymaganiami US-001, US-002 i US-003.

### 1.1 Wymagania funkcjonalne

Na podstawie PRD (US-001, US-002, US-003):

- **Rejestracja (US-001)**: Użytkownik zakłada konto przy użyciu emaila i hasła.
- **Logowanie (US-002)**: Użytkownik loguje się do aplikacji. Niezalogowani użytkownicy nie mają dostępu do chronionych zasobów.
- **Reset hasła (US-003)**: Użytkownik może zresetować zapomniane hasło poprzez link wysyłany na email.

### 1.2 Założenia techniczne

- **Frontend**: Astro 5 (SSR mode) + React 19 dla komponentów interaktywnych
- **Backend**: Supabase Auth jako usługa autentykacji
- **Sesja**: Zarządzanie sesją poprzez Bearer tokens (zgodnie z obecnym middleware)
  - Token przechowywany w `localStorage` po stronie klienta
  - Wysyłany w nagłówku `Authorization: Bearer {token}` w każdym request
  - Middleware już obsługuje ten mechanizm
- **Walidacja**: Zod dla walidacji danych wejściowych

---

## 2. Architektura Interfejsu Użytkownika

### 2.1 Nowe strony Astro

#### 2.1.1 Strony publiczne (auth)

| Ścieżka            | Plik                              | Opis                                                                |
| ------------------ | --------------------------------- | ------------------------------------------------------------------- |
| `/`                | `src/pages/index.astro`           | Strona powitalna (landing) - przekierowuje zalogowanych do `/decks` |
| `/login`           | `src/pages/login.astro`           | Formularz logowania                                                 |
| `/register`        | `src/pages/register.astro`        | Formularz rejestracji                                               |
| `/forgot-password` | `src/pages/forgot-password.astro` | Formularz żądania resetu hasła                                      |
| `/reset-password`  | `src/pages/reset-password.astro`  | Formularz ustawienia nowego hasła (dostępny z linkiem z maila)      |

#### 2.1.2 Charakterystyka stron auth

- Nie wymagają autoryzacji (publiczne)
- Zalogowany użytkownik (sprawdzany po stronie klienta poprzez localStorage) może być przekierowywany na `/decks`
- Używają dedykowanego layoutu `AuthLayout` (opcjonalnie - można użyć istniejącego `Layout.astro` z ThemeToggle)
- Renderowane server-side (SSR), ale logika autentykacji głównie client-side (Bearer tokens)

### 2.2 Layouty

#### 2.2.1 Nowy layout: `AuthLayout.astro` (opcjonalnie)

**🔵 STATUS: OPCJONALNY - NIE KONIECZNY W MVP**

Lokalizacja: `src/layouts/AuthLayout.astro`

Przeznaczenie: Dedykowany layout dla stron autentykacji, zapewniający spójny wygląd formularzy auth.

**✅ ZALECENIE**: Użyj istniejącego `Layout.astro` z ThemeToggle - strony auth nie wymagają specjalnego layoutu w MVP. Layout jest już gotowy i działa.

Jeśli tworzony, struktura:

```
AuthLayout
├── ThemeToggle (w prawym górnym rogu)
├── Nagłówek z logo aplikacji (opcjonalnie)
├── Kontener centralny z kartą formularza
│   └── <slot /> (zawartość strony)
└── Stopka z linkami pomocniczymi (opcjonalnie)
```

Właściwości:

- `title: string` - tytuł strony
- Centrowanie zawartości w pionie i poziomie
- Responsywny design (mobile-first)
- Obsługa dark mode (przez ThemeToggle)

#### 2.2.2 Modyfikacja istniejącego layoutu: `Layout.astro`

**✅ STATUS: JUŻ ISTNIEJE - gotowy do użycia**

Lokalizacja: `src/layouts/Layout.astro`

Obecne elementy (gotowe):

- ✅ ThemeToggle w fixed position (prawy górny róg)
- ✅ Toaster dla notyfikacji
- ✅ Obsługa dark mode
- ✅ Podstawowy HTML/CSS

⚠️ Rozszerzenia do dodania (opcjonalne dla MVP):

- ❌ Dodanie nagłówka nawigacyjnego dla zalogowanych użytkowników
- ❌ Komponent `NavBar` lub `UserMenu` z przyciskiem wylogowania
- ❌ Client-side sprawdzanie tokena w localStorage i wyświetlanie menu użytkownika

**✅ ZALECENIE minimalne dla MVP**: Dodać osobny komponent `LogoutButton.tsx` w fixed position obok ThemeToggle, który:

- Sprawdza czy token istnieje w localStorage
- Wyświetla przycisk "Wyloguj" tylko dla zalogowanych
- Czyści localStorage i przekierowuje do `/login`

### 2.3 Komponenty React

**❌ STATUS: WSZYSTKIE DO UTWORZENIA**

#### 2.3.1 Formularze autentykacji

| Komponent            | Lokalizacja                                  | Opis                              | Status           |
| -------------------- | -------------------------------------------- | --------------------------------- | ---------------- |
| `LoginForm`          | `src/components/auth/LoginForm.tsx`          | Formularz logowania email + hasło | ❌ Do utworzenia |
| `RegisterForm`       | `src/components/auth/RegisterForm.tsx`       | Formularz rejestracji             | ❌ Do utworzenia |
| `ForgotPasswordForm` | `src/components/auth/ForgotPasswordForm.tsx` | Formularz żądania resetu hasła    | ❌ Do utworzenia |
| `ResetPasswordForm`  | `src/components/auth/ResetPasswordForm.tsx`  | Formularz nowego hasła            | ❌ Do utworzenia |

#### 2.3.2 Komponenty nawigacyjne (opcjonalne dla MVP)

| Komponent      | Lokalizacja                            | Opis                                                  | Status        |
| -------------- | -------------------------------------- | ----------------------------------------------------- | ------------- |
| `NavBar`       | `src/components/auth/NavBar.tsx`       | Pasek nawigacyjny z info o użytkowniku i wylogowaniem | 🔵 Opcjonalny |
| `UserMenu`     | `src/components/auth/UserMenu.tsx`     | Menu użytkownika (dropdown) z opcją wylogowania       | 🔵 Opcjonalny |
| `LogoutButton` | `src/components/auth/LogoutButton.tsx` | Prosty przycisk wylogowania (zalecane dla MVP)        | ⚠️ Zalecany   |

#### 2.3.3 Komponenty współdzielone

**✅ Komponenty UI z shadcn/ui są już dostępne**: Button, Input, Label, Textarea, Dialog

| Komponent       | Lokalizacja                             | Opis                             | Status                                  |
| --------------- | --------------------------------------- | -------------------------------- | --------------------------------------- |
| `AuthCard`      | `src/components/auth/AuthCard.tsx`      | Karta otaczająca formularze auth | 🔵 Opcjonalny (można użyć zwykłego div) |
| `PasswordInput` | `src/components/auth/PasswordInput.tsx` | Input hasła z toggle widoczności | ❌ Do utworzenia                        |
| `FormError`     | `src/components/auth/FormError.tsx`     | Wyświetlanie błędów formularza   | ❌ Do utworzenia                        |
| `FormSuccess`   | `src/components/auth/FormSuccess.tsx`   | Wyświetlanie komunikatów sukcesu | 🔵 Opcjonalny (można użyć toast)        |

### 2.4 Struktura komponentu `LoginForm`

```typescript
interface LoginFormProps {
  redirectTo?: string; // URL do przekierowania po zalogowaniu
}

// Stan wewnętrzny
interface LoginFormState {
  email: string;
  password: string;
  isLoading: boolean;
  error: string | null;
}
```

Funkcjonalności:

- Walidacja client-side (email format, hasło min. 6 znaków)
- Wyświetlanie błędów walidacji przy polach
- Wyświetlanie błędów serwera (np. niepoprawne dane)
- Stan ładowania podczas wysyłania formularza
- Link do rejestracji i resetu hasła
- Po udanym logowaniu:
  - Zapisanie `access_token` do `localStorage` pod kluczem `auth_token`
  - Przekierowanie do `/decks` lub parametru `redirectTo` z URL

### 2.5 Struktura komponentu `RegisterForm`

```typescript
interface RegisterFormProps {
  // brak props
}

interface RegisterFormState {
  email: string;
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}
```

Funkcjonalności:

- Walidacja email (format)
- Walidacja hasła (min. 8 znaków, zawiera cyfrę i literę)
- Potwierdzenie hasła (zgodność)
- Komunikat o wysłaniu emaila weryfikacyjnego (jeśli włączone w Supabase)
- Link do logowania

### 2.6 Struktura komponentu `ForgotPasswordForm`

```typescript
interface ForgotPasswordFormState {
  email: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}
```

Funkcjonalności:

- Wprowadzenie emaila
- Komunikat o wysłaniu linku resetującego
- Link powrotu do logowania

### 2.7 Struktura komponentu `ResetPasswordForm`

```typescript
interface ResetPasswordFormProps {
  accessToken: string; // token z URL (z Supabase)
}

interface ResetPasswordFormState {
  password: string;
  confirmPassword: string;
  isLoading: boolean;
  error: string | null;
  success: boolean;
}
```

Funkcjonalności:

- Wprowadzenie nowego hasła
- Potwierdzenie hasła
- Walidacja siły hasła
- Przekierowanie do logowania po sukcesie

### 2.8 Walidacja i komunikaty błędów

#### 2.8.1 Walidacja client-side

| Pole                | Reguły walidacji                                |
| ------------------- | ----------------------------------------------- |
| Email               | Wymagane, format email                          |
| Hasło (logowanie)   | Wymagane, min. 6 znaków                         |
| Hasło (rejestracja) | Wymagane, min. 8 znaków, zawiera cyfrę i literę |
| Potwierdzenie hasła | Musi być identyczne z hasłem                    |

#### 2.8.2 Komunikaty błędów

| Scenariusz               | Komunikat                                       |
| ------------------------ | ----------------------------------------------- |
| Niepoprawny format email | "Wprowadź poprawny adres email"                 |
| Hasło za krótkie         | "Hasło musi mieć co najmniej X znaków"          |
| Hasła niezgodne          | "Hasła muszą być identyczne"                    |
| Błędne dane logowania    | "Niepoprawny email lub hasło"                   |
| Email już zarejestrowany | "Konto z tym adresem email już istnieje"        |
| Nieznany błąd            | "Wystąpił błąd. Spróbuj ponownie."              |
| Sesja wygasła            | "Sesja wygasła. Zaloguj się ponownie."          |
| Link resetu wygasł       | "Link resetowania hasła wygasł. Poproś o nowy." |

### 2.9 Scenariusze użytkownika

#### 2.9.1 Rejestracja (US-001)

1. Użytkownik wchodzi na `/register`
2. Wypełnia formularz (email, hasło, potwierdzenie hasła)
3. Walidacja client-side sprawdza poprawność danych
4. Wysłanie formularza do API
5. Sukces: komunikat o utworzeniu konta, przekierowanie do `/login`
6. Błąd: wyświetlenie komunikatu błędu

#### 2.9.2 Logowanie (US-002)

1. Użytkownik wchodzi na `/login`
2. Wypełnia formularz (email, hasło)
3. Walidacja client-side
4. Wysłanie formularza do API
5. Sukces: ustawienie sesji, przekierowanie do `/decks`
6. Błąd: wyświetlenie komunikatu błędu

#### 2.9.3 Dostęp niezalogowanego użytkownika

1. Użytkownik próbuje wejść na chronioną stronę (np. `/decks`)
2. Middleware sprawdza brak sesji
3. Przekierowanie na `/login?redirectTo=/decks`
4. Po zalogowaniu: powrót do żądanej strony

#### 2.9.4 Reset hasła (US-003)

1. Użytkownik wchodzi na `/forgot-password`
2. Wprowadza email
3. Wysłanie żądania do API
4. Komunikat: "Jeśli konto istnieje, wysłaliśmy link resetujący"
5. Użytkownik klika link w emailu
6. Przekierowanie na `/reset-password?access_token=...`
7. Użytkownik wprowadza nowe hasło
8. Sukces: przekierowanie do `/login` z komunikatem

#### 2.9.5 Wylogowanie

1. Użytkownik klika przycisk "Wyloguj" (w NavBar/UserMenu lub osobny komponent)
2. Client-side wywołanie API wylogowania (opcjonalne) lub bezpośrednie czyszczenie localStorage
3. Usunięcie tokena z `localStorage` (`localStorage.removeItem('auth_token')`)
4. Przekierowanie na `/login`

---

## 3. Logika Backendowa

**❌ STATUS: WSZYSTKIE ENDPOINTY DO UTWORZENIA**

### 3.1 Endpointy API

#### 3.1.1 Rejestracja

**❌ STATUS: DO UTWORZENIA**

```
POST /api/v1/auth/register
```

Plik: `src/pages/api/v1/auth/register.ts`

Request body:

```typescript
interface RegisterRequestBody {
  email: string;
  password: string;
}
```

Response (201 Created):

```typescript
interface RegisterResponse {
  user: {
    id: string;
    email: string;
  };
  message: string;
}
```

Błędy:

- 400 Bad Request - błąd walidacji
- 409 Conflict - email już istnieje
- 500 Internal Server Error

#### 3.1.2 Logowanie

**❌ STATUS: DO UTWORZENIA**

```
POST /api/v1/auth/login
```

Plik: `src/pages/api/v1/auth/login.ts`

Request body:

```typescript
interface LoginRequestBody {
  email: string;
  password: string;
}
```

Response (200 OK):

```typescript
interface LoginResponse {
  user: {
    id: string;
    email: string;
  };
  access_token: string;
  refresh_token: string;
  expires_in: number;
}
```

Uwagi:

- Zwraca tokeny w response body (nie w cookies)
- Client zapisuje `access_token` do `localStorage`

Błędy:

- 400 Bad Request - błąd walidacji
- 401 Unauthorized - niepoprawne dane logowania
- 500 Internal Server Error

#### 3.1.3 Wylogowanie (opcjonalnie)

```
POST /api/v1/auth/logout
```

**Uwaga**: Ten endpoint jest opcjonalny w MVP. Wylogowanie może być obsłużone client-side przez usunięcie tokena z `localStorage`.

Jeśli implementowany:

Headers:

- Authorization: Bearer {access_token}

Response (200 OK):

```typescript
interface LogoutResponse {
  message: string;
}
```

Side effects:

- Invalidacja tokena w Supabase (opcjonalnie)

#### 3.1.4 Żądanie resetu hasła

**❌ STATUS: DO UTWORZENIA**

```
POST /api/v1/auth/forgot-password
```

Plik: `src/pages/api/v1/auth/forgot-password.ts`

Request body:

```typescript
interface ForgotPasswordRequestBody {
  email: string;
}
```

Response (200 OK):

```typescript
interface ForgotPasswordResponse {
  message: string;
}
```

Uwagi:

- Zawsze zwraca 200, nawet jeśli email nie istnieje (bezpieczeństwo)

#### 3.1.5 Reset hasła

**❌ STATUS: DO UTWORZENIA**

```
POST /api/v1/auth/reset-password
```

Plik: `src/pages/api/v1/auth/reset-password.ts`

Request body:

```typescript
interface ResetPasswordRequestBody {
  password: string;
}
```

Headers:

- Authorization: Bearer {access_token}

Response (200 OK):

```typescript
interface ResetPasswordResponse {
  message: string;
}
```

Błędy:

- 400 Bad Request - błąd walidacji
- 401 Unauthorized - token nieważny lub wygasły
- 500 Internal Server Error

#### 3.1.6 Pobranie aktualnego użytkownika (opcjonalnie)

```
GET /api/v1/auth/me
```

**Uwaga**: Ten endpoint może być zbędny w MVP, ponieważ middleware już ustawia `context.locals.user` na podstawie tokena. Jeśli client potrzebuje potwierdzić ważność tokena, można użyć istniejącego `GET /api/v1/profile`.

Jeśli implementowany:

Headers:

- Authorization: Bearer {access_token}

Response (200 OK):

```typescript
interface MeResponse {
  user: {
    id: string;
    email: string;
  } | null;
}
```

Błędy:

- 401 Unauthorized - token nieważny lub wygasły

### 3.2 Schematy walidacji (Zod)

**❌ STATUS: DO UTWORZENIA**

Lokalizacja: `src/lib/schemas/auth.schemas.ts`

```typescript
import { z } from "zod";

export const emailSchema = z.string().trim().min(1, "Email jest wymagany").email("Wprowadź poprawny adres email");

export const passwordSchema = z
  .string()
  .min(8, "Hasło musi mieć co najmniej 8 znaków")
  .regex(/[A-Za-z]/, "Hasło musi zawierać co najmniej jedną literę")
  .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę");

export const loginPasswordSchema = z.string().min(1, "Hasło jest wymagane");

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  email: emailSchema,
  password: loginPasswordSchema,
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  password: passwordSchema,
});
```

### 3.3 Serwis autentykacji

**❌ STATUS: DO UTWORZENIA**

Lokalizacja: `src/lib/services/auth.service.ts`

```typescript
interface AuthService {
  /**
   * Rejestracja nowego użytkownika
   * Tworzy konto w Supabase Auth i profil w tabeli profiles
   */
  register(supabase: SupabaseClient, email: string, password: string): Promise<{ user: User }>;

  /**
   * Logowanie użytkownika
   * Zwraca sesję do ustawienia w cookies
   */
  login(supabase: SupabaseClient, email: string, password: string): Promise<{ user: User; session: Session }>;

  /**
   * Wylogowanie użytkownika
   */
  logout(supabase: SupabaseClient): Promise<void>;

  /**
   * Wysłanie emaila z linkiem do resetu hasła
   */
  sendPasswordResetEmail(supabase: SupabaseClient, email: string, redirectTo: string): Promise<void>;

  /**
   * Ustawienie nowego hasła
   */
  resetPassword(supabase: SupabaseClient, newPassword: string): Promise<void>;

  /**
   * Pobranie aktualnie zalogowanego użytkownika
   */
  getCurrentUser(supabase: SupabaseClient): Promise<User | null>;
}
```

### 3.4 Obsługa wyjątków

**❌ STATUS: DO UTWORZENIA**

#### 3.4.1 Klasy błędów

Lokalizacja: `src/lib/errors/auth.errors.ts`

```typescript
export class AuthError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message);
    this.name = "AuthError";
  }
}

export class InvalidCredentialsError extends AuthError {
  constructor() {
    super("Niepoprawny email lub hasło", 401, "INVALID_CREDENTIALS");
  }
}

export class EmailAlreadyExistsError extends AuthError {
  constructor() {
    super("Konto z tym adresem email już istnieje", 409, "EMAIL_EXISTS");
  }
}

export class SessionExpiredError extends AuthError {
  constructor() {
    super("Sesja wygasła. Zaloguj się ponownie.", 401, "SESSION_EXPIRED");
  }
}

export class InvalidTokenError extends AuthError {
  constructor() {
    super("Link resetowania hasła jest nieważny lub wygasł", 401, "INVALID_TOKEN");
  }
}
```

#### 3.4.2 Mapowanie błędów Supabase

```typescript
function mapSupabaseAuthError(error: AuthError): AuthError {
  switch (error.message) {
    case "Invalid login credentials":
      return new InvalidCredentialsError();
    case "User already registered":
      return new EmailAlreadyExistsError();
    // ... inne mapowania
    default:
      return new AuthError("Wystąpił błąd", 500, "UNKNOWN_ERROR");
  }
}
```

### 3.5 Modyfikacja middleware

**✅ STATUS: JUŻ ZAIMPLEMENTOWANE - bez zmian lub minimalne modyfikacje**

Lokalizacja: `src/middleware/index.ts`

**Obecny stan**: Middleware już obsługuje Bearer tokens z nagłówka `Authorization`. Działa zgodnie z założeniami spec.

**✅ Co już działa**:

- Wyciąganie tokena z nagłówka `Authorization: Bearer {token}`
- Weryfikacja tokena przez `supabase.auth.getUser()`
- Ustawienie `context.locals.user` i `context.locals.supabase`
- Obsługa anonimowego klienta gdy brak tokena

Rozszerzenie obecnego middleware o:

1. **Ochrona ścieżek** (opcjonalnie):
   - Lista ścieżek publicznych (auth pages, API auth)
   - Przekierowanie niezalogowanych na `/login` dla chronionych stron

**Uwaga**: Ochrona ścieżek może być zaimplementowana na poziomie poszczególnych stron (guard clause) zamiast w middleware, dla większej elastyczności.

2. **Logika ochrony na poziomie strony** (preferowane dla MVP):

```typescript
// src/pages/decks.astro
---
import Layout from "../layouts/Layout.astro";

// Guard: sprawdzenie czy użytkownik jest zalogowany
if (!Astro.locals.user) {
  const pathname = new URL(Astro.request.url).pathname;
  return Astro.redirect(`/login?redirectTo=${encodeURIComponent(pathname)}`);
}
---
```

3. **Opcjonalnie: Rozszerzenie middleware o ochronę ścieżek**:

```typescript
const PUBLIC_PATHS = ["/", "/login", "/register", "/forgot-password", "/reset-password"];

export const onRequest = defineMiddleware(async (context, next) => {
  const pathname = new URL(context.request.url).pathname;

  // Obecna logika (Bearer tokens) - bez zmian
  const authHeader = context.request.headers.get("Authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.substring(7) : null;

  if (token) {
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    context.locals.supabase = supabase;
    context.locals.user = user ? { id: user.id } : null;
  } else {
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);
    context.locals.supabase = supabase;
    context.locals.user = null;
  }

  // Nowa logika: ochrona ścieżek
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isApiPath = pathname.startsWith("/api/");

  // Niezalogowany na chronionej ścieżce (nie-API)
  if (!context.locals.user && !isPublicPath && !isApiPath) {
    return context.redirect(`/login?redirectTo=${encodeURIComponent(pathname)}`);
  }

  return next();
});
```

### 3.6 Aktualizacja typów `env.d.ts`

```typescript
interface Locals {
  supabase: SupabaseClient<Database>;
  user: { id: string; email: string } | null;
}
```

---

## 4. System Autentykacji Supabase

**⚠️ STATUS: WYMAGA KONFIGURACJI w panelu Supabase**

### 4.1 Konfiguracja Supabase Auth

#### 4.1.1 Ustawienia w panelu Supabase

- **Email confirmations**: Wyłączone dla MVP (opcjonalnie włączyć później)
- **Secure email change**: Włączone
- **Password min length**: 8 znaków
- **Site URL**: URL produkcyjny aplikacji
- **Redirect URLs**: Lista dozwolonych URL do przekierowań

#### 4.1.2 Email templates

Konfiguracja szablonów emaili w Supabase:

- Reset password email - dostosowany szablon z linkiem do `/reset-password`

### 4.2 Integracja z istniejącym Supabase Client

**✅ STATUS: JUŻ ZAIMPLEMENTOWANE - gotowe do użycia**

#### 4.2.1 Brak nowych zależności

✅ Projekt już ma `@supabase/supabase-js` zainstalowane. Nie jest potrzebne `@supabase/ssr` przy podejściu Bearer tokens.

#### 4.2.2 Wykorzystanie istniejącego klienta

**✅ Lokalizacja**: `src/db/supabase.client.ts` - już istnieje

Istniejący plik już eksportuje `supabaseClient` który może być używany w:

- ✅ API endpoints (server-side)
- ✅ Komponentach React (client-side) - jeśli potrzebne

**✅ ZALECENIE**: W API endpoints używaj klienta z `context.locals.supabase` (który jest już skonfigurowany w middleware z tokenem użytkownika).

### 4.3 Flow autentykacji

#### 4.3.1 Rejestracja

```
Client                    API                     Supabase Auth
  |                        |                           |
  |-- POST /register ----->|                           |
  |                        |-- signUp() -------------->|
  |                        |                           |
  |                        |<-- User + (Session) -----|
  |                        |                           |
  |                        |-- INSERT profiles ------->| (Supabase DB)
  |                        |                           |
  |<-- 201 Created --------|                           |
```

#### 4.3.2 Logowanie

```
Client                    API                     Supabase Auth
  |                        |                           |
  |-- POST /login -------->|                           |
  |                        |-- signInWithPassword() -->|
  |                        |                           |
  |                        |<-- Session + User --------|
  |                        |                           |
  |<-- 200 OK + Tokens ----|                           |
  |                        |                           |
  |-- Save to localStorage |                           |
```

#### 4.3.3 Reset hasła

```
Client                    API                     Supabase Auth
  |                        |                           |
  |-- POST /forgot ------->|                           |
  |                        |-- resetPasswordForEmail ->|
  |                        |                           |
  |                        |<-- OK -------------------|
  |<-- 200 OK -------------|                           |
  |                        |                           |
  |     [User clicks email link]                       |
  |                        |                           |
  |-- GET /reset-password?access_token=... ----------->|
  |                        |                           |
  |-- POST /reset-password (with token) -------------->|
  |                        |-- updateUser() ---------->|
  |                        |<-- OK -------------------|
  |<-- 200 OK -------------|                           |
```

### 4.4 Zarządzanie sesją

#### 4.4.1 localStorage

Tokeny są przechowywane w `localStorage`:

- `auth_token` - JWT access token (wysyłany w nagłówku Authorization)
- `auth_refresh_token` - token do odświeżania sesji (opcjonalnie)

#### 4.4.2 Odświeżanie sesji

W MVP: brak automatycznego odświeżania. Użytkownik musi się ponownie zalogować po wygaśnięciu tokena.

Opcjonalnie w przyszłości: implementacja automatycznego odświeżania przed wygaśnięciem tokena.

#### 4.4.3 Wylogowanie

```typescript
// Client-side
localStorage.removeItem("auth_token");
localStorage.removeItem("auth_refresh_token");
window.location.href = "/login";
```

Opcjonalnie: wywołanie API endpoint do invalidacji tokena w Supabase:

```typescript
await supabase.auth.signOut();
```

---

## 5. Podsumowanie struktury plików

### 5.1 Nowe pliki

```
src/
├── pages/
│   ├── login.astro
│   ├── register.astro
│   ├── forgot-password.astro
│   └── reset-password.astro
├── layouts/
│   └── AuthLayout.astro
├── components/
│   └── auth/
│       ├── LoginForm.tsx
│       ├── RegisterForm.tsx
│       ├── ForgotPasswordForm.tsx
│       ├── ResetPasswordForm.tsx
│       ├── NavBar.tsx
│       ├── UserMenu.tsx
│       ├── AuthCard.tsx
│       ├── PasswordInput.tsx
│       ├── FormError.tsx
│       ├── FormSuccess.tsx
│       └── hooks/
│           ├── useLoginForm.ts
│           ├── useRegisterForm.ts
│           ├── useForgotPasswordForm.ts
│           └── useResetPasswordForm.ts
├── pages/
│   └── api/
│       └── v1/
│           └── auth/
│               ├── register.ts
│               ├── login.ts
│               ├── logout.ts
│               ├── forgot-password.ts
│               ├── reset-password.ts
│               └── me.ts
├── lib/
│   ├── schemas/
│   │   └── auth.schemas.ts
│   ├── services/
│   │   └── auth.service.ts
│   └── errors/
│       └── auth.errors.ts
└── db/
    └── supabase.server.ts
```

### 5.2 Pliki do modyfikacji

| Plik                       | Zmiany                                    |
| -------------------------- | ----------------------------------------- |
| `src/middleware/index.ts`  | Zarządzanie sesją cookie, ochrona ścieżek |
| `src/layouts/Layout.astro` | Dodanie NavBar dla zalogowanych           |
| `src/env.d.ts`             | Rozszerzenie typu `Locals.user` o email   |
| `src/types.ts`             | Dodanie typów DTO dla auth                |

---

## 6. Zależności do zainstalowania

**Brak nowych zależności**.

Projekt już ma wszystkie wymagane pakiety:

- `@supabase/supabase-js` - już zainstalowany
- `zod` - już używany w projekcie
- `react` - już zainstalowany

Wszystkie komponenty UI mogą wykorzystywać istniejące komponenty z `shadcn/ui`.

---

## 7. Zgodność z istniejącą aplikacją

**✅ STATUS: Architektura kompatybilna**

### 7.1 Zachowane elementy

**✅ Bez zmian**:

- ✅ Istniejące API endpointy (`/api/v1/decks/*`, `/api/v1/cards/*`, etc.) działają bez zmian
- ✅ Obecna autoryzacja przez `context.locals.user` pozostaje kompatybilna
- ✅ Komponenty React (DecksPage, DeckDetailView, etc.) nie wymagają modyfikacji
- ✅ Middleware działa zgodnie z założeniami

### 7.2 Migracja i trigger dla profiles

#### 7.2.1 Trigger automatycznego tworzenia profilu

**WAŻNE**: Należy utworzyć trigger w bazie danych Supabase, który automatycznie tworzy rekord w `profiles` po rejestracji użytkownika.

SQL do wykonania w Supabase SQL Editor:

```sql
-- Funkcja trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, ai_generation_count, ai_generation_date)
  VALUES (
    NEW.id,
    0,
    NULL
  );
  RETURN NEW;
END;
$$;

-- Trigger na tabeli auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

Alternatywnie: logika tworzenia profilu może być w endpoincie `/api/v1/auth/register` zamiast triggera.

#### 7.2.2 Migracja istniejących danych

- Po wdrożeniu modułu auth, użytkownicy będą musieli się zalogować
- Istniejące dane testowe przypisane do user_id będą dostępne po zalogowaniu odpowiednim użytkownikiem
- Jeśli istnieją użytkownicy w `auth.users` bez profilu, należy ręcznie utworzyć rekordy w `profiles`

---

## 8. PODSUMOWANIE IMPLEMENTACJI

### 8.1 Priorytet 1: Kluczowe elementy (MVP)

**Muszą być zaimplementowane**:

1. ❌ **API Endpoints** (4 pliki):
   - `POST /api/v1/auth/register`
   - `POST /api/v1/auth/login`
   - `POST /api/v1/auth/forgot-password`
   - `POST /api/v1/auth/reset-password`

2. ❌ **Strony auth** (4 pliki):
   - `/login.astro`
   - `/register.astro`
   - `/forgot-password.astro`
   - `/reset-password.astro`

3. ❌ **Formularze React** (4 komponenty):
   - `LoginForm.tsx`
   - `RegisterForm.tsx`
   - `ForgotPasswordForm.tsx`
   - `ResetPasswordForm.tsx`

4. ❌ **Pomocnicze komponenty** (3 komponenty):
   - `PasswordInput.tsx` (input z toggle widoczności)
   - `FormError.tsx` (wyświetlanie błędów)
   - `LogoutButton.tsx` (opcjonalnie - można później)

5. ❌ **Logika biznesowa** (3 pliki):
   - `src/lib/services/auth.service.ts`
   - `src/lib/schemas/auth.schemas.ts` (walidacja Zod)
   - `src/lib/errors/auth.errors.ts`

6. ⚠️ **Ochrona stron** (4 modyfikacje):
   - Guard clauses w: `decks.astro`, `decks/[deckId].astro`, `ai-generate.astro`, `review.astro`

7. ⚠️ **Strona główna** (1 modyfikacja):
   - Aktualizacja `index.astro` - przekierowanie zalogowanych do `/decks`

8. ❌ **Trigger SQL** (Supabase):
   - Trigger automatycznego tworzenia profilu

9. ⚠️ **Konfiguracja Supabase**:
   - Ustawienia Auth w panelu
   - Email templates (reset password)

### 8.2 Priorytet 2: Opcjonalne dla MVP

**Można pominąć lub zrobić później**:

1. 🔵 `AuthLayout.astro` - użyj istniejącego `Layout.astro`
2. 🔵 `NavBar.tsx` / `UserMenu.tsx` - wystarczy prosty `LogoutButton`
3. 🔵 `AuthCard.tsx` - można użyć zwykłego div
4. 🔵 `FormSuccess.tsx` - można użyć toast
5. 🔵 `POST /api/v1/auth/logout` - wylogowanie może być client-side
6. 🔵 `GET /api/v1/auth/me` - można użyć `GET /api/v1/profile`
7. 🔵 Middleware route protection - można użyć guard clauses

### 8.3 Co już jest gotowe

**✅ Nie wymaga implementacji**:

1. ✅ Middleware - obsługa Bearer tokens
2. ✅ Layout - podstawowy z ThemeToggle
3. ✅ Komponenty UI - Button, Input, Label, Textarea, Dialog
4. ✅ Supabase Client - skonfigurowany i gotowy
5. ✅ Database types - wygenerowane

### 8.4 Szacowany zakres pracy

**Pliki do utworzenia**: ~15-20 nowych plików
**Pliki do modyfikacji**: ~5 istniejących plików
**Konfiguracja zewnętrzna**: Supabase (panel + SQL trigger)

**Kolejność implementacji** (zalecana):

**Faza 1: Backend** (fundament)

1. Schematy walidacji (`auth.schemas.ts`)
2. Klasy błędów (`auth.errors.ts`)
3. Serwis auth (`auth.service.ts`)
4. API endpoints (register, login, forgot-password, reset-password)

**Faza 2: Frontend** (UI) 5. Pomocnicze komponenty (PasswordInput, FormError) 6. Formularze (LoginForm, RegisterForm, ForgotPasswordForm, ResetPasswordForm) 7. Strony auth (login, register, forgot-password, reset-password)

**Faza 3: Integracja** (połączenie) 8. Guard clauses na chronionych stronach 9. Aktualizacja strony głównej 10. LogoutButton (opcjonalnie)

**Faza 4: Konfiguracja** (Supabase) 11. Trigger SQL 12. Ustawienia Auth w panelu 13. Email templates

**Faza 5: Testowanie** 14. Testy manualne flow'ów 15. Walidacja US-001, US-002, US-003
