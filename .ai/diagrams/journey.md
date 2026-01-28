# Diagram podróży użytkownika - Moduł Logowania i Rejestracji

## Opis

Ten dokument zawiera diagramy podróży użytkownika dla modułu autentykacji aplikacji 10x-cards.
Diagramy zostały oparte na wymaganiach z PRD (US-001, US-002, US-003) oraz implementacji kodu.

## Główny diagram podróży użytkownika

```mermaid
stateDiagram-v2
    [*] --> StronaGlowna

    state "Strona glowna" as StronaGlowna
    StronaGlowna: Automatyczny redirect

    state sprawdzenie_auth <<choice>>
    StronaGlowna --> sprawdzenie_auth

    sprawdzenie_auth --> Dashboard: Uzytkownik zalogowany
    sprawdzenie_auth --> WyborAkcji: Uzytkownik niezalogowany

    state "Wybor akcji" as WyborAkcji
    WyborAkcji: Login lub Rejestracja lub Reset hasla

    WyborAkcji --> FormularzLogowania: Logowanie
    WyborAkcji --> FormularzRejestracji: Rejestracja
    WyborAkcji --> FormularzZapomnianegoHasla: Zapomnialem hasla

    state "Formularz logowania" as FormularzLogowania
    FormularzLogowania: Email i haslo
    note right of FormularzLogowania
        Link do rejestracji
        Link do resetu hasla
    end note

    state wynik_logowania <<choice>>
    FormularzLogowania --> wynik_logowania: Wyslij

    wynik_logowania --> Dashboard: Sukces - token zapisany
    wynik_logowania --> FormularzLogowania: Blad - niepoprawne dane

    state "Formularz rejestracji" as FormularzRejestracji
    FormularzRejestracji: Email i haslo min 8 znakow
    note right of FormularzRejestracji
        Haslo wymaga litery i cyfry
        Link do logowania
    end note

    state wynik_rejestracji <<choice>>
    FormularzRejestracji --> wynik_rejestracji: Wyslij

    wynik_rejestracji --> Dashboard: Sukces z auto-confirm
    wynik_rejestracji --> OczekiwanieNaWeryfikacje: Sukces z email verification
    wynik_rejestracji --> FormularzRejestracji: Blad - email juz istnieje

    state "Oczekiwanie na weryfikacje" as OczekiwanieNaWeryfikacje
    OczekiwanieNaWeryfikacje: Sprawdz skrzynke email
    OczekiwanieNaWeryfikacje --> FormularzLogowania: Po weryfikacji emaila

    state "Formularz zapomniałem hasla" as FormularzZapomnianegoHasla
    FormularzZapomnianegoHasla: Podaj adres email

    FormularzZapomnianegoHasla --> WyslanoEmailResetu: Wyslij

    state "Wyslano email resetu" as WyslanoEmailResetu
    WyslanoEmailResetu: Sprawdz skrzynke email
    note right of WyslanoEmailResetu
        Zawsze wyswietlane
        niezaleznie czy email istnieje
    end note

    WyslanoEmailResetu --> FormularzLogowania: Powrot do logowania
    WyslanoEmailResetu --> FormularzResetuHasla: Klikniecie linku z emaila

    state "Formularz resetu hasla" as FormularzResetuHasla
    FormularzResetuHasla: Nowe haslo z tokenem z URL

    state walidacja_tokenu <<choice>>
    FormularzResetuHasla --> walidacja_tokenu: Wyslij

    walidacja_tokenu --> SukcesResetuHasla: Token poprawny
    walidacja_tokenu --> BladTokena: Token niepoprawny lub wygasl

    state "Sukces resetu hasla" as SukcesResetuHasla
    SukcesResetuHasla: Haslo zostalo zmienione
    SukcesResetuHasla --> FormularzLogowania: Redirect po 2s

    state "Blad tokena" as BladTokena
    BladTokena: Link jest niewazny lub wygasl
    BladTokena --> FormularzZapomnianegoHasla: Sprobuj ponownie

    state "Dashboard - Lista talii" as Dashboard
    Dashboard: Glowna strona aplikacji
    Dashboard --> [*]: Wylogowanie
```

## Diagram przepływu logowania

```mermaid
stateDiagram-v2
    [*] --> SprawdzenieTokenu

    state "Sprawdzenie tokenu" as SprawdzenieTokenu
    SprawdzenieTokenu: localStorage auth_token

    state czy_zalogowany <<choice>>
    SprawdzenieTokenu --> czy_zalogowany

    czy_zalogowany --> RedirectDoDashboard: Token istnieje
    czy_zalogowany --> WyswietlFormularz: Brak tokenu

    state "Redirect do dashboard" as RedirectDoDashboard
    RedirectDoDashboard --> Dashboard

    state "Wyswietl formularz" as WyswietlFormularz
    WyswietlFormularz: Pola email i haslo

    state "Walidacja danych" as WalidacjaDanych
    WyswietlFormularz --> WalidacjaDanych: Klikniecie Zaloguj

    state walidacja_ok <<choice>>
    WalidacjaDanych --> walidacja_ok

    walidacja_ok --> WyslanieZadania: Dane poprawne
    walidacja_ok --> WyswietlFormularz: Blad walidacji

    state "Wyslanie zadania" as WyslanieZadania
    WyslanieZadania: POST api v1 auth login

    state odpowiedz_api <<choice>>
    WyslanieZadania --> odpowiedz_api

    odpowiedz_api --> ZapisTokenu: Status 200
    odpowiedz_api --> BladLogowania: Status 401

    state "Zapis tokenu" as ZapisTokenu
    ZapisTokenu: localStorage auth_token i refresh_token

    ZapisTokenu --> Dashboard

    state "Blad logowania" as BladLogowania
    BladLogowania: Niepoprawny email lub haslo
    BladLogowania --> WyswietlFormularz

    state "Dashboard" as Dashboard
    Dashboard --> [*]
```

## Diagram przepływu rejestracji

```mermaid
stateDiagram-v2
    [*] --> SprawdzenieTokenu

    state "Sprawdzenie tokenu" as SprawdzenieTokenu
    SprawdzenieTokenu: localStorage auth_token

    state czy_zalogowany <<choice>>
    SprawdzenieTokenu --> czy_zalogowany

    czy_zalogowany --> Dashboard: Token istnieje
    czy_zalogowany --> WyswietlFormularz: Brak tokenu

    state "Wyswietl formularz" as WyswietlFormularz
    WyswietlFormularz: Email i haslo

    state "Walidacja danych" as WalidacjaDanych
    WyswietlFormularz --> WalidacjaDanych: Klikniecie Zarejestruj

    state walidacja_ok <<choice>>
    WalidacjaDanych --> walidacja_ok

    walidacja_ok --> WyslanieZadania: Dane poprawne
    walidacja_ok --> WyswietlFormularz: Blad walidacji

    note right of WalidacjaDanych
        Haslo min 8 znakow
        Wymaga litery i cyfry
    end note

    state "Wyslanie zadania" as WyslanieZadania
    WyslanieZadania: POST api v1 auth register

    state odpowiedz_api <<choice>>
    WyslanieZadania --> odpowiedz_api

    odpowiedz_api --> SprawdzenieTokenuWOdpowiedzi: Status 201
    odpowiedz_api --> BladEmailIstnieje: Status 409
    odpowiedz_api --> WyswietlFormularz: Status 400

    state czy_token_w_odpowiedzi <<choice>>
    state "Sprawdzenie tokenu w odpowiedzi" as SprawdzenieTokenuWOdpowiedzi
    SprawdzenieTokenuWOdpowiedzi --> czy_token_w_odpowiedzi

    czy_token_w_odpowiedzi --> ZapisTokenu: access_token obecny
    czy_token_w_odpowiedzi --> OczekiwanieNaWeryfikacje: Brak access_token

    state "Zapis tokenu" as ZapisTokenu
    ZapisTokenu: localStorage auth_token i refresh_token

    state "Sukces rejestracji" as SukcesRejestracji
    ZapisTokenu --> SukcesRejestracji
    SukcesRejestracji --> Dashboard: Redirect po 2s

    state "Oczekiwanie na weryfikacje" as OczekiwanieNaWeryfikacje
    OczekiwanieNaWeryfikacje: Sprawdz skrzynke email
    OczekiwanieNaWeryfikacje --> Logowanie: Redirect po 2s

    state "Blad email istnieje" as BladEmailIstnieje
    BladEmailIstnieje: Konto juz istnieje
    BladEmailIstnieje --> WyswietlFormularz

    state "Logowanie" as Logowanie
    Logowanie --> [*]

    state "Dashboard" as Dashboard
    Dashboard --> [*]
```

## Diagram przepływu resetowania hasła

```mermaid
stateDiagram-v2
    [*] --> SprawdzenieTokenu

    state "Sprawdzenie tokenu" as SprawdzenieTokenu
    SprawdzenieTokenu: localStorage auth_token

    state czy_zalogowany <<choice>>
    SprawdzenieTokenu --> czy_zalogowany

    czy_zalogowany --> Dashboard: Token istnieje
    czy_zalogowany --> FormularzZadaniaResetu: Brak tokenu

    state "Formularz zadania resetu" as FormularzZadaniaResetu
    FormularzZadaniaResetu: Podaj adres email

    FormularzZadaniaResetu --> WyslanieZadania: Klikniecie Wyslij

    state "Wyslanie zadania" as WyslanieZadania
    WyslanieZadania: POST api v1 auth forgot-password

    WyslanieZadania --> WyslanoEmail: Zawsze status 200

    note right of WyslanieZadania
        Nie ujawnia czy email istnieje
        Ze wzgledow bezpieczenstwa
    end note

    state "Wyslano email" as WyslanoEmail
    WyslanoEmail: Jesli konto istnieje otrzymasz email

    WyslanoEmail --> Logowanie: Powrot do logowania
    WyslanoEmail --> OtworzenieLinku: Klikniecie linku z emaila

    state "Otwarcie linku" as OtworzenieLinku
    OtworzenieLinku: URL z access_token w parametrze

    state czy_token_obecny <<choice>>
    OtworzenieLinku --> czy_token_obecny

    czy_token_obecny --> FormularzNowegoHasla: Token w URL
    czy_token_obecny --> BladBrakTokenu: Brak tokenu

    state "Formularz nowego hasla" as FormularzNowegoHasla
    FormularzNowegoHasla: Wprowadz nowe haslo

    FormularzNowegoHasla --> WyslanieNowegoHasla: Klikniecie Zmien haslo

    state "Wyslanie nowego hasla" as WyslanieNowegoHasla
    WyslanieNowegoHasla: POST api v1 auth reset-password

    state wynik_resetu <<choice>>
    WyslanieNowegoHasla --> wynik_resetu

    wynik_resetu --> SukcesZmianyHasla: Status 200
    wynik_resetu --> BladTokenaWygasl: Status 401

    state "Sukces zmiany hasla" as SukcesZmianyHasla
    SukcesZmianyHasla: Haslo zostalo zmienione
    SukcesZmianyHasla --> Logowanie: Redirect po 2s

    state "Blad brak tokenu" as BladBrakTokenu
    BladBrakTokenu: Nieprawidlowy link resetu
    BladBrakTokenu --> FormularzZadaniaResetu: Sprobuj ponownie

    state "Blad tokena wygasl" as BladTokenaWygasl
    BladTokenaWygasl: Link wygasl lub jest niewazny
    BladTokenaWygasl --> FormularzZadaniaResetu: Sprobuj ponownie

    state "Logowanie" as Logowanie
    Logowanie --> [*]

    state "Dashboard" as Dashboard
    Dashboard --> [*]
```

## Diagram wylogowania

```mermaid
stateDiagram-v2
    [*] --> Dashboard

    state "Dashboard" as Dashboard
    Dashboard: Uzytkownik zalogowany

    Dashboard --> KlikniecieWyloguj: Przycisk Wyloguj

    state "Klikniecie wyloguj" as KlikniecieWyloguj
    KlikniecieWyloguj: POST api v1 auth logout

    KlikniecieWyloguj --> UsuniecieTokenu: Status 200

    state "Usuniecie tokenu" as UsuniecieTokenu
    UsuniecieTokenu: localStorage remove auth_token

    UsuniecieTokenu --> Logowanie

    state "Logowanie" as Logowanie
    Logowanie --> [*]
```

## Legenda

| Element             | Znaczenie                   |
| ------------------- | --------------------------- |
| `[*]`               | Stan poczatkowy lub koncowy |
| `<<choice>>`        | Punkt decyzyjny             |
| Stan prostokatny    | Akcja lub widok             |
| Strzalka z etykieta | Przejscie z opisem warunku  |
| `note`              | Dodatkowa informacja        |

## Zrodla

- PRD: `.ai/prd.md` (US-001, US-002, US-003)
- Implementacja: `/src/pages/` (login, register, forgot-password, reset-password)
- Komponenty: `/src/components/auth/`
- API: `/src/pages/api/v1/auth/`
