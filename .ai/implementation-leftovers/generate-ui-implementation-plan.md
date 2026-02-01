Jako starszy programista frontendu Twoim zadaniem jest stworzenie szczegółowego planu wdrożenia nowego widoku w aplikacji internetowej. Plan ten powinien być kompleksowy i wystarczająco jasny dla innego programisty frontendowego, aby mógł poprawnie i wydajnie wdrożyć widok.

Najpierw przejrzyj następujące informacje:

1. Product Requirements Document (PRD):
   <prd>
   @.ai/prd.md
   </prd>

2. Opis widoku:
   <view_description>

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
   </view_description>

5. User Stories:
   <user_stories>

### US-014

Tytuł: Rozpoczęcie sesji powtórek
Opis: Jako użytkownik chcę rozpocząć powtórkę fiszek z tali.
Kryteria akceptacji:

- Do sesji trafiają tylko fiszki do powtórki.
- Rejestrowany jest event rozpoczęcia sesji.

### US-015

Tytuł: Ocena fiszki w powtórce
Opis: Jako użytkownik chcę ocenić trudność fiszki.
Kryteria akceptacji:

- Dostępna skala 0-5.
- Ocena aktualizuje harmonogram SM-2.

### US-016

Tytuł: Zakończenie sesji powtórek
Opis: Jako użytkownik chcę móc zakończyć sesję w dowolnym momencie.
Kryteria akceptacji:

- Przycisk „Zakończ” zawsze dostępny.
- Po zakończeniu następuje powrót do widoku tali.
  </user_stories>

4. Endpoint Description:
   <endpoint_description>

### 2.6 Reviews

#### POST /v1/decks/{deckId}/reviews/start

- **Description**: Start review session and update last_used_at
- **Auth**: Required
- **Response 200**:
  ```json
  {
    "cards": [
      {
        "id": "uuid",
        "front": "Question",
        "back": "Answer"
      }
    ]
  }
  ```
- **Errors**:
  - 401 Unauthorized
  - 404 Deck not found

---

#### POST /v1/reviews/{cardId}/answer

- **Description**: Submit SM-2 grade for a card
- **Auth**: Required
- **Request**:
  ```json
  {
    "grade": 4
  }
  ```
- **Response 200**:
  ```json
  {
    "next_review_at": "timestamptz",
    "interval_days": 6,
    "ease_factor": 2.46
  }
  ```
- **Errors**:
  - 400 Invalid grade (must be 0-5)
  - 401 Unauthorized
  - 404 Card not found
    </endpoint_description>

5. Endpoint Implementation:
   <endpoint_implementation>
   @src/pages/api/v1/decks/[deckId]/reviews/start.ts
   @src/pages/api/v1/reviews/[cardId]/answer.ts
   </endpoint_implementation>

6. Type Definitions:
   <type_definitions>
   @types.ts
   </type_definitions>

7. Tech Stack:
   <tech_stack>
   @.ai/tech-stack.md
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

1. Przegląd: Krótkie podsumowanie widoku i jego celu.
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

Ostateczne wyniki powinny być w języku polskim i zapisane w pliku o nazwie .ai/{view-name}-view-implementation-plan.md. Nie uwzględniaj żadnej analizy i planowania w końcowym wyniku.

Oto przykład tego, jak powinien wyglądać plik wyjściowy (treść jest do zastąpienia):

```markdown
# Plan implementacji widoku [Nazwa widoku]

## 1. Przegląd

[Krótki opis widoku i jego celu]

## 2. Routing widoku

[Ścieżka, na której widok powinien być dostępny]

## 3. Struktura komponentów

[Zarys głównych komponentów i ich hierarchii]

## 4. Szczegóły komponentów

### [Nazwa komponentu 1]

- Opis komponentu [opis]
- Główne elementy: [opis]
- Obsługiwane interakcje: [lista]
- Obsługiwana walidacja: [lista, szczegółowa]
- Typy: [lista]
- Propsy: [lista]

### [Nazwa komponentu 2]

[...]

## 5. Typy

[Szczegółowy opis wymaganych typów]

## 6. Zarządzanie stanem

[Opis zarządzania stanem w widoku]

## 7. Integracja API

[Wyjaśnienie integracji z dostarczonym endpointem, wskazanie typów żądania i odpowiedzi]

## 8. Interakcje użytkownika

[Szczegółowy opis interakcji użytkownika]

## 9. Warunki i walidacja

[Szczegółowy opis warunków i ich walidacji]

## 10. Obsługa błędów

[Opis obsługi potencjalnych błędów]

## 11. Kroki implementacji

1. [Krok 1]
2. [Krok 2]
3. [...]
```

Rozpocznij analizę i planowanie już teraz. Twój ostateczny wynik powinien składać się wyłącznie z planu wdrożenia w języku polskim w formacie markdown, który zapiszesz w pliku .ai/{view-name}-view-implementation-plan.md i nie powinien powielać ani powtarzać żadnej pracy wykonanej w podziale implementacji.
