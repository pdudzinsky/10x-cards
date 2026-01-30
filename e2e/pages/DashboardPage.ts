import { Page, Locator } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly logoutButton: Locator;
  readonly emptyState: Locator;
  readonly createDeckButton: Locator;
  readonly deckList: Locator;
  readonly deckNameInput: Locator;
  readonly deckSaveButton: Locator;
  readonly deckCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logoutButton = page.locator('[data-testid="logout-button"]');
    this.emptyState = page.locator('[data-testid="decks-empty-state"]');
    this.createDeckButton = page.locator('[data-testid="create-deck-button"]');
    this.deckList = page.locator('[data-testid="deck-list"]');
    this.deckNameInput = page.locator('[data-testid="deck-name-input"]');
    this.deckSaveButton = page.locator('[data-testid="deck-save-button"]');
    this.deckCancelButton = page.locator('[data-testid="deck-cancel-button"]');
  }

  async goto() {
    await this.page.goto("/decks", { waitUntil: "networkidle" });

    // Wait for React to hydrate and page to be interactive
    // Check if we have decks (button visible) or empty state (empty state visible)
    await Promise.race([
      this.createDeckButton.waitFor({ state: "visible", timeout: 10000 }),
      this.emptyState.waitFor({ state: "visible", timeout: 10000 }),
    ]);
  }

  async logout() {
    await this.logoutButton.click();
  }

  async createDeck(name: string) {
    await this.createDeckButton.click();

    // Wait for dialog to open
    await this.deckNameInput.waitFor({ state: "visible", timeout: 5000 });
    await this.deckNameInput.fill(name);

    // Click save and wait for API request to complete and dialog to close
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().includes("/api/v1/decks") &&
          response.request().method() === "POST" &&
          response.status() === 201, // API returns 201 Created
        { timeout: 10000 }
      ),
      this.deckSaveButton.click(),
    ]);

    // Wait for dialog to close
    await this.deckNameInput.waitFor({ state: "hidden", timeout: 5000 });

    // Wait for refetch to complete
    await this.page.waitForResponse(
      (response) => response.url().includes("/api/v1/decks") && response.request().method() === "GET",
      { timeout: 10000 }
    );
  }

  async getDeckByName(name: string): Promise<Locator> {
    return this.page.locator(`[data-testid="deck-list-item"]:has-text("${name}")`);
  }

  async openDeckByName(name: string) {
    const deckItem = await this.getDeckByName(name);
    await deckItem.click();

    // Wait for navigation to deck detail page
    await this.page.waitForURL(/\/decks\/[0-9a-f-]{36}$/, { timeout: 10000 });
    await this.page.waitForLoadState("networkidle");

    // Wait for page to be fully interactive (add button visible means React is hydrated)
    await this.page.locator('[data-testid="add-card-button"]').waitFor({ state: "visible", timeout: 15000 });
  }
}
