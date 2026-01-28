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

- Github Actions do tworzenia pipeline'ów CI/CD
- DigitalOcean do hostowania aplikacji za pośrednictwem obrazu docker

Testowanie:

- Vitest jako główny test runner dla testów jednostkowych i integracyjnych (natywne wsparcie dla TypeScript i ESM)
- @testing-library/react do testowania komponentów React z user-centric queries
- @testing-library/user-event do symulacji realistycznych interakcji użytkownika
- MSW (Mock Service Worker) do mockowania API na poziomie network layer
- Playwright do testów E2E (cross-browser) oraz testów API
- axe-playwright do automatycznych testów dostępności zgodnych z WCAG 2.1
- Artillery do testów obciążeniowych API (Node.js-native, prostsze od k6)
- Lighthouse CI do monitorowania wydajności frontend i Core Web Vitals
