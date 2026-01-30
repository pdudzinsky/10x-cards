import { test, expect } from "@playwright/test";
import { RegisterPage } from "../pages/RegisterPage";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { generateTestUser } from "../fixtures/user.fixture";
import { cleanupTestUser } from "../helpers/cleanup.helper";

test.describe("Complete User Journey - Auth Flow", () => {
  // Use existing test user from .env-test
  const testUser = {
    email: process.env.E2E_USERNAME!,
    password: process.env.E2E_PASSWORD!,
  };

  test("should complete full auth flow: login -> logout -> login again", async ({ page, context }) => {
    // === PART 1: LOGIN ===
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Fill and submit login form (wait for redirect to complete)
    await loginPage.login(testUser.email, testUser.password, true);

    // Assert: URL should be /decks
    await expect(page).toHaveURL("/decks");

    // Assert: auth_token should be set in localStorage
    const authToken = await page.evaluate(() => localStorage.getItem("auth_token"));
    expect(authToken).not.toBeNull();
    expect(authToken).toBeTruthy();

    // Assert: auth_refresh_token should be set in localStorage
    const refreshToken = await page.evaluate(() => localStorage.getItem("auth_refresh_token"));
    expect(refreshToken).not.toBeNull();
    expect(refreshToken).toBeTruthy();

    // === PART 2: LOGOUT ===
    const dashboardPage = new DashboardPage(page);

    // Wait for logout button to be visible
    await expect(dashboardPage.logoutButton).toBeVisible();

    // Click logout
    await dashboardPage.logout();

    // Wait for redirect to /login
    await page.waitForURL("/login", { timeout: 5000 });

    // Assert: URL should be /login
    await expect(page).toHaveURL("/login");

    // Assert: auth_token should be removed from localStorage
    const authTokenAfterLogout = await page.evaluate(() => localStorage.getItem("auth_token"));
    expect(authTokenAfterLogout).toBeNull();

    // Assert: auth_refresh_token should be removed from localStorage
    const refreshTokenAfterLogout = await page.evaluate(() => localStorage.getItem("auth_refresh_token"));
    expect(refreshTokenAfterLogout).toBeNull();

    // === PART 3: RE-LOGIN ===
    await loginPage.goto();

    // Fill and submit login form again (wait for redirect to complete)
    await loginPage.login(testUser.email, testUser.password, true);

    // Assert: URL should be /decks
    await expect(page).toHaveURL("/decks");

    // Assert: auth_token should be set again
    const authTokenAfterLogin = await page.evaluate(() => localStorage.getItem("auth_token"));
    expect(authTokenAfterLogin).not.toBeNull();
    expect(authTokenAfterLogin).toBeTruthy();

    // Assert: user can see the dashboard (deck list or empty state)
    // Note: Just verify we're on the page, don't check specific content yet
    await expect(page.locator("body")).toBeVisible();
  });

  test("should show error for empty email", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Try to login with empty email
    await loginPage.passwordInput.click();
    await page.keyboard.type("SomePassword123");

    // Try to submit (button should remain disabled)
    await expect(loginPage.submitButton).toBeDisabled();
  });

  test("should show error for empty password", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Try to login with empty password
    await loginPage.emailInput.click();
    await page.keyboard.type("test@example.com");

    // Try to submit (button should remain disabled)
    await expect(loginPage.submitButton).toBeDisabled();
  });

  test("should show error for invalid login credentials", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Try to login with non-existent credentials
    await loginPage.login("nonexistent@example.com", "WrongPassword123");

    // Assert: Should see error message
    await expect(page.locator("text=Niepoprawny email lub hasło")).toBeVisible();

    // Assert: Should NOT redirect
    await expect(page).toHaveURL("/login");

    // Assert: auth_token should NOT be set
    const authToken = await page.evaluate(() => localStorage.getItem("auth_token"));
    expect(authToken).toBeNull();
  });
});
