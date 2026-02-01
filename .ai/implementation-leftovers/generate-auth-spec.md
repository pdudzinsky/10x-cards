Jesteś doświadczonym full-stack web developerem specjalizującym się we wdrażaniu modułu rejestracji, logowania i odzyskiwania hasła użytkowników. Opracuj szczegółową architekturę tej funkcjonalności na podstawie wymagań z pliku @project-prd.md (US-001 i US-002 oraz US-003) oraz stacku z <tech-stack>
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

AI - Komunikacja z modelami przez usługę Openrouter.ai:

- Dostęp do szerokiej gamy modeli (OpenAI, Anthropic, Google i wiele innych), które pozwolą nam znaleźć rozwiązanie zapewniające wysoką efektywność i niskie koszta
- Pozwala na ustawianie limitów finansowych na klucze API

CI/CD i Hosting:

- Github Actions do tworzenia pipeline’ów CI/CD
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker

</tech-stack>

Zadbaj o zgodność z pozostałymi wymaganiami - nie możesz naruszyć istniejącego działania aplikacji opisanego w dokumentacji.

Specyfikacja powinna zawierać następujące elementy:

1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

- Dokładny opis zmian w warstwie frontendu (stron, komponentów i layoutów w trybie auth i non-auth), w tym opis nowych elementów oraz tych do rozszerzenia o wymagania autentykacji
- Dokładne rozdzielenie odpowiedzialności pomiędzy formularze i komponenty client-side React a strony Astro, biorąc pod uwagę ich integrację z backendem autentykacji oraz nawigacją i akcjami użytkownika
- Opis przypadków walidacji i komunikatów błędów
- Obsługę najważniejszych scenariuszy

2. LOGIKA BACKENDOWA

- Struktura endpointów API i modeli danych zgodnych z nowymi elementami interfejsu użytkownika
- Mechanizm walidacji danych wejściowych
- Obsługa wyjątków
- Aktualizacja sposobu renderowania wybranych stron server-side biorąc pod uwagę @astro.config.mjs

3. SYSTEM AUTENTYKACJI

- Wykorzystanie Supabase Auth do realizacji funkcjonalności rejestracji, logowania, wylogowywania i odzyskiwania konta w połączeniu z Astro

Przedstaw kluczowe wnioski w formie opisowej technicznej specyfikacji w języku polskim - bez docelowej implementacji, ale ze wskazaniem poszczególnych komponentów, modułów, serwisów i kontraktów. Po ukończeniu zadania, utwórz plik .ai/auth-spec.md i dodaj tam całą specyfikację.
