import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/LoginPage";
import { DashboardPage } from "../pages/DashboardPage";
import { DeckDetailPage } from "../pages/DeckDetailPage";
import { generateTestDeck } from "../fixtures/deck.fixture";
import { generateTestCard, generateTestCardWithText, generateTooLongCard } from "../fixtures/card.fixture";
import { cleanupUserData } from "../helpers/cleanup.helper";

test.describe.configure({ mode: "serial" });

test.describe("Deck Management + Manual Card Creation", () => {
  // Use existing test user from .env-test
  const testUser = {
    id: process.env.E2E_USERNAME_ID ?? "",
    email: process.env.E2E_USERNAME ?? "",
    password: process.env.E2E_PASSWORD ?? "",
  };

  let deckName: string;

  // Setup: Cleanup and login before each test
  test.beforeEach(async ({ page }) => {
    // Cleanup all user data BEFORE test to ensure clean state
    // This uses service role key to bypass RLS - much faster than API
    await cleanupUserData(testUser.id);

    // Login and wait for redirect to complete
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(testUser.email, testUser.password, true);

    // Generate unique deck name for this test
    deckName = generateTestDeck().name;
  });

  // Cleanup: Delete all test data after each test
  test.afterEach(async ({ page }) => {
    // Logout
    const dashboardPage = new DashboardPage(page);

    // Check if we're still logged in
    const currentUrl = page.url();
    if (!currentUrl.includes("/login")) {
      await dashboardPage.goto();
      await dashboardPage.logout();
    }

    // Cleanup all user data
    await cleanupUserData(testUser.id);
  });

  // === PART A: DECK CREATION ===

  test("should show empty state when no decks exist", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Assert: Empty state is visible
    await expect(dashboardPage.emptyState).toBeVisible();

    // Assert: Create deck button is visible in empty state
    const createFirstDeckButton = page.locator('[data-testid="create-first-deck-button"]');
    await expect(createFirstDeckButton).toBeVisible();
  });

  test("should create a new deck successfully", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Create deck
    await dashboardPage.createDeck(deckName);

    // Wait for deck to appear in the list (wait for API refetch to complete)
    const deckItem = await dashboardPage.getDeckByName(deckName);
    await expect(deckItem).toBeVisible({ timeout: 15000 });

    // Assert: Deck has "0 do powtórki" counter
    await expect(deckItem.locator('[data-testid="deck-due-count"]')).toContainText("0");
  });

  test("should cancel deck creation", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Wait for empty state to be visible
    await expect(dashboardPage.emptyState).toBeVisible({ timeout: 10000 });

    // Open create deck dialog
    await dashboardPage.createDeckButton.click();
    await dashboardPage.deckNameInput.fill(deckName);

    // Cancel
    await dashboardPage.deckCancelButton.click();

    // Assert: Dialog is closed
    await expect(dashboardPage.deckNameInput).not.toBeVisible();

    // Assert: Deck was NOT created - empty state should still be visible
    await expect(dashboardPage.emptyState).toBeVisible({ timeout: 5000 });
  });

  // === PART B: MANUAL CARD CREATION ===

  test("should add a card manually", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Create deck and wait for it to appear
    await dashboardPage.createDeck(deckName);
    const deckItem = await dashboardPage.getDeckByName(deckName);
    await expect(deckItem).toBeVisible({ timeout: 15000 });

    // Open deck (waits for navigation to complete)
    await dashboardPage.openDeckByName(deckName);

    const deckDetailPage = new DeckDetailPage(page);

    // Wait for deck detail page to load
    await expect(deckDetailPage.addCardButton).toBeVisible({ timeout: 10000 });

    // Add card
    const card = generateTestCard(1);
    await deckDetailPage.addCard(card.front, card.back);

    // Assert: Card appears in the list
    const cardItem = await deckDetailPage.getCardByText(card.front);
    await expect(cardItem).toBeVisible({ timeout: 15000 });

    // Assert: Card shows correct content
    await expect(cardItem.locator('[data-testid="card-front-text"]')).toHaveText(card.front);
    await expect(cardItem.locator('[data-testid="card-back-text"]')).toHaveText(card.back);
  });

  test("should cancel card creation", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Create deck and wait for it to appear
    await dashboardPage.createDeck(deckName);
    const deckItem = await dashboardPage.getDeckByName(deckName);
    await expect(deckItem).toBeVisible({ timeout: 15000 });

    // Open deck (waits for navigation to complete)
    await dashboardPage.openDeckByName(deckName);

    const deckDetailPage = new DeckDetailPage(page);

    // Wait for deck detail page to load
    await expect(deckDetailPage.addCardButton).toBeVisible({ timeout: 10000 });

    // Open add card form
    await deckDetailPage.addCardButton.click();
    await expect(deckDetailPage.addCardForm).toBeVisible();

    // Fill form
    const card = generateTestCard(1);
    await deckDetailPage.cardFrontInput.fill(card.front);
    await deckDetailPage.cardBackInput.fill(card.back);

    // Cancel
    await deckDetailPage.cardCancelButton.click();

    // Assert: Form is closed
    await expect(deckDetailPage.addCardForm).not.toBeVisible();

    // Assert: Card was NOT created (empty state visible)
    await expect(deckDetailPage.cardListEmpty).toBeVisible();
  });

  test("should validate card character limits", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Create deck and wait for it to appear
    await dashboardPage.createDeck(deckName);
    const deckItem = await dashboardPage.getDeckByName(deckName);
    await expect(deckItem).toBeVisible({ timeout: 15000 });

    // Open deck (waits for navigation to complete)
    await dashboardPage.openDeckByName(deckName);

    const deckDetailPage = new DeckDetailPage(page);

    // Wait for deck detail page to load
    await expect(deckDetailPage.addCardButton).toBeVisible({ timeout: 10000 });

    // Open add card form
    await deckDetailPage.addCardButton.click();

    // Try to add card with too long text
    const tooLongCard = generateTooLongCard();
    await deckDetailPage.cardFrontInput.fill(tooLongCard.front);
    await deckDetailPage.cardBackInput.fill(tooLongCard.back);

    // Try to submit
    await deckDetailPage.cardSaveButton.click();

    // Assert: Validation errors are shown
    await expect(page.locator('[data-testid="card-front-error"]')).toBeVisible();
    await expect(page.locator('[data-testid="card-back-error"]')).toBeVisible();

    // Assert: Form is still open (submission failed)
    await expect(deckDetailPage.addCardForm).toBeVisible();
  });

  // === PART C: CARD EDITING ===

  test("should edit a card successfully", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Create deck and wait for it to appear
    await dashboardPage.createDeck(deckName);
    const deckItem = await dashboardPage.getDeckByName(deckName);
    await expect(deckItem).toBeVisible({ timeout: 15000 });

    // Open deck (waits for navigation to complete)
    await dashboardPage.openDeckByName(deckName);

    const deckDetailPage = new DeckDetailPage(page);

    // Wait for deck detail page to load
    await expect(deckDetailPage.addCardButton).toBeVisible({ timeout: 10000 });

    // Add card
    const originalCard = generateTestCard(1);
    await deckDetailPage.addCard(originalCard.front, originalCard.back);

    // Wait for card to appear
    const originalCardItem = await deckDetailPage.getCardByText(originalCard.front);
    await expect(originalCardItem).toBeVisible({ timeout: 15000 });

    // Edit card
    const editedCard = generateTestCardWithText("Pytanie 1 (edytowane)", "Odpowiedź 1 (edytowana)");
    await deckDetailPage.editCard(originalCard.front, editedCard.front, editedCard.back);

    // Wait for edit mode to close
    await expect(page.locator('[data-testid="card-item-editing"]')).not.toBeVisible({ timeout: 10000 });

    // Assert: Changes are visible
    const cardItem = await deckDetailPage.getCardByText(editedCard.front);
    await expect(cardItem).toBeVisible({ timeout: 10000 });
    await expect(cardItem.locator('[data-testid="card-front-text"]')).toHaveText(editedCard.front);
    await expect(cardItem.locator('[data-testid="card-back-text"]')).toHaveText(editedCard.back);
  });

  test("should cancel card editing", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Create deck and wait for it to appear
    await dashboardPage.createDeck(deckName);
    const deckItem = await dashboardPage.getDeckByName(deckName);
    await expect(deckItem).toBeVisible({ timeout: 15000 });

    // Open deck (waits for navigation to complete)
    await dashboardPage.openDeckByName(deckName);

    const deckDetailPage = new DeckDetailPage(page);

    // Wait for deck detail page to load
    await expect(deckDetailPage.addCardButton).toBeVisible({ timeout: 10000 });

    // Add card
    const originalCard = generateTestCard(1);
    await deckDetailPage.addCard(originalCard.front, originalCard.back);

    // Wait for card to appear
    const cardItem = await deckDetailPage.getCardByText(originalCard.front);
    await expect(cardItem).toBeVisible({ timeout: 15000 });

    // Cancel edit
    await deckDetailPage.cancelCardEdit(originalCard.front);

    // Wait for edit mode to close
    await expect(page.locator('[data-testid="card-item-editing"]')).not.toBeVisible({ timeout: 10000 });

    // Assert: Original content remains
    await expect(cardItem).toBeVisible();
    await expect(cardItem.locator('[data-testid="card-front-text"]')).toHaveText(originalCard.front);
    await expect(cardItem.locator('[data-testid="card-back-text"]')).toHaveText(originalCard.back);
  });

  // === PART D: CARD DELETION ===

  test("should delete a card successfully", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Create deck and wait for it to appear
    await dashboardPage.createDeck(deckName);
    const deckItem = await dashboardPage.getDeckByName(deckName);
    await expect(deckItem).toBeVisible({ timeout: 15000 });

    // Open deck (waits for navigation to complete)
    await dashboardPage.openDeckByName(deckName);

    const deckDetailPage = new DeckDetailPage(page);

    // Wait for deck detail page to load
    await expect(deckDetailPage.addCardButton).toBeVisible({ timeout: 10000 });

    // Add card
    const card = generateTestCard(1);
    await deckDetailPage.addCard(card.front, card.back);

    // Wait for card to appear
    const cardItem = await deckDetailPage.getCardByText(card.front);
    await expect(cardItem).toBeVisible({ timeout: 15000 });

    // Verify card count
    let cardCount = await deckDetailPage.getCardCount();
    expect(cardCount).toBe(1);

    // Delete card
    await deckDetailPage.deleteCard(card.front);

    // Wait for card to disappear
    await expect(cardItem).not.toBeVisible({ timeout: 10000 });

    // Assert: Card is removed from list
    cardCount = await deckDetailPage.getCardCount();
    expect(cardCount).toBe(0);

    // Assert: Empty state is visible
    await expect(deckDetailPage.cardListEmpty).toBeVisible();
  });

  test("should delete one of multiple cards", async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.goto();

    // Create deck and wait for it to appear
    await dashboardPage.createDeck(deckName);
    const deckItem = await dashboardPage.getDeckByName(deckName);
    await expect(deckItem).toBeVisible({ timeout: 15000 });

    // Open deck (waits for navigation to complete)
    await dashboardPage.openDeckByName(deckName);

    const deckDetailPage = new DeckDetailPage(page);

    // Wait for deck detail page to load
    await expect(deckDetailPage.addCardButton).toBeVisible({ timeout: 10000 });

    // Add first card
    const card1 = generateTestCard(1);
    await deckDetailPage.addCard(card1.front, card1.back);

    // Wait for first card to appear
    const card1Item = await deckDetailPage.getCardByText(card1.front);
    await expect(card1Item).toBeVisible({ timeout: 15000 });

    // Add second card
    const card2 = generateTestCard(2);
    await deckDetailPage.addCard(card2.front, card2.back);

    // Wait for second card to appear
    const card2Item = await deckDetailPage.getCardByText(card2.front);
    await expect(card2Item).toBeVisible({ timeout: 15000 });

    // Verify both cards exist
    const cardCount = await deckDetailPage.getCardCount();
    expect(cardCount).toBe(2);

    // Delete first card
    await deckDetailPage.deleteCard(card1.front);

    // Wait for list to stabilize with exactly 1 card remaining
    await expect(async () => {
      const count = await deckDetailPage.getCardCount();
      expect(count).toBe(1);
    }).toPass({ timeout: 10000 });

    // Assert: Second card is still visible
    await expect(card2Item).toBeVisible();
  });
});
