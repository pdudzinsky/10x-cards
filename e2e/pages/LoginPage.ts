import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="login-email"]');
    this.passwordInput = page.locator('[data-testid="login-password"]');
    this.submitButton = page.locator('[data-testid="login-submit"]');
    this.errorMessage = page.locator(".rounded-md.bg-destructive\\/10");
  }

  async goto() {
    await this.page.goto("/login", { waitUntil: "networkidle" });
    // Wait for React to hydrate
    await this.page.waitForTimeout(1000);
    // Ensure form is visible and interactive
    await expect(this.emailInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async login(email: string, password: string) {
    // Focus and type email using keyboard API
    await this.emailInput.focus();
    await this.page.keyboard.type(email);

    // Focus and type password
    await this.passwordInput.focus();
    await this.page.keyboard.type(password);

    // Wait for button to be enabled
    await expect(this.submitButton).toBeEnabled({ timeout: 10000 });

    await this.submitButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}
