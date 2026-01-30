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

    // Wait for form to be fully interactive (React hydrated)
    await expect(this.emailInput).toBeVisible();
    await expect(this.emailInput).toBeEditable();
    await expect(this.submitButton).toBeVisible();
  }

  async login(email: string, password: string, waitForRedirect = false) {
    // Use fill() instead of focus() + keyboard.type() - more reliable
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    // Wait for button to be enabled
    await expect(this.submitButton).toBeEnabled({ timeout: 10000 });

    if (waitForRedirect) {
      // Click submit and wait for navigation to complete
      // This prevents race condition where we check URL before redirect happens
      await Promise.all([this.page.waitForURL("/decks", { timeout: 10000 }), this.submitButton.click()]);
    } else {
      // Just click submit without waiting for navigation
      await this.submitButton.click();
      // Wait for request to complete (either success or error)
      await this.page.waitForResponse((response) => response.url().includes("/api/v1/auth/login"), {
        timeout: 10000,
      });
    }
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}
