# Diagram przepływu autentykacji

Ten dokument przedstawia kompleksowy diagram sekwencji autentykacji dla modułu
logowania i rejestracji w aplikacji 10x-cards.

## Aktorzy

- **Przeglądarka** - Frontend React/Astro (formularze, localStorage)
- **Middleware** - Astro middleware weryfikujące tokeny
- **Astro API** - Endpointy API (`/api/v1/auth/*`)
- **Supabase Auth** - Zewnętrzny serwis autentykacji

## 1. Przepływ rejestracji

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Przegladarka
    participant API as Astro API
    participant Auth as Supabase Auth

    Browser->>Browser: Wypelnienie formularza rejestracji
    Browser->>Browser: Walidacja client-side
    Browser->>API: POST /api/v1/auth/register
    activate API
    API->>API: Walidacja Zod schema

    alt Walidacja nieudana
        API-->>Browser: 400 VALIDATION_ERROR
    else Walidacja udana
        API->>Auth: signUp email password
        activate Auth
        Auth-->>API: user + session
        deactivate Auth
        API-->>Browser: 200 tokeny
        deactivate API
        Browser->>Browser: Zapis tokenow do localStorage
        Browser->>Browser: Przekierowanie na /decks
    end
```

## 2. Przepływ logowania

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Przegladarka
    participant API as Astro API
    participant Auth as Supabase Auth

    Browser->>Browser: Wypelnienie formularza logowania
    Browser->>API: POST /api/v1/auth/login
    API->>API: Walidacja Zod schema
    API->>Auth: signInWithPassword
    Auth-->>API: user + session lub blad
    API-->>Browser: 200 tokeny lub 401 INVALID_CREDENTIALS
    Browser->>Browser: Zapis tokenow lub wyswietl blad
    Browser->>Browser: Przekierowanie na /decks lub pozostan
```

## 3. Żądanie API z autoryzacją

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Przegladarka
    participant MW as Middleware
    participant API as Astro API
    participant Auth as Supabase Auth

    Browser->>Browser: Pobranie tokenu z localStorage
    Browser->>MW: GET /api/v1/decks z Bearer token
    MW->>Auth: getUser token
    Auth-->>MW: user data lub null
    MW->>MW: Ustaw context.locals.user
    MW->>API: Przekaz request
    API-->>Browser: 200 data lub 401 UNAUTHORIZED
    Note over Browser: Jesli 401 - rozpocznij auto-refresh
```

## 4. Odświeżanie tokenu

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Przegladarka
    participant API as Astro API
    participant Auth as Supabase Auth

    Browser->>Browser: Otrzymano 401 pobierz refresh_token
    Browser->>API: POST /api/v1/auth/refresh
    API->>Auth: refreshSession refresh_token
    Auth-->>API: new session lub blad
    API-->>Browser: 200 nowe tokeny lub 401 SESSION_EXPIRED
    Browser->>Browser: Zapis nowych tokenow lub przekierowanie na /login
```

## 4a. Odświeżanie tokenu - pełny przepływ z retry

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Przegladarka
    participant MW as Middleware
    participant API as Astro API
    participant Auth as Supabase Auth

    Note over Browser: Otrzymano 401 na poprzednim uadaniu
    Browser->>API: POST /api/v1/auth/refresh
    API->>Auth: refreshSession
    Auth-->>API: new session
    API-->>Browser: 200 nowe tokeny
    Browser->>Browser: Zapis nowych tokenow
    Browser->>MW: Ponow oryginalne zadanie
    MW->>Auth: getUser new_token
    Auth-->>MW: user data
    MW->>API: Przekaz request
    API-->>Browser: 200 data
```

## 5. Reset hasła - żądanie linku

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Przegladarka
    participant API as Astro API
    participant Auth as Supabase Auth

    Note over Browser: Uzytkownik na /forgot-password
    Browser->>API: POST /api/v1/auth/forgot-password
    API->>Auth: resetPasswordForEmail
    Auth-->>API: OK email wyslany
    API-->>Browser: 200 sukces
    Note over Browser: Uzytkownik otrzymuje email z linkiem
```

## 5a. Reset hasła - ustawienie nowego hasła

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Przegladarka
    participant API as Astro API
    participant Auth as Supabase Auth

    Note over Browser: Uzytkownik klika link w emailu
    Browser->>Browser: Odczytaj token z URL
    Browser->>Browser: Wprowadz nowe haslo
    Browser->>API: POST /api/v1/auth/reset-password z Bearer token
    API->>API: Walidacja hasla
    API->>Auth: updateUser password
    Auth-->>API: OK
    API-->>Browser: 200 success
    Browser->>Browser: Przekierowanie na /login
```

## 6. Wylogowanie

```mermaid
sequenceDiagram
    autonumber
    participant Browser as Przegladarka
    participant API as Astro API
    participant Auth as Supabase Auth

    Browser->>Browser: Klikniecie Wyloguj
    Browser->>API: POST /api/v1/auth/logout
    activate API
    API->>Auth: signOut
    activate Auth
    Auth-->>API: OK
    deactivate Auth
    API->>API: Usun cookies
    API-->>Browser: 200 success
    deactivate API
    Browser->>Browser: Usun tokeny z localStorage
    Browser->>Browser: Przekierowanie na /login
```

## 7. Diagram ogólny - cykl życia sesji

```mermaid
sequenceDiagram
    autonumber
    participant U as Uzytkownik
    participant B as Przegladarka
    participant S as Serwer

    U->>B: Otwarcie aplikacji
    B->>B: Sprawdz localStorage

    alt Brak tokenu
        B->>U: Pokaz strone logowania
        U->>B: Wprowadz dane
        B->>S: POST /login
        S-->>B: Tokeny
        B->>B: Zapisz w localStorage
        B->>U: Przekieruj na /decks
    else Token istnieje
        B->>S: Zadanie z tokenem
        S-->>B: Dane lub 401
        B->>U: Pokaz dane lub odswierz token
    end
```

## Podsumowanie mechanizmów

### Przechowywanie tokenów

- **localStorage.auth_token** - access token (JWT) do autoryzacji żądań API
- **localStorage.auth_refresh_token** - refresh token do odświeżania sesji

### Ochrona ścieżek

- **Ścieżki publiczne** (bez autoryzacji):
  - `/`, `/login`, `/register`, `/forgot-password`, `/reset-password`
  - `/api/v1/auth/*` (endpointy autentykacji)
- **Ścieżki chronione**:
  - `/api/v1/*` (wszystkie pozostałe endpointy API)

### Walidacja

- **Client-side**: podstawowa walidacja formularzy (email, hasło)
- **Server-side**: pełna walidacja Zod schemas

### Obsługa błędów

- `400 VALIDATION_ERROR` - błędy walidacji danych wejściowych
- `401 INVALID_CREDENTIALS` - niepoprawne dane logowania
- `401 UNAUTHORIZED` - brak lub nieważny token
- `401 SESSION_EXPIRED` - wygasła sesja
- `401 INVALID_TOKEN` - nieprawidłowy token resetu hasła
- `409 EMAIL_EXISTS` - email już zarejestrowany
