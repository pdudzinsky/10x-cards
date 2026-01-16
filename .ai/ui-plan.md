# Architektura UI dla 10x-cards

## 1. Przegląd struktury UI

UI MVP jest zorganizowane wokół jednej głównej encji: **talia (deck)**. Po zalogowaniu użytkownik zawsze trafia na **listę tali**, która jest centralnym punktem nawigacji. Z listy przechodzi do **szczegółów tali**, a stamtąd wykonuje operacje: edycja/usuwanie tali, zarządzanie fiszkami (manualnie i AI), weryfikacja fiszek AI oraz rozpoczęcie powtórek.

Założenia architektoniczne:

- Desktop-first, prosta nawigacja, jawne przyciski powrotu (bez breadcrumbs).
- Spójne stany asynchroniczne: loading, empty, error (ekran z retry), success (toast).
- Globalna obsługa sesji: token, guard routingu, przekierowania na login przy 401 z czyszczeniem stanu.
- Globalny guard niezapisanych zmian dla formularzy i edycji inline.
- UI ograniczone do możliwości wspieranych przez API (brak wyszukiwania i sortowania fiszek; na liście tali paginacja previous/next).

---

## 2. Lista widoków

### 2.1 Logowanie

- **Ścieżka**: `/login`
- **Główny cel**: umożliwić zalogowanie email + hasło.
- **Kluczowe informacje**: pola email, hasło; link do rejestracji; link “Nie pamiętasz hasła?”.
- **Kluczowe komponenty widoku**:
  - Formularz logowania (walidacja wymaganych pól).
  - Globalna lista błędów z API (np. niepoprawne dane).
  - Przycisk “Zaloguj” z loaderem i blokadą w trakcie requestu.
- **UX, dostępność i bezpieczeństwo**:
  - Focus management: focus na pierwszym błędnym polu; czytelne komunikaty walidacyjne.
  - Bezpieczeństwo: po 401/odmowie autoryzacji brak odtwarzania poprzedniego stanu, przekierowanie na login.
  - Brak ujawniania wrażliwych szczegółów błędu (komunikaty ogólne).

---

### 2.2 Rejestracja

- **Ścieżka**: `/register`
- **Główny cel**: utworzenie konta email + hasło.
- **Kluczowe informacje**: email, hasło, powtórzenie hasła (UI), wymagania walidacji.
- **Kluczowe komponenty widoku**:
  - Formularz rejestracji z walidacją.
  - Globalna lista błędów z API.
  - Przycisk “Utwórz konto” z loaderem.
- **UX, dostępność i bezpieczeństwo**:
  - Dostępność: etykiety pól, obsługa klawiatury, komunikaty błędów czytelne dla screen readerów.
  - Bezpieczeństwo: komunikaty o błędach bez zdradzania, czy email istnieje (jeśli dotyczy).

---

### 2.3 Reset hasła

- **Ścieżki**:
  - `/password-reset` (żądanie linku resetu)
  - `/password-reset/confirm` (ustawienie nowego hasła)
- **Główny cel**: odzyskanie dostępu do konta.
- **Kluczowe informacje**:
  - Ekran żądania: pole email, informacja o wysłaniu linku.
  - Ekran potwierdzenia: nowe hasło (+ powtórzenie w UI).
- **Kluczowe komponenty widoku**:
  - Formularze z walidacją i loaderem.
  - Toast po sukcesie (np. “Hasło zmienione”).
  - Ekran błędu, jeśli token resetu jest nieprawidłowy/wygasł (jeżeli backend tak zwraca).
- **UX, dostępność i bezpieczeństwo**:
  - Bezpieczeństwo: brak ujawniania, czy konto istnieje.
  - Dostępność: jasne opisy kroków i statusów.

---

### 2.4 Lista tali

- **Ścieżka**: `/decks`
- **Główny cel**: przegląd tali użytkownika i wejście do szczegółów.
- **Kluczowe informacje do wyświetlenia**:
  - Nazwa tali.
  - Liczba fiszek “Do powtórki” (due_cards_count).
  - Paginacja: Previous/Next + numer aktualnej strony.
- **Kluczowe komponenty widoku**:
  - Lista tali (element klikalny prowadzący do szczegółów).
  - Primary CTA: “Utwórz talię”.
  - Empty state: komunikat + CTA “Utwórz talię”.
  - Paginacja (oparta o `limit/offset/total` z API).
  - Stany: loading, error (ekran błędu z “Spróbuj ponownie”).
- **UX, dostępność i bezpieczeństwo**:
  - Dostępność: duży obszar klikalny elementu listy, focus outline, obsługa klawiatury.
  - Kontekst listy resetowany przy każdym powrocie do listy (offset/page wraca do 1).
  - Bezpieczeństwo: przy 401 czyszczenie stanu i redirect do `/login`.

---

### 2.5 Formularz tali (create/edit)

- **Ścieżki**:
  - `/decks/new`
  - `/decks/:deckId/edit`
- **Główny cel**: tworzenie lub zmiana nazwy tali.
- **Kluczowe informacje**:
  - Pole nazwy tali (1-100 znaków), placeholder.
  - Informacja o wymaganym polu i limitach.
- **Kluczowe komponenty widoku**:
  - Formularz wspólny dla create i edit.
  - Walidacje w UI + globalna lista błędów z API.
  - Przyciski: “Zapisz” (primary, z loaderem), “Anuluj” (secondary).
  - Guard niezapisanych zmian: dialog ostrzegawczy przy próbie opuszczenia widoku (nawigacja i browser back).
- **Zachowanie po akcji**:
  - Create: powrót do listy tali `/decks`.
  - Edit: powrót do szczegółów tali `/decks/:deckId`.
- **UX, dostępność i bezpieczeństwo**:
  - Dostępność: focus na polu nazwy po wejściu; błędy przypięte do pola.
  - Bezpieczeństwo: operacje wymagają autoryzacji, obsługa 401 globalnie.

---

### 2.6 Szczegóły tali (read-only)

- **Ścieżka**: `/decks/:deckId`
- **Główny cel**: centralny widok pracy z talią: wgląd i akcje.
- **Kluczowe informacje do wyświetlenia**:
  - Nazwa tali.
  - “Do powtórki” (z listy lub z odświeżenia listy, jeśli dostępne).
  - Sekcja fiszek: lista + filtr statusu.
- **Kluczowe komponenty widoku**:
  - Jawny przycisk “Wróć do listy”.
  - Akcje tali:
    - “Edytuj” (primary) -> `/decks/:deckId/edit`
    - “Usuń” (destructive) -> dialog potwierdzenia
  - Akcje fiszek (na tym samym ekranie):
    - “Dodaj fiszkę” (secondary)
    - “Generuj fiszki” (secondary/primary w kontekście sekcji fiszek)
    - “Rozpocznij powtórkę” (primary, gdy są fiszki do powtórki; w MVP może być zawsze aktywny, ale UI powinien obsłużyć pustą sesję)
  - Filtr fiszek: Wszystkie / Niezweryfikowane / Zaakceptowano (mapowanie na `status=all|unverified|accepted`).
  - Stany: loading, error (ekran błędu z retry), 404 (dedykowany ekran “Talia nie istnieje” + powrót do listy).
- **UX, dostępność i bezpieczeństwo**:
  - Dostępność: czytelne grupowanie akcji (talia vs fiszki), kolejność tabulacji.
  - Bezpieczeństwo: usuwanie wymaga potwierdzenia; po 401 reset stanu i login.

---

### 2.7 Generowanie fiszek AI

- **Ścieżka**: `/decks/:deckId/ai-generate`
- **Główny cel**: wklejenie tekstu i uruchomienie generacji.
- **Kluczowe informacje**:
  - Pole tekstowe (do 10 000 znaków).
  - Dropdown liczby fiszek: 5, 10, 20.
  - Informacja o dziennym limicie i pozostałych generacjach (z odpowiedzi endpointu generacji; opcjonalnie wstępnie z profilu).
- **Kluczowe komponenty widoku**:
  - Textarea z licznikiem znaków i walidacją długości.
  - Select liczby fiszek.
  - Przyciski: “Generuj” (primary, loader, blokada), “Anuluj” (secondary).
  - Obsługa błędów:
    - 403: komunikat “Przekroczono limit dzienny”.
    - 400: “Tekst za długi” lub “Nieprawidłowa liczba fiszek”.
    - 502: “Błąd generacji, spróbuj ponownie”.
    - Anulowanie: toast “Anulowano” i powrót do szczegółów tali.
- **Zachowanie po sukcesie**:
  - Powrót do `/decks/:deckId` i odświeżenie listy fiszek (nowe jako Niezweryfikowane).
- **UX, dostępność i bezpieczeństwo**:
  - Dostępność: opis pola tekstowego, informacja o limitach, obsługa klawiatury.
  - Bezpieczeństwo: nie przechowywać surowego tekstu w UI po wyjściu; nie cache’ować source_text w trwałym storage.

---

### 2.8 Dodanie fiszki manualnie (inline w szczegółach tali)

- **Ścieżka**: realizowane w `/decks/:deckId` (bez osobnego routu)
- **Główny cel**: szybkie dodanie zaakceptowanej fiszki.
- **Kluczowe informacje**: przód (<=200), tył (<=500).
- **Kluczowe komponenty widoku**:
  - Inline formularz w liście fiszek lub panel nad listą:
    - pola front/back z licznikami.
    - przyciski “Zapisz” i “Anuluj”.
  - Walidacja po stronie UI + błędy z API.
- **UX, dostępność i bezpieczeństwo**:
  - Guard niezapisanych zmian dla inline tworzenia.
  - Focus po kliknięciu “Dodaj fiszkę” na pierwsze pole.

---

### 2.9 Lista fiszek i weryfikacja AI (w szczegółach tali)

- **Ścieżka**: `/decks/:deckId`
- **Główny cel**: przegląd fiszek i operacje zgodne ze statusem.
- **Kluczowe informacje**:
  - Dla każdej fiszki: front, back, status (implicit przez filtr/akcje), next_review_at (opcjonalnie do ukrycia w MVP; nie jest wymagane w PRD).
- **Kluczowe komponenty widoku**:
  - Lista fiszek (GET `/v1/decks/{deckId}/cards`).
  - Filtr statusu (all/unverified/accepted).
  - Akcje per fiszka:
    - Dla Niezweryfikowanej:
      - "Zapisz" (bez zmian) -> POST `/v1/cards/{cardId}/accept`.
      - "Edytuj i zapisz" -> inline edycja + PATCH `/v1/cards/{cardId}` (ustawia status=accepted).
      - "Odrzuć" -> DELETE `/v1/cards/{cardId}`.
    - Dla Zaakceptowanej:
      - "Edytuj" -> inline edycja, "Zapisz" (PATCH), "Anuluj".
      - "Usuń" -> dialog potwierdzenia, a następnie DELETE `/v1/cards/{cardId}`.
  - Akcje masowe (tylko gdy filtr = Niezweryfikowane lub gdy na liście są niezweryfikowane):
    - “Zaakceptuj wszystkie” -> POST `/v1/decks/{deckId}/cards/accept-all`
    - “Odrzuć wszystkie” -> DELETE `/v1/decks/{deckId}/cards/unverified`
- **UX, dostępność i bezpieczeństwo**:
  - Dostępność: przyciski z etykietami, dialogi modalne z trap focus, ESC zamyka.
  - Bezpieczeństwo: operacje destrukcyjne wymagają potwierdzenia (co najmniej bulk reject oraz usuwanie zaakceptowanej).
  - Brak cofania odrzucenia: UI jasno komunikuje nieodwracalność w dialogu.

---

### 2.10 Sesja powtórek

- **Ścieżka**: `/decks/:deckId/review`
- **Główny cel**: prezentacja fiszek do powtórki i zapis ocen 0-5.
- **Kluczowe informacje**:
  - Aktualna fiszka: front i back (w jednej karcie; w MVP bez ukrywania odpowiedzi nie jest zabronione, ale można zachować prosty układ: front u góry, back poniżej).
  - Postęp sesji (opcjonalny licznik “n z m”, nie wymagany przez PRD).
- **Kluczowe komponenty widoku**:
  - Start sesji: POST `/v1/decks/{deckId}/reviews/start` (zaktualizuje last_used_at).
  - Prezentacja fiszki i zestaw przycisków oceny 0-5.
  - Po wyborze oceny: POST `/v1/reviews/{cardId}/answer` i przejście do następnej fiszki.
  - Przycisk “Zakończ” zawsze dostępny -> powrót do `/decks/:deckId` (bez podsumowania).
  - Obsługa stanu “brak fiszek do powtórki” (jeśli API zwróci pustą listę): komunikat + przycisk powrotu.
- **UX, dostępność i bezpieczeństwo**:
  - Dostępność: oceny jako przyciski w logicznej kolejności, wsparcie klawiatury, czytelne focus.
  - Stabilność: przy błędzie zapisu oceny wyświetlić komunikat i umożliwić ponowienie (nie przechodzić dalej bez potwierdzonego zapisu).

---

### 2.11 Ekrany błędów i stany systemowe

- **Ścieżki / tryby**:
  - `404` (np. `/decks/:deckId` dla nieistniejącej tali) -> dedykowany ekran z “Wróć do listy”.
  - Globalny ekran błędu (5xx, sieć) -> “Spróbuj ponownie”.
- **Główny cel**: czytelne wyjście z problemów bez blokowania aplikacji.
- **Kluczowe komponenty widoku**:
  - Error screen z opisem i przyciskiem retry.
  - Toasty potwierdzeń (np. po delete).
- **UX, dostępność i bezpieczeństwo**:
  - Komunikaty bez wrażliwych szczegółów.
  - Retry nie powinno duplikować operacji mutujących bez intencji użytkownika (np. po timeout przy zapisie - UI powinien jasno wskazać, co jest ponawiane).

---

## 3. Mapa podróży użytkownika

### 3.1 Główny flow MVP (zgodny z notatkami)

1. **/login**: użytkownik loguje się.
2. Redirect do **/decks**: lista tali (zawsze po zalogowaniu).
3. Klik w talię -> **/decks/:deckId**: szczegóły tali (read-only + sekcja fiszek).
4. Użytkownik wykonuje jedną z akcji:
   - Edycja tali: **/decks/:deckId/edit** -> zapis -> powrót do **/decks/:deckId**
   - Usunięcie tali: potwierdzenie -> delete -> powrót do **/decks** (reset paginacji) + toast
   - Dodanie fiszki manualnie: inline -> zapis -> odświeżenie listy fiszek
   - Generowanie AI: **/decks/:deckId/ai-generate** -> generuj -> powrót do **/decks/:deckId** (nowe niezweryfikowane)
   - Weryfikacja fiszek AI: akcje per fiszka lub bulk -> odświeżenie listy
   - Powtórki: **/decks/:deckId/review** -> oceny 0-5 -> “Zakończ” lub koniec -> powrót do **/decks/:deckId**

### 3.2 Journey dla weryfikacji fiszek AI

1. W szczegółach tali filtr “Niezweryfikowane”.
2. Użytkownik:
   - “Zapisz” (bez zmian) albo “Edytuj i zapisz” albo “Odrzuć”.
3. Opcjonalnie używa akcji masowych “Zaakceptuj wszystkie” lub “Odrzuć wszystkie”.
4. UI pokazuje toasty i aktualizuje listę.

### 3.3 Journey dla powtórek

1. W szczegółach tali klik “Rozpocznij powtórkę”.
2. UI uruchamia `/reviews/start` i przechodzi przez fiszki.
3. Po każdej ocenie UI zapisuje wynik i przechodzi dalej.
4. “Zakończ” w dowolnym momencie -> powrót do szczegółów tali, bez podsumowania.

---

## 4. Układ i struktura nawigacji

### 4.1 Struktura routingu

- Public:
  - `/login`
  - `/register`
  - `/password-reset`
  - `/password-reset/confirm`
- Protected (wymaga tokenu):
  - `/decks`
  - `/decks/new`
  - `/decks/:deckId`
  - `/decks/:deckId/edit`
  - `/decks/:deckId/ai-generate`
  - `/decks/:deckId/review`

### 4.2 Zasady nawigacji

- Po loginie zawsze redirect do `/decks`.
- Z `/decks` klik w element zawsze prowadzi do `/decks/:deckId`.
- Na `/decks/:deckId` zawsze widoczny przycisk “Wróć do listy”.
- Brak breadcrumbs.
- Formularze create/edit: “Anuluj” wraca odpowiednio do listy (create) lub do szczegółów (edit).
- Globalny guard niezapisanych zmian dla:
  - formularza tali,
  - inline tworzenia fiszki,
  - inline edycji fiszki.

### 4.3 Obsługa sesji i błędów nawigacyjnych

- 401 z dowolnego endpointu: wylogowanie po stronie UI (czyszczenie stanu) i redirect do `/login`.
- 404 dla tali: dedykowany ekran + CTA “Wróć do listy”.
- Błędy 5xx/sieć: ekran błędu z “Spróbuj ponownie” (dla widoków danych) oraz toasty dla błędów akcji.

---

## 5. Kluczowe komponenty

1. **AuthGuard / RouteGuard**
   - Ochrona tras wymagających sesji; obsługa 401 globalnie (reset stanu i redirect do login).

2. **App Shell (layout)**
   - Kontener desktop-first: nagłówek z tytułem widoku, obszar treści, miejsce na toasty.

3. **Toast System**
   - Nieblokujące komunikaty sukcesu i neutralne informacje (np. “Anulowano”, “Usunięto”).

4. **Error Screen + Retry**
   - Spójny ekran błędu dla problemów sieciowych/5xx z możliwością ponowienia pobrania danych.

5. **Confirm Dialog**
   - Dialogi potwierdzające operacje destrukcyjne (usuń talię, usuń fiszkę, odrzuć wszystkie).

6. **Unsaved Changes Dialog**
   - Globalny mechanizm ostrzegania przed utratą zmian (nawigacja w aplikacji i browser back).

7. **Deck List + Pagination**
   - Lista elementów (nazwa, due count), paginacja previous/next, wskaźnik strony.

8. **Deck Header Actions**
   - Zestaw akcji na szczegółach tali: edytuj, usuń, wróć do listy.

9. **Card List + Status Filter**
   - Lista fiszek z filtrem statusu (all/unverified/accepted) i spójnymi stanami loading/empty/error.

10. **Card Row (tryby: read, edit inline)**

- Prezentacja front/back, przełączanie do edycji inline, walidacja limitów i obsługa anulowania.

11. **Bulk Verification Bar**

- Pasek akcji masowych widoczny, gdy istnieją fiszki niezweryfikowane (accept-all, reject-all).

12. **AI Generate Form**

- Textarea z licznikiem znaków, select liczby fiszek, obsługa limitów dziennych i błędów generacji.

13. **Review Player**

- Prezentacja pojedynczej fiszki, przyciski oceny 0-5, przycisk “Zakończ”, obsługa pustej sesji.

---

## Mapowanie API do widoków (spójność kontraktów)

- `GET /v1/decks`:
  - Widok: lista tali `/decks` (paginacja limit/offset).
- `POST /v1/decks`:
  - Widok: create deck `/decks/new`.
- `GET /v1/decks/{deckId}`:
  - Widok: szczegóły tali `/decks/:deckId` (nagłówek z nazwą i due_cards_count).
- `PATCH /v1/decks/{deckId}`:
  - Widok: edit deck `/decks/:deckId/edit`.
- `DELETE /v1/decks/{deckId}`:
  - Widok: delete z `/decks/:deckId` (dialog potwierdzenia).
- `GET /v1/decks/{deckId}/cards`:
  - Widok: szczegóły tali `/decks/:deckId` (lista fiszek z filtrem statusu).
- `POST /v1/decks/{deckId}/cards`:
  - Widok: manualne dodanie fiszki inline na `/decks/:deckId`.
- `PATCH /v1/cards/{cardId}`:
  - Widok: edycja inline fiszki (zaakceptowanej oraz niezweryfikowanej z "Edytuj i zapisz").
- `DELETE /v1/cards/{cardId}`:
  - Widok: usuwanie fiszki (działa dla obu statusów: accepted i unverified).
- `POST /v1/cards/{cardId}/accept`:
  - Widok: akceptacja pojedynczej niezweryfikowanej fiszki bez edycji ("Zapisz" w `/decks/:deckId`).
- `POST /v1/decks/{deckId}/ai-generate`:
  - Widok: generowanie AI `/decks/:deckId/ai-generate`.
- `POST /v1/decks/{deckId}/cards/accept-all`:
  - Widok: bulk accept w `/decks/:deckId`.
- `DELETE /v1/decks/{deckId}/cards/unverified`:
  - Widok: bulk reject w `/decks/:deckId`.
- `POST /v1/decks/{deckId}/reviews/start`:
  - Widok: start powtórek `/decks/:deckId/review`.
- `POST /v1/reviews/{cardId}/answer`:
  - Widok: odpowiedź w powtórkach `/decks/:deckId/review`.
- `GET /v1/profile`:
  - Opcjonalnie używane w tle (np. do wyświetlenia licznika limitu AI), ale nie jest wymagane dla podstawowego flow generacji (bo endpoint generacji zwraca remaining_daily_limit).

---

## Mapowanie historyjek użytkownika do widoków i elementów UI

- US-001 Rejestracja: `/register` (formularz, walidacja, błędy API).
- US-002 Logowanie: `/login` (formularz, błędy, redirect do `/decks`).
- US-003 Reset hasła: `/password-reset`, `/password-reset/confirm`.
- US-004 Utworzenie tali: `/decks/new` + CTA na `/decks`.
- US-005 Zmiana nazwy tali: `/decks/:deckId/edit` + akcja “Edytuj” na szczegółach.
- US-006 Usunięcie tali: `/decks/:deckId` (dialog) -> powrót do `/decks` + toast + reset paginacji.
- US-007 Manualne dodanie fiszki: `/decks/:deckId` (inline create).
- US-008 Generowanie AI: `/decks/:deckId/ai-generate` (textarea, select 5/10/20, przyciski).
- US-009 Obsługa błędu generacji: `/decks/:deckId/ai-generate` (komunikaty 400/403/502, brak tworzenia fiszek po błędzie).
- US-010 Weryfikacja fiszki AI: `/decks/:deckId` (akcje: zapisz, edytuj i zapisz, odrzuć).
- US-011 Masowa weryfikacja: `/decks/:deckId` (accept-all, reject-all).
- US-012 Edycja fiszki: `/decks/:deckId` (inline edit + zapisz/anuluj).
- US-013 Usunięcie fiszki: `/decks/:deckId` (dialog + DELETE).
- US-014 Rozpoczęcie sesji powtórek: `/decks/:deckId` -> `/decks/:deckId/review`.
- US-015 Ocena fiszki: `/decks/:deckId/review` (przyciski 0-5, zapis odpowiedzi).
- US-016 Zakończenie sesji: `/decks/:deckId/review` (przycisk “Zakończ” zawsze dostępny, powrót do szczegółów).

---

## Potencjalne punkty bólu i jak UI je adresuje

1. Zbyt duży koszt wejścia w tworzenie fiszek:
   - Szybki dostęp do “Generuj fiszki” z poziomu szczegółów tali, prosty formularz generacji, jasne komunikaty limitów.

2. Frustracja przy błędach generacji/limicie:
   - Precyzyjne komunikaty (limit dzienny, za długi tekst, błąd AI) i możliwość ponowienia.

3. Weryfikacja AI może być czasochłonna:
   - Akcje masowe accept-all/reject-all oraz szybkie akcje per fiszka, inline edycja bez przechodzenia na osobny ekran.

4. Ryzyko utraty zmian:
   - Globalny guard niezapisanych zmian dla formularzy i edycji inline.

5. Niepewność nawigacyjna:
   - Jawny przycisk powrotu do listy, brak ukrytych zależności, przewidywalne przekierowania po akcjach.

6. Bezpieczeństwo i spójność sesji:
   - Globalna obsługa 401: natychmiastowe wyczyszczenie stanu i powrót do logowania.
