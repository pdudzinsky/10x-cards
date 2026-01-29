import { Page, Locator } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logoutButton = page.locator('[data-testid="logout-button"]');
  }

  async goto() {
    await this.page.goto("/decks");
  }

  async logout() {
    await this.logoutButton.click();
  }
}
