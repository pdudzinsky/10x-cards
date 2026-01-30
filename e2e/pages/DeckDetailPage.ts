import { Page, Locator } from "@playwright/test";

export class DeckDetailPage {
  readonly page: Page;
  readonly addCardButton: Locator;
  readonly addCardForm: Locator;
  readonly cardFrontInput: Locator;
  readonly cardBackInput: Locator;
  readonly cardSaveButton: Locator;
  readonly cardCancelButton: Locator;
  readonly cardList: Locator;
  readonly cardListEmpty: Locator;
  readonly deleteCardConfirmButton: Locator;
  readonly deleteCardCancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.addCardButton = page.locator('[data-testid="add-card-button"]');
    this.addCardForm = page.locator('[data-testid="add-card-form"]');
    this.cardFrontInput = page.locator('[data-testid="card-front-input"]');
    this.cardBackInput = page.locator('[data-testid="card-back-input"]');
    this.cardSaveButton = page.locator('[data-testid="card-save-button"]');
    this.cardCancelButton = page.locator('[data-testid="card-cancel-button"]');
    this.cardList = page.locator('[data-testid="card-list"]');
    this.cardListEmpty = page.locator('[data-testid="card-list-empty"]');
    this.deleteCardConfirmButton = page.locator('[data-testid="delete-card-confirm-button"]');
    this.deleteCardCancelButton = page.locator('[data-testid="delete-card-cancel-button"]');
  }

  async goto(deckId: string) {
    await this.page.goto(`/decks/${deckId}`, { waitUntil: "networkidle" });

    // Wait for React to hydrate and page to be interactive
    await this.addCardButton.waitFor({ state: "visible", timeout: 10000 });
  }

  async addCard(front: string, back: string) {
    await this.addCardButton.click();
    await this.cardFrontInput.waitFor({ state: "visible" });
    await this.cardFrontInput.fill(front);
    await this.cardBackInput.fill(back);

    // Click save and wait for API request to complete
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().match(/\/api\/v1\/decks\/[0-9a-f-]{36}\/cards$/) &&
          response.request().method() === "POST" &&
          response.status() === 201, // API returns 201 Created
        { timeout: 10000 }
      ),
      this.cardSaveButton.click(),
    ]);

    // Wait for form to close
    await this.addCardForm.waitFor({ state: "hidden", timeout: 5000 });
  }

  async getCardByText(text: string): Promise<Locator> {
    // Find card by exact match on front text
    return this.page.locator(`[data-testid="card-item"]`).filter({
      has: this.page.locator(`[data-testid="card-front-text"]:text("${text}")`),
    });
  }

  async editCard(originalText: string, newFront: string, newBack: string) {
    const cardItem = await this.getCardByText(originalText);
    await cardItem.locator('[data-testid="card-edit-button"]').click();

    // Wait for edit mode
    await this.page.locator('[data-testid="card-item-editing"]').waitFor();

    // Edit the card
    await this.cardFrontInput.fill(newFront);
    await this.cardBackInput.fill(newBack);

    // Click save and wait for API request to complete
    await Promise.all([
      this.page.waitForResponse(
        (response) =>
          response.url().match(/\/api\/v1\/cards\/[a-f0-9\-]+$/) &&
          response.request().method() === "PATCH" &&
          response.status() === 200,
        { timeout: 10000 }
      ),
      this.page.locator('[data-testid="card-save-edit-button"]').click(),
    ]);

    // Wait for edit mode to close
    await this.page.locator('[data-testid="card-item-editing"]').waitFor({ state: "hidden", timeout: 5000 });
  }

  async cancelCardEdit(originalText: string) {
    const cardItem = await this.getCardByText(originalText);
    await cardItem.locator('[data-testid="card-edit-button"]').click();

    // Wait for edit mode
    await this.page.locator('[data-testid="card-item-editing"]').waitFor();

    // Cancel edit
    await this.page.locator('[data-testid="card-cancel-edit-button"]').click();
  }

  async deleteCard(text: string) {
    const cardItem = await this.getCardByText(text);
    await cardItem.locator('[data-testid="card-delete-button"]').click();

    // Wait for delete confirmation dialog
    await this.deleteCardConfirmButton.waitFor({ state: "visible" });

    // Setup response listeners BEFORE clicking
    const deletePromise = this.page.waitForResponse(
      (response) =>
        response.url().match(/\/api\/v1\/cards\/[a-f0-9\-]+$/) &&
        response.request().method() === "DELETE" &&
        response.status() === 204,
      { timeout: 10000 }
    );

    const refetchPromise = this.page.waitForResponse(
      (response) =>
        response.url().match(/\/api\/v1\/decks\/[a-f0-9\-]+\/cards/) && response.request().method() === "GET",
      { timeout: 15000 }
    );

    // Confirm deletion
    await this.deleteCardConfirmButton.click();

    // Wait for both API calls to complete
    await Promise.all([deletePromise, refetchPromise]);

    // Wait for dialog to close
    await this.deleteCardConfirmButton.waitFor({ state: "hidden", timeout: 5000 });
  }

  async getCardCount(): Promise<number> {
    const cards = this.page.locator('[data-testid="card-item"]');
    return await cards.count();
  }
}
