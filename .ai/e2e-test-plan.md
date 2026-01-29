# Plan Testów E2E - 10x-cards

## Zakres

Ten dokument opisuje plan testów end-to-end dla aplikacji 10x-cards, **pomijając funkcjonalności generowania fiszek przez AI**. Fokus na manualnym workflow użytkownika i systemie powtórek.

---

## 📐 Zastosowane wytyczne Playwright

Plan testów został opracowany zgodnie z best practices z `.ai/rules/testing-rules.md`:

✅ **Konfiguracja:** Tylko Chromium/Desktop Chrome browser
✅ **Izolacja:** Browser contexts dla każdego testu
✅ **Maintainability:** Page Object Model (POM) pattern
✅ **Selektory:** Preferowane `data-testid` dla resilient locators
✅ **API Testing:** Wykorzystanie Playwright API dla setup/cleanup
✅ **Debugowanie:** Trace viewer (`trace: 'on-first-retry'`)
✅ **Test Hooks:** `beforeEach`/`afterEach` dla setup/teardown
✅ **Matchers:** Specific Playwright matchers (`toBeVisible`, `toHaveText`, etc.)
✅ **Performance:** Parallel execution (`fullyParallel: true`)

---

## 🔴 Testy KRYTYCZNE (Priorytet 1)

### Test #1: Complete User Journey - Auth Flow

**Cel:** Weryfikacja pełnego cyklu życia użytkownika od rejestracji do wylogowania.

**Ścieżka:**

```
Rejestracja → Auto-login → Dashboard → Wylogowanie → Ponowne logowanie
```

**Pokrycie:** US-001, US-002

**Kroki testowe:**

1. **Rejestracja nowego użytkownika**
   - Otwórz `/register`
   - Wpisz unikalny email: `test-${timestamp}@example.com`
   - Wpisz hasło spełniające wymogi: min 8 znaków, litera + cyfra
   - Kliknij "Zarejestruj"
   - **Asercje:**
     - Przekierowanie na `/dashboard`
     - `localStorage.getItem('auth_token')` jest ustawiony
     - `localStorage.getItem('refresh_token')` jest ustawiony

2. **Wylogowanie**
   - Na dashboardzie kliknij "Wyloguj"
   - **Asercje:**
     - Przekierowanie na `/login`
     - `localStorage.getItem('auth_token')` jest null
     - `localStorage.getItem('refresh_token')` jest null

3. **Ponowne logowanie**
   - Wpisz ten sam email i hasło
   - Kliknij "Zaloguj"
   - **Asercje:**
     - Przekierowanie na `/dashboard`
     - `localStorage.getItem('auth_token')` jest ponownie ustawiony
     - Wyświetlana jest lista tali (może być pusta)

**Walidacje negatywne:**

- Hasło za krótkie (<8 znaków) → komunikat walidacji
- Hasło bez litery lub cyfry → komunikat walidacji
- Email już istnieje → "Konto już istnieje" (409)
- Błędne dane logowania → "Niepoprawny email lub hasło"

**Data testowa:**

- Email: `test-${Date.now()}@example.com`
- Hasło: `TestPass123`

**Cleanup:**

- Usunięcie użytkownika z bazy (kaskadowe usunięcie tali/fiszek)

### Test #2: Zarządzanie Talią + Manualne Tworzenie Fiszek

**Cel:** Weryfikacja podstawowego workflow użytkownika: utworzenie tali i dodanie fiszek manualnie.

**Ścieżka:**

```
Dashboard → Utwórz talię → Dodaj fiszkę → Edytuj fiszkę → Usuń fiszkę
```

**Pokrycie:** US-004, US-007, US-012, US-013

**Prekondycje:**

- Użytkownik zalogowany
- Dashboard otwarty

**Kroki testowe:**

#### Część A: Utworzenie tali

1. **Pusty stan**
   - Na dashboardzie (bez tali) sprawdź:
   - **Asercje:**
     - Komunikat pustego stanu widoczny
     - Przycisk "Utwórz talię" (CTA) widoczny

2. **Utworzenie tali**
   - Kliknij "Utwórz talię"
   - Wpisz nazwę: "Moja pierwsza talia"
   - Kliknij "Zapisz"
   - **Asercje:**
     - Talia pojawia się na liście
     - Licznik "Do powtórki: 0"
     - Sortowanie: ostatnio używana na górze

#### Część B: Dodanie fiszki manualnie

3. **Dodanie pierwszej fiszki**
   - Otwórz talię "Moja pierwsza talia"
   - Kliknij "Dodaj fiszkę"
   - Wpisz przód: "Pytanie 1" (max 200 znaków)
   - Wpisz tył: "Odpowiedź 1" (max 500 znaków)
   - Kliknij "Zapisz"
   - **Asercje:**
     - Fiszka pojawia się na liście
     - Status: "Zaakceptowano" (natychmiast)
     - Event `manual_card_created` zarejestrowany
     - Licznik "Do powtórki" zaktualizowany (jeśli next_review_at <= NOW)

4. **Anulowanie tworzenia fiszki**
   - Kliknij "Dodaj fiszkę"
   - Wpisz przód i tył
   - Kliknij "Anuluj"
   - **Asercje:**
     - Formularz znika
     - Fiszka NIE została dodana do listy

5. **Walidacja limitów znaków**
   - Spróbuj dodać fiszkę z:
     - Przód: 201 znaków → komunikat walidacji
     - Tył: 501 znaków → komunikat walidacji

#### Część C: Edycja fiszki

6. **Edycja inline**
   - Przy fiszce "Pytanie 1 / Odpowiedź 1" kliknij "Edytuj"
   - Zmień przód na: "Pytanie 1 (edytowane)"
   - Zmień tył na: "Odpowiedź 1 (edytowana)"
   - Kliknij "Zapisz"
   - **Asercje:**
     - Zmiany są widoczne od razu
     - Status pozostaje "Zaakceptowano"
     - `updated_at` zaktualizowany w bazie

7. **Anulowanie edycji**
   - Kliknij "Edytuj"
   - Zmień treść
   - Kliknij "Anuluj edycję"
   - **Asercje:**
     - Oryginalna treść pozostaje
     - Formularz edycji znika

#### Część D: Usunięcie fiszki

8. **Usunięcie fiszki**
   - Przy fiszce kliknij "Usuń"
   - **Asercje:**
     - Fiszka znika z listy (usunięcie trwałe)
     - Brak możliwości przywrócenia
     - Można usunąć tylko fiszki "Zaakceptowane"

**Data testowa:**

- Talia: "Moja pierwsza talia"
- Fiszki:
  - "Pytanie 1" / "Odpowiedź 1"
  - "Pytanie 2" / "Odpowiedź 2 z bardzo długim tekstem..."

**Cleanup:**

- Usunięcie tali (kaskadowo usuwa fiszki)

---

## 📋 Podsumowanie testów krytycznych

| #   | Nazwa testu             | Czas wykonania (est.) | Pokrycie US                    |
| --- | ----------------------- | --------------------- | ------------------------------ |
| 1   | Complete Auth Flow      | ~2 min                | US-001, US-002                 |
| 2   | Talia + Manualne fiszki | ~4 min                | US-004, US-007, US-012, US-013 |

**Razem:** ~9 minut na pełen suite testów krytycznych

---

## 🔧 Konfiguracja techniczna

### Playwright Configuration

**playwright.config.ts - podstawowa konfiguracja:**

```typescript
import { defineConfig, devices } from "@playwright/test";
import dotenv from "dotenv";

dotenv.config({ path: ".env-test" });

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true, // Parallel execution dla szybszych testów
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",

  use: {
    baseURL: process.env.PUBLIC_APP_URL || "http://localhost:4321",
    trace: "on-first-retry", // Trace viewer dla debugowania
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Browser contexts dla izolacji
        contextOptions: {
          permissions: [],
        },
      },
    },
    // TYLKO Chromium zgodnie z wytycznymi testing-rules.md
  ],

  webServer: {
    command: "npm run dev",
    url: "http://localhost:4321",
    reuseExistingServer: !process.env.CI,
  },
});
```

### Environment variables (.env-test)

```
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx
PUBLIC_APP_URL=http://localhost:4321
```

### Page Object Model (POM)

**Zastosowanie POM dla maintainability:**

```typescript
// tests/e2e/pages/LoginPage.ts
import { Page, Locator } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    // Używaj data-testid dla resilient locators
    this.emailInput = page.locator('[data-testid="login-email"]');
    this.passwordInput = page.locator('[data-testid="login-password"]');
    this.submitButton = page.locator('[data-testid="login-submit"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto() {
    await this.page.goto("/login");
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}
```

```typescript
// tests/e2e/pages/DashboardPage.ts
import { Page, Locator } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly createDeckButton: Locator;
  readonly deckList: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createDeckButton = page.locator('[data-testid="create-deck-button"]');
    this.deckList = page.locator('[data-testid="deck-list"]');
    this.logoutButton = page.locator('[data-testid="logout-button"]');
  }

  async goto() {
    await this.page.goto("/dashboard");
  }

  async createDeck(name: string) {
    await this.createDeckButton.click();
    await this.page.locator('[data-testid="deck-name-input"]').fill(name);
    await this.page.locator('[data-testid="deck-save-button"]').click();
  }

  async logout() {
    await this.logoutButton.click();
  }
}
```

### Locators Best Practices

**Priorytet selekcji elementów:**

1. **data-testid** (preferowane) - stabilne, niezależne od zmian UI
2. role + accessible name - dla elementów semantycznych
3. text content - tylko dla unikalnych tekstów
4. CSS selectors - ostatnia opcja

```typescript
// ✅ DOBRE - data-testid
page.locator('[data-testid="submit-button"]');

// ✅ DOBRE - role
page.getByRole("button", { name: "Zaloguj" });

// ✅ DOBRE - label
page.getByLabel("Email");

// ⚠️ UNIKAJ - CSS classes (zmieniają się)
page.locator(".btn-primary");

// ❌ ZŁE - xpath
page.locator('//div[@class="form"]/button[1]');
```

### Browser Contexts dla izolacji

**Każdy test w świeżym kontekście:**

```typescript
import { test } from "@playwright/test";

test.describe("Auth Flow", () => {
  // Browser context automatycznie tworzony dla każdego testu
  test("should register new user", async ({ page, context }) => {
    // Fresh context - czyste localStorage, cookies, session storage
    await page.goto("/register");
    // ... test logic
  });

  test("should login existing user", async ({ page, context }) => {
    // Nowy context - nie dziedziczy danych z poprzedniego testu
    await page.goto("/login");
    // ... test logic
  });
});
```

### Test Hooks (Setup & Teardown)

**Przykłady użycia hooks:**

```typescript
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { cleanupTestUser } from "../helpers/cleanup.helper";

test.describe("Deck Management", () => {
  let testEmail: string;
  let testPassword: string;

  // Setup przed każdym testem
  test.beforeEach(async ({ page }) => {
    testEmail = `test-${Date.now()}@example.com`;
    testPassword = "TestPass123";

    // Rejestracja użytkownika przed każdym testem
    const loginPage = new LoginPage(page);
    await page.goto("/register");
    await page.locator('[data-testid="register-email"]').fill(testEmail);
    await page.locator('[data-testid="register-password"]').fill(testPassword);
    await page.locator('[data-testid="register-submit"]').click();

    // Czekaj na auto-login
    await page.waitForURL("/dashboard");
  });

  // Cleanup po każdym teście
  test.afterEach(async ({ page }) => {
    // Wylogowanie
    await page.locator('[data-testid="logout-button"]').click();

    // Usunięcie użytkownika z bazy (API call)
    await cleanupTestUser(testEmail);
  });

  test("should create new deck", async ({ page }) => {
    // Test logic - użytkownik już zalogowany dzięki beforeEach
    await page.locator('[data-testid="create-deck-button"]').click();
    // ...
  });
});
```

### API Testing dla setup/cleanup

**Wykorzystanie Playwright API testing:**

```typescript
// tests/e2e/helpers/api.helper.ts
import { request } from "@playwright/test";

export async function createTestUser(email: string, password: string) {
  const context = await request.newContext({
    baseURL: process.env.PUBLIC_APP_URL,
  });

  const response = await context.post("/api/v1/auth/register", {
    data: { email, password },
  });

  return response.json();
}

export async function deleteTestUser(email: string) {
  const context = await request.newContext({
    baseURL: process.env.PUBLIC_APP_URL,
    extraHTTPHeaders: {
      Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
    },
  });

  await context.delete(`/api/v1/admin/users?email=${email}`);
}

export async function createTestDeck(userId: string, deckName: string) {
  const context = await request.newContext({
    baseURL: process.env.PUBLIC_APP_URL,
  });

  const response = await context.post("/api/v1/decks", {
    data: { name: deckName, user_id: userId },
  });

  return response.json();
}
```

### Test data management

**Unikalność:**

```typescript
const uniqueEmail = `test-${Date.now()}@example.com`;
const uniqueDeckName = `Test Deck ${Date.now()}`;
```

**Cleanup strategy:**

1. **API-based cleanup** (preferowane) - szybsze, niezależne od UI
2. **UI-based cleanup** - jako fallback
3. Playwright `test.afterEach()` hook
4. Helper functions: `cleanupTestUser(email: string)`, `cleanupTestDeck(deckId: string)`

### Specific Matchers

**Używaj dedykowanych matcherów Playwright:**

```typescript
// ✅ Visibility
await expect(page.locator('[data-testid="deck-list"]')).toBeVisible();
await expect(page.locator('[data-testid="loading"]')).toBeHidden();

// ✅ Text content
await expect(page.locator('[data-testid="error"]')).toHaveText("Niepoprawny email");
await expect(page.locator('[data-testid="deck-name"]')).toContainText("Moja talia");

// ✅ Attributes
await expect(page.locator('[data-testid="submit"]')).toBeDisabled();
await expect(page.locator('[data-testid="email"]')).toHaveAttribute("type", "email");

// ✅ Count
await expect(page.locator('[data-testid="card-item"]')).toHaveCount(3);

// ✅ URL
await expect(page).toHaveURL("/dashboard");
await expect(page).toHaveURL(/\/decks\/\d+/);

// ✅ localStorage
await expect(page).toHaveLocalStorage("auth_token");
```

### Flakiness prevention

**Waity i stabilność:**

```typescript
// Czekaj na redirect
await page.waitForURL("/dashboard");

// Czekaj na localStorage
await page.waitForFunction(() => localStorage.getItem("auth_token") !== null);

// Czekaj na widoczność elementu
await expect(page.locator('[data-testid="deck-list"]')).toBeVisible();

// Czekaj na zniknięcie loadera
await expect(page.locator('[data-testid="loading-spinner"]')).toBeHidden();

// Czekaj na response API
await page.waitForResponse((response) => response.url().includes("/api/v1/decks") && response.status() === 200);

// Czekaj na selektor (auto-waiting)
await page.locator('[data-testid="submit"]').click(); // Auto-wait built-in
```

**Timeouts:**

- Default action timeout: 10s
- Navigation timeout: 15s
- API calls: max 5s

### Parallel Execution

**Konfiguracja:**

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true, // Wszystkie testy równolegle
  workers: process.env.CI ? 1 : undefined, // CI: sequential, local: parallel
});

// Wyłączenie parallel dla konkretnego suite (jeśli potrzebne)
test.describe.configure({ mode: "serial" });
test.describe("Sequential tests", () => {
  test("test 1", async ({ page }) => {
    /* ... */
  });
  test("test 2", async ({ page }) => {
    /* ... */
  });
});
```

### Trace Viewer dla debugowania

**Automatyczne trace on failure:**

```typescript
// playwright.config.ts
use: {
  trace: 'on-first-retry', // Tworzy trace przy pierwszym retry
  screenshot: 'only-on-failure',
  video: 'retain-on-failure',
}
```

**Uruchomienie trace viewer:**

```bash
# Po failed teście
npx playwright show-trace trace.zip

# Lub w interaktywnym UI mode
npx playwright test --ui
```

**Trace zawiera:**

- Timeline wykonania testu
- Screenshots każdego kroku
- Network requests/responses
- Console logs
- DOM snapshots

---

## 🎯 Kryteria sukcesu

✅ Wszystkie 3 testy krytyczne przechodzą (green)
✅ Czas wykonania < 10 minut
✅ Brak false positives (flaky tests)
✅ 100% pokrycie happy path dla MVP
✅ Coverage kluczowych asercji:

- localStorage auth_token
- Status fiszki "Zaakceptowano"
- Parametry SM-2 aktualizowane
- Eventy analytics rejestrowane

---

## 📁 Struktura plików testowych

```
tests/e2e/
├── critical/
│   ├── 01-auth-flow.spec.ts              # Test #1: Complete Auth Flow
│   ├── 02-deck-and-cards.spec.ts         # Test #2: Deck + Cards CRUD
│   └── 03-review-session.spec.ts         # Test #3: Review Session (future)
│
├── pages/                                 # Page Object Model
│   ├── LoginPage.ts
│   ├── RegisterPage.ts
│   ├── DashboardPage.ts
│   ├── DeckDetailPage.ts
│   └── ReviewPage.ts
│
├── fixtures/                              # Test data factories
│   ├── user.fixture.ts
│   ├── deck.fixture.ts
│   └── card.fixture.ts
│
├── helpers/                               # Helper functions
│   ├── api.helper.ts                     # API testing dla setup/cleanup
│   ├── auth.helper.ts                    # Auth utilities
│   ├── cleanup.helper.ts                 # Cleanup functions
│   └── assertions.helper.ts              # Custom assertions
│
└── playwright.config.ts                   # Playwright configuration
```

**Przykład fixture:**

```typescript
// tests/e2e/fixtures/user.fixture.ts
export function generateTestUser() {
  return {
    email: `test-${Date.now()}@example.com`,
    password: "TestPass123",
  };
}

export function generateTestDeck() {
  return {
    name: `Test Deck ${Date.now()}`,
  };
}
```
