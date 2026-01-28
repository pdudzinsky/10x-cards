# Architektura UI - Moduł Logowania i Rejestracji

## Diagram architektury

<mermaid_diagram>

```mermaid
flowchart TD
    subgraph "Punkt wejscia"
        INDEX["index.astro"]
    end

    subgraph "Layout"
        LAYOUT["Layout.astro"]
        THEME["ThemeToggle"]
        LOGOUT["LogoutButton"]
        TOASTER["Toaster"]
    end

    subgraph "Strony Astro - Autentykacja"
        LOGIN_PAGE["login.astro"]
        REGISTER_PAGE["register.astro"]
        FORGOT_PAGE["forgot-password.astro"]
        RESET_PAGE["reset-password.astro"]
    end

    subgraph "Komponenty React - Formularze"
        LOGIN_FORM["LoginForm"]
        REGISTER_FORM["RegisterForm"]
        FORGOT_FORM["ForgotPasswordForm"]
        RESET_FORM["ResetPasswordForm"]
    end

    subgraph "Komponenty wspoldzielone"
        PWD_INPUT["PasswordInput"]
        FORM_ERROR["FormError"]
    end

    subgraph "Komponenty UI Shadcn"
        BUTTON["Button"]
        INPUT["Input"]
        LABEL["Label"]
    end

    subgraph "Endpointy API"
        API_LOGIN["POST /api/v1/auth/login"]
        API_REGISTER["POST /api/v1/auth/register"]
        API_FORGOT["POST /api/v1/auth/forgot-password"]
        API_RESET["POST /api/v1/auth/reset-password"]
        API_LOGOUT["POST /api/v1/auth/logout"]
    end

    subgraph "Stan aplikacji"
        STORAGE["localStorage: auth_token, auth_refresh_token"]
    end

    subgraph "Strona chroniona"
        DECKS["/decks - Lista talii"]
    end

    %% Punkt wejscia
    INDEX -->|"przekierowanie"| DECKS

    %% Layout zawiera
    LAYOUT --> THEME
    LAYOUT -->|"showLogout=true"| LOGOUT
    LAYOUT --> TOASTER

    %% Strony uzywaja Layout
    LOGIN_PAGE --> LAYOUT
    REGISTER_PAGE --> LAYOUT
    FORGOT_PAGE --> LAYOUT
    RESET_PAGE --> LAYOUT

    %% Strony renderuja formularze
    LOGIN_PAGE -->|"client:load"| LOGIN_FORM
    REGISTER_PAGE -->|"client:load"| REGISTER_FORM
    FORGOT_PAGE -->|"client:load"| FORGOT_FORM
    RESET_PAGE -->|"client:load + accessToken"| RESET_FORM

    %% Formularze uzywaja komponentow wspoldzielonych
    LOGIN_FORM --> PWD_INPUT
    LOGIN_FORM --> FORM_ERROR
    REGISTER_FORM --> PWD_INPUT
    REGISTER_FORM --> FORM_ERROR
    FORGOT_FORM --> FORM_ERROR
    RESET_FORM --> PWD_INPUT
    RESET_FORM --> FORM_ERROR

    %% Komponenty wspoldzielone uzywaja UI
    PWD_INPUT --> INPUT
    PWD_INPUT --> BUTTON
    FORM_ERROR -.-> LABEL
    LOGIN_FORM --> BUTTON
    LOGIN_FORM --> INPUT
    LOGIN_FORM --> LABEL
    REGISTER_FORM --> BUTTON
    REGISTER_FORM --> INPUT
    REGISTER_FORM --> LABEL
    FORGOT_FORM --> BUTTON
    FORGOT_FORM --> INPUT
    FORGOT_FORM --> LABEL
    RESET_FORM --> BUTTON
    RESET_FORM --> LABEL
    LOGOUT --> BUTTON

    %% Komunikacja z API
    LOGIN_FORM -->|"POST email, haslo"| API_LOGIN
    REGISTER_FORM -->|"POST email, haslo"| API_REGISTER
    FORGOT_FORM -->|"POST email"| API_FORGOT
    RESET_FORM -->|"POST haslo + Bearer token"| API_RESET
    LOGOUT -->|"POST"| API_LOGOUT

    %% Zarzadzanie stanem
    API_LOGIN -->|"access_token, refresh_token"| STORAGE
    API_REGISTER -->|"tokeny gdy auto-confirm"| STORAGE
    API_LOGOUT -->|"usuniecie tokenow"| STORAGE
    STORAGE -->|"sprawdzenie tokenu"| LOGIN_FORM
    STORAGE -->|"sprawdzenie tokenu"| REGISTER_FORM
    STORAGE -->|"sprawdzenie tokenu"| FORGOT_FORM
    STORAGE -->|"sprawdzenie tokenu"| RESET_FORM
    STORAGE -->|"sprawdzenie tokenu"| LOGOUT

    %% Stylizacja
    classDef astroPage fill:#f9d71c,stroke:#333,stroke-width:2px;
    classDef reactComponent fill:#61dafb,stroke:#333,stroke-width:2px;
    classDef sharedComponent fill:#9b59b6,stroke:#333,stroke-width:2px;
    classDef uiComponent fill:#2ecc71,stroke:#333,stroke-width:2px;
    classDef apiEndpoint fill:#e74c3c,stroke:#333,stroke-width:2px;
    classDef storage fill:#3498db,stroke:#333,stroke-width:2px;
    classDef protected fill:#27ae60,stroke:#333,stroke-width:2px;

    class INDEX,LOGIN_PAGE,REGISTER_PAGE,FORGOT_PAGE,RESET_PAGE,LAYOUT astroPage;
    class LOGIN_FORM,REGISTER_FORM,FORGOT_FORM,RESET_FORM,LOGOUT,THEME,TOASTER reactComponent;
    class PWD_INPUT,FORM_ERROR sharedComponent;
    class BUTTON,INPUT,LABEL uiComponent;
    class API_LOGIN,API_REGISTER,API_FORGOT,API_RESET,API_LOGOUT apiEndpoint;
    class STORAGE storage;
    class DECKS protected;
```

</mermaid_diagram>

---

## Diagram nawigacji i przeplywo uzytkownika

<mermaid_diagram>

```mermaid
flowchart TD
    subgraph "Przeplywy autentykacji"
        START(["Uzytkownik wchodzi na strone"])

        START --> CHECK_TOKEN{"Token w localStorage?"}

        CHECK_TOKEN -->|"TAK"| DECKS["/decks"]
        CHECK_TOKEN -->|"NIE"| LOGIN_PAGE["/login"]

        LOGIN_PAGE --> LOGIN_SUBMIT{"Logowanie"}
        LOGIN_SUBMIT -->|"Sukces"| SAVE_TOKEN["Zapisz tokeny"]
        SAVE_TOKEN --> DECKS
        LOGIN_SUBMIT -->|"Blad 401"| LOGIN_ERROR["Niepoprawne dane"]
        LOGIN_ERROR --> LOGIN_PAGE

        LOGIN_PAGE -->|"Link: Nie masz konta?"| REGISTER_PAGE["/register"]
        LOGIN_PAGE -->|"Link: Zapomniales hasla?"| FORGOT_PAGE["/forgot-password"]

        REGISTER_PAGE --> REGISTER_SUBMIT{"Rejestracja"}
        REGISTER_SUBMIT -->|"Sukces z tokenami"| SAVE_TOKEN
        REGISTER_SUBMIT -->|"Sukces bez tokenow"| VERIFY_EMAIL["Weryfikacja email"]
        VERIFY_EMAIL --> LOGIN_PAGE
        REGISTER_SUBMIT -->|"Blad 409"| REGISTER_ERROR["Email juz istnieje"]
        REGISTER_ERROR --> REGISTER_PAGE

        REGISTER_PAGE -->|"Link: Masz juz konto?"| LOGIN_PAGE

        FORGOT_PAGE --> FORGOT_SUBMIT{"Wyslij link"}
        FORGOT_SUBMIT -->|"Sukces"| EMAIL_SENT["Email wyslany"]
        EMAIL_SENT -->|"Link: Powrot do logowania"| LOGIN_PAGE

        FORGOT_PAGE -->|"Link: Pamietasz haslo?"| LOGIN_PAGE

        EMAIL_SENT -.->|"Link w emailu"| RESET_PAGE["/reset-password"]

        RESET_PAGE --> TOKEN_CHECK{"Czy token poprawny?"}
        TOKEN_CHECK -->|"NIE"| INVALID_TOKEN["Nieprawidlowy link"]
        INVALID_TOKEN -->|"Link: Popros o nowy"| FORGOT_PAGE

        TOKEN_CHECK -->|"TAK"| RESET_SUBMIT{"Ustaw nowe haslo"}
        RESET_SUBMIT -->|"Sukces"| PASSWORD_CHANGED["Haslo zmienione"]
        PASSWORD_CHANGED -->|"Auto przekierowanie"| LOGIN_PAGE
        RESET_SUBMIT -->|"Blad 401"| EXPIRED_TOKEN["Token wygasl"]
        EXPIRED_TOKEN -->|"Link: Popros o nowy"| FORGOT_PAGE

        RESET_PAGE -->|"Link: Pamietasz haslo?"| LOGIN_PAGE

        DECKS -->|"Przycisk Wyloguj"| LOGOUT_ACTION["Wylogowanie"]
        LOGOUT_ACTION --> CLEAR_TOKEN["Usun tokeny"]
        CLEAR_TOKEN --> LOGIN_PAGE
    end

    %% Stylizacja
    classDef page fill:#f9d71c,stroke:#333,stroke-width:2px;
    classDef decision fill:#e74c3c,stroke:#333,stroke-width:2px;
    classDef action fill:#3498db,stroke:#333,stroke-width:2px;
    classDef success fill:#27ae60,stroke:#333,stroke-width:2px;
    classDef error fill:#e67e22,stroke:#333,stroke-width:2px;

    class LOGIN_PAGE,REGISTER_PAGE,FORGOT_PAGE,RESET_PAGE,DECKS page;
    class CHECK_TOKEN,LOGIN_SUBMIT,REGISTER_SUBMIT,FORGOT_SUBMIT,TOKEN_CHECK,RESET_SUBMIT decision;
    class SAVE_TOKEN,CLEAR_TOKEN,LOGOUT_ACTION action;
    class EMAIL_SENT,PASSWORD_CHANGED,VERIFY_EMAIL success;
    class LOGIN_ERROR,REGISTER_ERROR,INVALID_TOKEN,EXPIRED_TOKEN error;
```

</mermaid_diagram>

---

## Diagram zaleznosci komponentow

<mermaid_diagram>

```mermaid
flowchart LR
    subgraph "Warstwa Stron Astro"
        direction TB
        P1["login.astro"]
        P2["register.astro"]
        P3["forgot-password.astro"]
        P4["reset-password.astro"]
    end

    subgraph "Warstwa Layoutu"
        LAYOUT["Layout.astro"]
    end

    subgraph "Warstwa Formularzy React"
        direction TB
        F1["LoginForm"]
        F2["RegisterForm"]
        F3["ForgotPasswordForm"]
        F4["ResetPasswordForm"]
    end

    subgraph "Warstwa Komponentow Narzedziowych"
        direction TB
        T1["LogoutButton"]
        T2["ThemeToggle"]
        T3["Toaster"]
    end

    subgraph "Warstwa Komponentow Wspoldzielonych"
        direction TB
        S1["PasswordInput"]
        S2["FormError"]
    end

    subgraph "Warstwa UI Shadcn"
        direction TB
        U1["Button"]
        U2["Input"]
        U3["Label"]
    end

    %% Strony do Layout
    P1 --> LAYOUT
    P2 --> LAYOUT
    P3 --> LAYOUT
    P4 --> LAYOUT

    %% Layout do komponentow narzedziowych
    LAYOUT --> T1
    LAYOUT --> T2
    LAYOUT --> T3

    %% Strony do formularzy
    P1 --> F1
    P2 --> F2
    P3 --> F3
    P4 --> F4

    %% Formularze do wspoldzielonych
    F1 --> S1
    F1 --> S2
    F2 --> S1
    F2 --> S2
    F3 --> S2
    F4 --> S1
    F4 --> S2

    %% Wspoldzielone do UI
    S1 --> U1
    S1 --> U2

    %% Formularze do UI
    F1 --> U1
    F1 --> U2
    F1 --> U3
    F2 --> U1
    F2 --> U2
    F2 --> U3
    F3 --> U1
    F3 --> U2
    F3 --> U3
    F4 --> U1
    F4 --> U3

    %% Narzedziowe do UI
    T1 --> U1

    %% Stylizacja
    classDef astro fill:#f9d71c,stroke:#333,stroke-width:2px;
    classDef react fill:#61dafb,stroke:#333,stroke-width:2px;
    classDef shared fill:#9b59b6,stroke:#333,stroke-width:2px;
    classDef ui fill:#2ecc71,stroke:#333,stroke-width:2px;

    class P1,P2,P3,P4,LAYOUT astro;
    class F1,F2,F3,F4,T1,T2,T3 react;
    class S1,S2 shared;
    class U1,U2,U3 ui;
```

</mermaid_diagram>

---

## Opis komponentow

### Strony Astro

| Strona | Sciezka | Opis | Props przekazywane |
|--------|---------|------|-------------------|
| login.astro | /login | Strona logowania | redirectTo z query param |
| register.astro | /register | Strona rejestracji | brak |
| forgot-password.astro | /forgot-password | Strona odzyskiwania hasla | brak |
| reset-password.astro | /reset-password | Strona ustawiania nowego hasla | accessToken z query param |

### Komponenty React - Formularze

| Komponent | Funkcjonalnosc | Walidacja | API Endpoint |
|-----------|----------------|-----------|--------------|
| LoginForm | Logowanie email i haslo | Email format, haslo wymagane | POST /api/v1/auth/login |
| RegisterForm | Rejestracja nowego konta | Email, haslo min 8 znakow z litera i cyfra, potwierdzenie | POST /api/v1/auth/register |
| ForgotPasswordForm | Wysylanie linku resetujacego | Email format | POST /api/v1/auth/forgot-password |
| ResetPasswordForm | Ustawienie nowego hasla | Haslo min 8 znakow z litera i cyfra, potwierdzenie | POST /api/v1/auth/reset-password |

### Komponenty wspoldzielone

| Komponent | Funkcjonalnosc |
|-----------|----------------|
| PasswordInput | Pole hasla z przyciskiem pokazywania i ukrywania wartosci |
| FormError | Wyswietlanie komunikatow bledow w formularzu |
| LogoutButton | Przycisk wylogowania, warunkowe renderowanie gdy zalogowany |
| ThemeToggle | Przelacznik motywu jasny i ciemny |

### Zarzadzanie stanem

- **localStorage** - przechowuje `auth_token` i `auth_refresh_token`
- Wszystkie formularze auth sprawdzaja token przy montowaniu i przekierowuja do /decks jesli uzytkownik jest zalogowany
- LogoutButton sprawdza token i renderuje sie tylko gdy uzytkownik jest zalogowany

### Linki nawigacyjne w formularzach

| Z formularza | Do strony | Tekst linku |
|--------------|-----------|-------------|
| LoginForm | /register | Nie masz konta? Zarejestruj sie |
| LoginForm | /forgot-password | Zapomniales hasla? |
| RegisterForm | /login | Masz juz konto? Zaloguj sie |
| ForgotPasswordForm | /login | Pamietasz haslo? Zaloguj sie |
| ForgotPasswordForm sukces | /login | Powrot do logowania |
| ResetPasswordForm | /login | Pamietasz haslo? Zaloguj sie |
| ResetPasswordForm blad | /forgot-password | Popros o nowy link |
