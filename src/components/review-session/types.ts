// Typ oceny SM-2
export type ReviewGrade = 0 | 1 | 2 | 3 | 4 | 5;

// ViewModel dla fiszki w sesji
export interface ReviewCardVM {
  id: string;
  front: string;
  back: string;
}

// ViewModel dla stanu sesji
export interface ReviewSessionVM {
  cards: ReviewCardVM[];
  currentIndex: number;
  totalCards: number;
}

// Stan sesji powtórek
export type ReviewSessionStatus = "loading" | "empty" | "active" | "error";

// Propsy głównego widoku
export interface ReviewSessionViewProps {
  deckId: string;
}

// Opcje hooka useReviewSession
export interface UseReviewSessionOptions {
  deckId: string;
  onUnauthorized?: () => void;
  onDeckNotFound?: () => void;
}

// Wynik hooka useReviewSession
export interface UseReviewSessionResult {
  // Stan
  status: ReviewSessionStatus;
  session: ReviewSessionVM | null;
  currentCard: ReviewCardVM | null;
  error: string | null;
  isSubmitting: boolean;

  // Akcje
  submitGrade: (grade: ReviewGrade) => Promise<void>;
  retry: () => Promise<void>;
}
