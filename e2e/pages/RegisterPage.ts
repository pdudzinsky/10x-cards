import { Page, Locator, expect } from "@playwright/test";

export class RegisterPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="register-email"]');
    this.passwordInput = page.locator('[data-testid="register-password"]');
    this.confirmPasswordInput = page.locator('[data-testid="register-confirm-password"]');
    this.submitButton = page.locator('[data-testid="register-submit"]');
    this.errorMessage = page.locator(".rounded-md.bg-destructive\\/10");
  }

  async goto() {
    await this.page.goto("/register", { waitUntil: "networkidle" });
    // Wait for React to hydrate
    await this.page.waitForTimeout(1000);
    // Ensure form is visible and interactive
    await expect(this.emailInput).toBeVisible();
    await expect(this.submitButton).toBeVisible();
  }

  async register(email: string, password: string, confirmPassword?: string) {
    // Click and type email
    await this.emailInput.click();
    await this.page.keyboard.type(email);

    // Click and type password
    await this.passwordInput.click();
    await this.page.keyboard.type(password);

    // Click and type confirm password
    await this.confirmPasswordInput.click();
    await this.page.keyboard.type(confirmPassword || password);

    // Wait for button to be enabled
    await expect(this.submitButton).toBeEnabled({ timeout: 10000 });

    await this.submitButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}
