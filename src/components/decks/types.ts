// ============================================================================
// ViewModel Types for Decks List View
// ============================================================================

/**
 * Deck list item view model (mapped from DeckListItemDTO)
 */
export interface DeckListItemVM {
  id: string;
  name: string;
  dueCardsCount: number;
  lastUsedAt?: string;
}

/**
 * Pagination view model with computed fields
 */
export interface PaginationVM {
  limit: number;
  offset: number;
  total: number;
  currentPage: number;
  totalPages: number;
  hasPrev: boolean;
  hasNext: boolean;
}

/**
 * Error view model
 */
export interface DecksErrorVM {
  message: string;
}

/**
 * Create deck form view model
 */
export interface CreateDeckFormVM {
  name: string;
  nameError: string | null;
}

/**
 * Main view model for DecksListView
 */
export interface DecksListVM {
  status: "loading" | "error" | "ready";
  items: DeckListItemVM[];
  pagination: PaginationVM;
  error: DecksErrorVM | null;
}
