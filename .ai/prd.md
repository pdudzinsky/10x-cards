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

### 3.1 Konta użytkowników
- Rejestracja użytkownika przy użyciu adresu email i hasła.
- Logowanie email + hasło.
- Reset hasła poprzez link wysyłany na email.
- Brak integracji zewnętrznych (SSO, social login).
- Dane użytkownika wykorzystywane wyłącznie do przechowywania tali i fiszek.

### 3.2 Strona główna i talie
- Lista tali użytkownika po zalogowaniu.
- Pusty stan z komunikatem i CTA „Utwórz talię”.
- Sortowanie tali według „ostatnio używana”.
- Dla każdej tali wyświetlana liczba fiszek „Do powtórki”.
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
- Akcja „Dodaj fiszkę” w widoku tali.
- Wprowadzanie przodu i tyłu inline.
- Zapis powoduje natychmiastowe ustawienie statusu Zaakceptowano.
- Możliwość anulowania tworzenia przed zapisem.

### 3.5 Generowanie fiszek przez AI
- Akcja „Generuj fiszki” w widoku tali.
- Ekran generowania zawiera:
    - Jedno pole wklejania tekstu (tylko język polski).
    - Limit 10 000 znaków.
    - Dropdown liczby fiszek: 5, 10 lub 20.
    - Przyciski „Generuj” i „Anuluj”.
- Jedno kliknięcie „Generuj” zużywa 1 generację.
- Limit 5 generacji dziennie na użytkownika, liczony w strefie Europe/Warsaw.
- Po udanej generacji:
    - Użytkownik wraca do widoku tali.
    - Nowe fiszki mają status Niezweryfikowane.
- Surowy tekst wejściowy nie jest przechowywany.

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
- Przyciski „Zapisz” i „Anuluj edycję”.
- Zapis ustawia status Zaakceptowano.
- Usuwanie:
    - Tylko dla fiszek Zaakceptowanych.
    - Usunięcie trwałe, bez możliwości przywrócenia.

### 3.8 Powtórki
- Wbudowany algorytm SM-2 lub równoważny.
- Do powtórek kwalifikują się tylko fiszki Zaakceptowane z next_review_at <= teraz.
- Akcja „Rozpocznij powtórkę” w widoku tali.
- Sesja powtórek:
    - Prezentuje fiszki jedna po drugiej.
    - Użytkownik ocenia każdą fiszkę w skali 0-5.
    - Ocena aktualizuje parametry SM-2 i next_review_at.
    - Przycisk „Zakończ” dostępny w każdej chwili.
    - Brak podsumowania po zakończeniu sesji.
- Po zakończeniu przekierowanie do widoku tali.

### 3.9 Obsługa błędów
- Komunikaty błędów:
    - Przekroczono limit dzienny.
    - Tekst za długi.
    - Błąd generacji, spróbuj ponownie.
    - Anulowano.
- Przy błędzie generacji fiszki nie są tworzone.

### 3.10 Analityka i logi
- Oddzielne mechanizmy:
    - Logi techniczne (debug).
    - Metryki produktowe (eventy).
- Rejestrowane eventy:
    - generate_clicked
    - cards_generated_count
    - card_saved
    - card_edited_saved
    - card_rejected
    - manual_card_created
    - review_session_started

## 4. Granice produktu
- Brak aplikacji mobilnych.
- Brak importu plików (PDF, DOCX, itp.).
- Brak współdzielenia tali między użytkownikami.
- Brak integracji z zewnętrznymi platformami edukacyjnymi.
- Brak zaawansowanych algorytmów powtórek (SuperMemo, Anki).
- Brak wykrywania duplikatów.
- Brak działań compliance związanych z AI w MVP.
- Brak wsparcia dla języków innych niż polski.

## 5. Historyjki użytkowników

### US-001
Tytuł: Rejestracja konta
Opis: Jako nowy użytkownik chcę założyć konto przy użyciu emaila i hasła, aby móc przechowywać swoje fiszki.
Kryteria akceptacji:
- Użytkownik może podać email i hasło.
- Konto zostaje utworzone po poprawnej walidacji.
- Użytkownik może się zalogować po rejestracji.

### US-002
Tytuł: Logowanie do aplikacji
Opis: Jako użytkownik chcę zalogować się do aplikacji, aby uzyskać dostęp do swoich tali.
Kryteria akceptacji:
- Logowanie wymaga poprawnego emaila i hasła.
- Błędne dane skutkują komunikatem o błędzie.
- Po zalogowaniu użytkownik widzi stronę główną.

### US-003
Tytuł: Reset hasła
Opis: Jako użytkownik chcę zresetować hasło, jeśli go zapomnę.
Kryteria akceptacji:
- Użytkownik może zażądać resetu hasła podając email.
- Otrzymuje link resetujący hasło.
- Po ustawieniu nowego hasła może się zalogować.

### US-004
Tytuł: Utworzenie tali
Opis: Jako użytkownik chcę utworzyć nową talię, aby grupować fiszki tematycznie.
Kryteria akceptacji:
- Można podać nazwę 1-100 znaków.
- Talia pojawia się na liście tali.

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

### US-008
Tytuł: Generowanie fiszek przez AI
Opis: Jako użytkownik chcę wygenerować fiszki z wklejonego tekstu.
Kryteria akceptacji:
- Tekst w języku polskim, do 10 000 znaków.
- Można wybrać 5, 10 lub 20 fiszek.
- Limit dzienny 5 generacji jest egzekwowany.
- Po sukcesie fiszki mają status Niezweryfikowane.

### US-009
Tytuł: Obsługa błędu generacji
Opis: Jako użytkownik chcę otrzymać jasny komunikat, gdy generacja się nie powiedzie.
Kryteria akceptacji:
- Wyświetlany jest odpowiedni komunikat błędu.
- Fiszki nie są tworzone.

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

## 6. Metryki sukcesu

### 6.1 Akceptacja fiszek AI
- Metryka: (card_saved + card_edited_saved) / cards_generated_count.
- Cel: co najmniej 75%.

### 6.2 Udział AI w tworzeniu fiszek
- Metryka: AI_accepted_created / (AI_accepted_created + manual_created).
- Okno czasowe: 7 dni.
- Poziom agregacji: per aktywny użytkownik.
- Cel: co najmniej 75%.