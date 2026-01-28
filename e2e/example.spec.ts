import { test, expect } from "@playwright/test";
import AxeBuilder from "axe-playwright";

test.describe("Homepage", () => {
  test("should load successfully", async ({ page }) => {
    // Navigate to the homepage
    await page.goto("/");

    // Verify the page loaded
    await expect(page).toHaveTitle(/10x-cards/i);
  });

  test("should be accessible", async ({ page }) => {
    // Navigate to the homepage
    await page.goto("/");

    // Run accessibility tests
    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    // Assert no accessibility violations
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("should have correct meta description", async ({ page }) => {
    // Navigate to the homepage
    await page.goto("/");

    // Get meta description
    const metaDescription = await page.locator('meta[name="description"]');

    // Assert meta description exists
    await expect(metaDescription).toHaveCount(1);
  });
});
