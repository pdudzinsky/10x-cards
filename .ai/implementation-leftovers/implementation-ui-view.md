# Prompt do generowania planu implementacji widoku szczegółów talii

Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia nowego widoku w aplikacji internetowej. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
   <prd>

   # Dokument wymagań produktu (PRD) - 10x-cards

   ## 1. Przegląd produktu

   10x-cards to aplikacja webowa wspierająca efektywną naukę metodą spaced repetition poprzez szybkie tworzenie fiszek edukacyjnych. Główną wartością produktu jest znaczące skrócenie czasu potrzebnego na przygotowanie wysokiej jakości fiszek dzięki wykorzystaniu generowania AI, przy jednoczesnym zachowaniu pełnej kontroli użytkownika nad ich jakością poprzez prosty i szybki proces weryfikacji.

   Zakres MVP obejmuje wyłącznie aplikację webową, obsługującą język polski, z podstawowym systemem kont użytkowników, zarządzaniem taliami i fiszkami oraz wbudowanym algorytmem powtórek SM-2 lub równoważnym.

   ## 2. Problem użytkownika

   Użytkownicy, którzy chcą uczyć się skutecznie przy użyciu spaced repetition, napotykają istotną barierę wejścia: manualne tworzenie fiszek jest czasochłonne, monotonne i wymaga dużego nakładu pracy poznawczej przed rozpoczęciem właściwej nauki.

   Konsekwencje problemu:
   - rezygnacja z metody spaced repetition mimo jej wysokiej skuteczności,
   - odkładanie nauki w czasie z powodu kosztu przygotowania materiałów,
   - niska regularność korzystania z narzędzi do nauki.

   Produkt adresuje ten problem poprzez automatyczne generowanie propozycji fiszek z dostarczonego tekstu oraz minimalny workflow ich weryfikacji.

   ## 3. Wymagania funkcjonalne

   ### 3.2 Strona główna i talie
   - Lista tali użytkownika po zalogowaniu.
   - Pusty stan z komunikatem i CTA „Utwórz talię".
   - Sortowanie tali według „ostatnio używana".
   - Dla każdej tali wyświetlana liczba fiszek „Do powtórki".
   - Operacje na tali:
     - Utworzenie tali (nazwa 1-100 znaków).
     - Zmiana nazwy tali.
     - Usunięcie tali (wraz z wszystkimi fiszkami i danymi powtórek, po potwierdzeniu).

   ### 3.3 Fiszki
   - Model fiszki: przód (do 200 znaków), tył (do 500 znaków).
   - Statusy fiszek:
     - Niezweryfikowane
     - Zaakceptowano
   - Widok tali:
     - Lista fiszek.
     - Filtry: Wszystkie, Niezweryfikowane, Zaakceptowano.
     - Brak wyszukiwania i sortowania w MVP.

   ### 3.4 Manualne tworzenie fiszek
   - Akcja „Dodaj fiszkę" w widoku tali.
   - Wprowadzanie przodu i tyłu inline.
   - Zapis powoduje natychmiastowe ustawienie statusu Zaakceptowano.
   - Możliwość anulowania tworzenia przed zapisem.

   ### 3.6 Weryfikacja fiszek AI
   - Akcje pojedyncze dla fiszki Niezweryfikowanej:
     - Zapisz (bez edycji, status Zaakceptowano).
     - Edytuj i zapisz (status Zaakceptowano).
     - Odrzuć - fiszka jest usunięta z systemu.
   - Akcje masowe (tylko dla Niezweryfikowanych):
     - Zaakceptuj wszystkie.
     - Odrzuć wszystkie.
   - Brak możliwości cofnięcia odrzucenia.

   ### 3.7 Edycja i usuwanie fiszek
   - Edycja inline przodu i tyłu fiszki Zaakceptowanej.
   - Przyciski „Zapisz" i „Anuluj edycję".
   - Zapis ustawia status Zaakceptowano.
   - Usuwanie:
     - Tylko dla fiszek Zaakceptowanych.
     - Usunięcie trwałe, bez możliwości przywrócenia.

   ### 3.9 Obsługa błędów
   - Komunikaty błędów:
     - Przekroczono limit dzienny.
     - Tekst za długi.
     - Błąd generacji, spróbuj ponownie.
     - Anulowano.
   - Przy błędzie generacji fiszki nie są tworzone.
     </prd>

2. Opis widoku:
   <view_description>

   ### 2.6 Szczegóły tali (read-only)
   - **Ścieżka**: `/decks/:deckId`
   - **Główny cel**: centralny widok pracy z talią: wgląd i akcje.
   - **Kluczowe informacje do wyświetlenia**:
     - Nazwa tali.
     - "Do powtórki" (z listy lub z odświeżenia listy, jeśli dostępne).
     - Sekcja fiszek: lista + filtr statusu.
   - **Kluczowe komponenty widoku**:
     - Jawny przycisk "Wróć do listy".
     - Akcje tali:
       - "Edytuj" (primary) -> `/decks/:deckId/edit`
       - "Usuń" (destructive) -> dialog potwierdzenia
     - Akcje fiszek (na tym samym ekranie):
       - "Dodaj fiszkę" (secondary)
       - "Generuj fiszki" (secondary/primary w kontekście sekcji fiszek)
       - "Rozpocznij powtórkę" (primary, gdy są fiszki do powtórki; w MVP może być zawsze aktywny, ale UI powinien obsłużyć pustą sesję)
     - Filtr fiszek: Wszystkie / Niezweryfikowane / Zaakceptowano (mapowanie na `status=all|unverified|accepted`).
     - Stany: loading, error (ekran błędu z retry), 404 (dedykowany ekran "Talia nie istnieje" + powrót do listy).
   - **UX, dostępność i bezpieczeństwo**:
     - Dostępność: czytelne grupowanie akcji (talia vs fiszki), kolejność tabulacji.
     - Bezpieczeństwo: usuwanie wymaga potwierdzenia; po 401 reset stanu i login.

   ### 2.8 Dodanie fiszki manualnie (inline w szczegółach tali)
   - **Ścieżka**: realizowane w `/decks/:deckId` (bez osobnego routu)
   - **Główny cel**: szybkie dodanie zaakceptowanej fiszki.
   - **Kluczowe informacje**: przód (<=200), tył (<=500).
   - **Kluczowe komponenty widoku**:
     - Inline formularz w liście fiszek lub panel nad listą:
       - pola front/back z licznikami.
       - przyciski "Zapisz" i "Anuluj".
     - Walidacja po stronie UI + błędy z API.
   - **UX, dostępność i bezpieczeństwo**:
     - Guard niezapisanych zmian dla inline tworzenia.
     - Focus po kliknięciu "Dodaj fiszkę" na pierwsze pole.

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
       - "Zaakceptuj wszystkie" -> POST `/v1/decks/{deckId}/cards/accept-all`
       - "Odrzuć wszystkie" -> DELETE `/v1/decks/{deckId}/cards/unverified`
   - **UX, dostępność i bezpieczeństwo**:
     - Dostępność: przyciski z etykietami, dialogi modalne z trap focus, ESC zamyka.
     - Bezpieczeństwo: operacje destrukcyjne wymagają potwierdzenia (co najmniej bulk reject oraz usuwanie zaakceptowanej).
     - Brak cofania odrzucenia: UI jasno komunikuje nieodwracalność w dialogu.
       </view_description>

3. User Stories:
   <user_stories>

   ### US-005

   Tytuł: Zmiana nazwy tali
   Opis: Jako użytkownik chcę zmienić nazwę tali.
   Kryteria akceptacji:
   - Nowa nazwa spełnia limit znaków.
   - Zmiana jest natychmiast widoczna.

   ### US-006

   Tytuł: Usunięcie tali
   Opis: Jako użytkownik chcę usunąć talię, której już nie potrzebuję.
   Kryteria akceptacji:
   - Wyświetlane jest potwierdzenie usunięcia.
   - Usuwane są wszystkie fiszki i dane powtórek.
   - Talia znika z listy.

   ### US-007

   Tytuł: Manualne dodanie fiszki
   Opis: Jako użytkownik chcę ręcznie dodać fiszkę do tali.
   Kryteria akceptacji:
   - Można wpisać przód i tył w limitach znaków.
   - Po zapisie fiszka ma status Zaakceptowano.

   ### US-010

   Tytuł: Weryfikacja fiszki AI
   Opis: Jako użytkownik chcę zaakceptować, edytować lub odrzucić wygenerowaną fiszkę.
   Kryteria akceptacji:
   - Zapis ustawia status Zaakceptowano.
   - Odrzucenie ustawia status Odrzucono i ukrywa fiszkę.
   - Odrzucenia nie można cofnąć.

   ### US-011

   Tytuł: Masowa weryfikacja fiszek
   Opis: Jako użytkownik chcę szybko zaakceptować lub odrzucić wszystkie fiszki AI.
   Kryteria akceptacji:
   - Akcje dostępne tylko dla Niezweryfikowanych.
   - Wszystkie fiszki zmieniają status zgodnie z akcją.

   ### US-012

   Tytuł: Edycja fiszki
   Opis: Jako użytkownik chcę edytować treść fiszki.
   Kryteria akceptacji:
   - Edycja inline z zapisem lub anulowaniem.
   - Zapis ustawia status Zaakceptowano.

   ### US-013

   Tytuł: Usunięcie fiszki
   Opis: Jako użytkownik chcę trwale usunąć fiszkę.
   Kryteria akceptacji:
   - Usunąć można tylko fiszkę Zaakceptowaną.
   - Usunięcie jest nieodwracalne.
     </user_stories>

4. Endpoint Description:
   <endpoint_description>

   #### GET /v1/decks/{deckId}
   - **Description**: Fetch single deck details
   - **Auth**: Required
   - **Response 200**:
     ```json
     {
       "id": "uuid",
       "name": "Deck name",
       "created_at": "timestamptz",
       "last_used_at": "timestamptz",
       "due_cards_count": 12
     }
     ```
   - **Errors**:
     - 401 Unauthorized
     - 404 Not found

   ***

   #### DELETE /v1/decks/{deckId}
   - **Description**: Delete deck with cascade cards deletion
   - **Auth**: Required
   - **Response 204**
   - **Errors**:
     - 401 Unauthorized
     - 404 Not found

   ***

   #### GET /v1/decks/{deckId}/cards
   - **Description**: List cards in a deck
   - **Auth**: Required
   - **Query params**:
     - `status` = `all` | `unverified` | `accepted`
   - **Response 200**:
     ```json
     {
       "items": [
         {
           "id": "uuid",
           "front": "Question",
           "back": "Answer",
           "status": "accepted",
           "next_review_at": "timestamptz"
         }
       ]
     }
     ```
   - **Errors**:
     - 401 Unauthorized
     - 404 Deck not found

   ***

   #### POST /v1/decks/{deckId}/cards
   - **Description**: Manually create card (accepted immediately)
   - **Auth**: Required
   - **Request**:
     ```json
     {
       "front": "Question",
       "back": "Answer"
     }
     ```
   - **Response 201**:
     ```json
     {
       "id": "uuid",
       "status": "accepted",
       "next_review_at": "timestamptz"
     }
     ```
   - **Errors**:
     - 400 Validation error
     - 401 Unauthorized
     - 404 Deck not found

   ***

   #### PATCH /v1/cards/{cardId}
   - **Description**: Edit card (always results in status=accepted)
   - **Auth**: Required
   - **Request**:
     ```json
     {
       "front": "Updated front",
       "back": "Updated back"
     }
     ```
   - **Response 200**: updated card
   - **Errors**:
     - 400 Validation error
     - 401 Unauthorized
     - 404 Not found

   ***

   #### DELETE /v1/cards/{cardId}
   - **Description**: Permanently delete card (works for both accepted and unverified)
   - **Auth**: Required
   - **Response 204**
   - **Errors**:
     - 401 Unauthorized
     - 404 Not found
     - 409 Conflict (card is unverified - cannot be deleted via this endpoint)

   ***

   #### POST /v1/cards/{cardId}/accept
   - **Description**: Accept single unverified card (initializes SM-2 scheduling)
   - **Auth**: Required
   - **Response 200**:
     ```json
     {
       "id": "uuid",
       "status": "accepted",
       "next_review_at": "timestamptz"
     }
     ```
   - **Errors**:
     - 401 Unauthorized
     - 404 Not found
     - 409 Card already accepted

   **UWAGA**: Ten endpoint nie jest jeszcze zaimplementowany - wymaga implementacji przed widokiem.

   ***

   #### POST /v1/decks/{deckId}/cards/accept-all
   - **Description**: Accept all unverified cards in deck
   - **Auth**: Required
   - **Response 200**:
     ```json
     {
       "accepted": 15
     }
     ```
   - **Errors**:
     - 401 Unauthorized
     - 404 Deck not found

   ***

   #### DELETE /v1/decks/{deckId}/cards/unverified
   - **Description**: Reject (delete) all unverified cards
   - **Auth**: Required
   - **Response 200**:
     ```json
     {
       "deleted": 8
     }
     ```
   - **Errors**:
     - 401 Unauthorized
     - 404 Deck not found
       </endpoint_description>

5. Endpoint Implementation:
   <endpoint_implementation>
   Referencje do plików implementacji:
   - src/pages/api/v1/decks/[deckId].ts - GET, PATCH, DELETE tali
   - src/pages/api/v1/decks/[deckId]/cards.ts - GET (lista fiszek), POST (manualne tworzenie)
   - src/pages/api/v1/cards/[cardId].ts - PATCH (edycja), DELETE (usuwanie fiszki)
   - src/pages/api/v1/decks/[deckId]/cards/accept-all.ts - POST (bulk accept)
   - src/pages/api/v1/decks/[deckId]/cards/unverified.ts - DELETE (bulk reject)

   Brakujący endpoint do zaimplementowania:
   - POST /v1/cards/{cardId}/accept - akceptacja pojedynczej fiszki
     </endpoint_implementation>

6. Type Definitions:
   <type_definitions>

   ```typescript
   import type { Database } from "./db/database.types";

   // ============================================================================
   // Entity Types (Base types from database)
   // ============================================================================

   export type CardStatus = Database["public"]["Enums"]["card_status"];

   // ============================================================================
   // Deck DTOs
   // ============================================================================

   /**
    * Deck DTO - Basic deck information
    * POST /v1/decks response
    * PATCH /v1/decks/{deckId} response
    */
   export type DeckDTO = Omit<Database["public"]["Tables"]["decks"]["Row"], "owner_id">;

   /**
    * Deck Detail DTO - Full deck information with due cards count
    * GET /v1/decks/{deckId} response
    */
   export type DeckDetailDTO = DeckDTO & {
     due_cards_count: number;
   };

   // ============================================================================
   // Card DTOs
   // ============================================================================

   /**
    * Card DTO - Full card information (without internal fields)
    * POST /v1/decks/{deckId}/cards response
    * PATCH /v1/cards/{cardId} response
    */
   export type CardDTO = Omit<Database["public"]["Tables"]["cards"]["Row"], "owner_id" | "deck_id">;

   /**
    * Card List Item DTO - Card summary for list views
    * Used in GET /v1/decks/{deckId}/cards response
    */
   export type CardListItemDTO = Pick<
     Database["public"]["Tables"]["cards"]["Row"],
     "id" | "front" | "back" | "status" | "next_review_at"
   >;

   /**
    * Card List Response DTO
    * GET /v1/decks/{deckId}/cards response
    */
   export interface CardListResponseDTO {
     items: CardListItemDTO[];
   }

   // ============================================================================
   // Bulk Operations DTOs
   // ============================================================================

   /**
    * Accept All Response DTO
    * POST /v1/decks/{deckId}/cards/accept-all response
    */
   export interface AcceptAllResponseDTO {
     accepted: number;
   }

   /**
    * Delete Unverified Response DTO
    * DELETE /v1/decks/{deckId}/cards/unverified response
    */
   export interface DeleteUnverifiedResponseDTO {
     deleted: number;
   }

   // ============================================================================
   // Command Models (Request Bodies)
   // ============================================================================

   /**
    * Create Card Command
    * POST /v1/decks/{deckId}/cards request
    */
   export type CreateCardCommand = Pick<Database["public"]["Tables"]["cards"]["Insert"], "front" | "back">;

   /**
    * Update Card Command
    * PATCH /v1/cards/{cardId} request
    */
   export type UpdateCardCommand = Required<Pick<Database["public"]["Tables"]["cards"]["Update"], "front" | "back">>;
   ```

   </type_definitions>

7. Tech Stack:
   <tech_stack>
   Frontend - Astro z React dla komponentów interaktywnych:
   - Astro 5 pozwala na tworzenie szybkich, wydajnych stron i aplikacji z minimalną ilością JavaScript
   - React 19 zapewni interaktywność tam, gdzie jest potrzebna
   - TypeScript 5 dla statycznego typowania kodu i lepszego wsparcia IDE
   - Tailwind 4 pozwala na wygodne stylowanie aplikacji
   - Shadcn/ui zapewnia bibliotekę dostępnych komponentów React, na których oprzemy UI

   Backend - Supabase jako kompleksowe rozwiązanie backendowe:
   - Zapewnia bazę danych PostgreSQL
   - Zapewnia SDK w wielu językach, które posłużą jako Backend-as-a-Service
   - Jest rozwiązaniem open source, które można hostować lokalnie lub na własnym serwerze
   - Posiada wbudowaną autentykację użytkowników
     </tech_stack>

Przed utworzeniem ostatecznego planu wdrożenia przeprowadź analizę i planowanie wewnątrz tagów <implementation_breakdown> w swoim bloku myślenia. Ta sekcja może być dość długa, ponieważ ważne jest, aby być dokładnym.

W swoim podziale implementacji wykonaj następujące kroki:

1. Dla każdej sekcji wejściowej (PRD, User Stories, Endpoint Description, Endpoint Implementation, Type Definitions, Tech Stack):

- Podsumuj kluczowe punkty
- Wymień wszelkie wymagania lub ograniczenia
- Zwróć uwagę na wszelkie potencjalne wyzwania lub ważne kwestie

2. Wyodrębnienie i wypisanie kluczowych wymagań z PRD
3. Wypisanie wszystkich potrzebnych głównych komponentów, wraz z krótkim opisem ich opisu, potrzebnych typów, obsługiwanych zdarzeń i warunków walidacji
4. Stworzenie wysokopoziomowego diagramu drzewa komponentów
5. Zidentyfikuj wymagane DTO i niestandardowe typy ViewModel dla każdego komponentu widoku. Szczegółowo wyjaśnij te nowe typy, dzieląc ich pola i powiązane typy.
6. Zidentyfikuj potencjalne zmienne stanu i niestandardowe hooki, wyjaśniając ich cel i sposób ich użycia
7. Wymień wymagane wywołania API i odpowiadające im akcje frontendowe
8. Zmapuj każdej historii użytkownika do konkretnych szczegółów implementacji, komponentów lub funkcji
9. Wymień interakcje użytkownika i ich oczekiwane wyniki
10. Wymień warunki wymagane przez API i jak je weryfikować na poziomie komponentów
11. Zidentyfikuj potencjalne scenariusze błędów i zasugeruj, jak sobie z nimi poradzić
12. Wymień potencjalne wyzwania związane z wdrożeniem tego widoku i zasugeruj możliwe rozwiązania

Po przeprowadzeniu analizy dostarcz plan wdrożenia w formacie Markdown z następującymi sekcjami:

1. Przegląd: Krótki opis widoku i jego celu.
2. Routing widoku: Określenie ścieżki, na której widok powinien być dostępny.
3. Struktura komponentów: Zarys głównych komponentów i ich hierarchii.
4. Szczegóły komponentu: Dla każdego komponentu należy opisać:

- Opis komponentu, jego przeznaczenie i z czego się składa
- Główne elementy HTML i komponenty dzieci, które budują komponent
- Obsługiwane zdarzenia
- Warunki walidacji (szczegółowe warunki, zgodnie z API)
- Typy (DTO i ViewModel) wymagane przez komponent
- Propsy, które komponent przyjmuje od rodzica (interfejs komponentu)

5. Typy: Szczegółowy opis typów wymaganych do implementacji widoku, w tym dokładny podział wszelkich nowych typów lub modeli widoku według pól i typów.
6. Zarządzanie stanem: Szczegółowy opis sposobu zarządzania stanem w widoku, określenie, czy wymagany jest customowy hook.
7. Integracja API: Wyjaśnienie sposobu integracji z dostarczonym punktem końcowym. Precyzyjnie wskazuje typy żądania i odpowiedzi.
8. Interakcje użytkownika: Szczegółowy opis interakcji użytkownika i sposobu ich obsługi.
9. Warunki i walidacja: Opisz jakie warunki są weryfikowane przez interfejs, których komponentów dotyczą i jak wpływają one na stan interfejsu
10. Obsługa błędów: Opis sposobu obsługi potencjalnych błędów lub przypadków brzegowych.
11. Kroki implementacji: Przewodnik krok po kroku dotyczący implementacji widoku.

Upewnij się, że Twój plan jest zgodny z PRD, historyjkami użytkownika i uwzględnia dostarczony stack technologiczny.

Ostateczne wyniki powinny być w języku polskim i zapisane w pliku o nazwie .ai/deck-details-view-implementation-plan.md. Nie uwzględniaj żadnej analizy i planowania w końcowym wyniku.
