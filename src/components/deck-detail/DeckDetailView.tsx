import { useCallback, useState } from "react";

import { CardSection } from "./CardSection";
import { DeckHeader } from "./DeckHeader";
import { DeleteCardDialog } from "./DeleteCardDialog";
import { DeleteDeckDialog } from "./DeleteDeckDialog";
import { EditDeckDialog } from "./EditDeckDialog";
import { ErrorScreen } from "./ErrorScreen";
import { useDeckDetail } from "./hooks/useDeckDetail";
import { useDialogs } from "./hooks/useDialogs";
import { NotFoundScreen } from "./NotFoundScreen";
import { RejectAllDialog } from "./RejectAllDialog";
import { Skeleton } from "../ui/skeleton";

interface DeckDetailViewProps {
  deckId: string;
}

export function DeckDetailView({ deckId }: DeckDetailViewProps) {
  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh_token");
    window.location.href = "/login";
  }, []);

  const {
    status,
    deck,
    cards,
    statusFilter,
    isCardsLoading,
    error,
    hasUnverified,
    unverifiedCount,
    setStatusFilter,
    refetch,
    updateDeck,
    deleteDeck,
    createCard,
    updateCard,
    deleteCard,
    acceptCard,
    acceptAll,
    rejectAll,
  } = useDeckDetail({
    deckId,
    onUnauthorized: handleUnauthorized,
  });

  const { dialogs, openDeleteDeck, closeDeleteDeck, openDeleteCard, closeDeleteCard, openRejectAll, closeRejectAll } =
    useDialogs();

  // Edit deck dialog state
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  // Handlers
  const handleBack = useCallback(() => {
    window.location.href = "/decks";
  }, []);

  const handleEdit = useCallback(() => {
    setUpdateError(null);
    setIsEditDialogOpen(true);
  }, []);

  const handleUpdateDeck = useCallback(
    async (name: string) => {
      setIsUpdating(true);
      setUpdateError(null);

      try {
        await updateDeck(name);
        setIsEditDialogOpen(false);
      } catch (err) {
        if (err instanceof Error) {
          setUpdateError(err.message);
        } else {
          setUpdateError("Nie udało się zaktualizować tali");
        }
      } finally {
        setIsUpdating(false);
      }
    },
    [updateDeck]
  );

  const handleStartReview = useCallback(() => {
    window.location.href = `/decks/${deckId}/review`;
  }, [deckId]);

  const handleGenerateAI = useCallback(() => {
    window.location.href = `/decks/${deckId}/ai-generate`;
  }, [deckId]);

  const handleDeleteDeck = useCallback(async () => {
    await deleteDeck();
    closeDeleteDeck();
  }, [deleteDeck, closeDeleteDeck]);

  const handleDeleteCard = useCallback(async () => {
    if (dialogs.deleteCard.cardId) {
      await deleteCard(dialogs.deleteCard.cardId);
      closeDeleteCard();
    }
  }, [dialogs.deleteCard.cardId, deleteCard, closeDeleteCard]);

  const handleRejectAll = useCallback(async () => {
    await rejectAll();
    closeRejectAll();
  }, [rejectAll, closeRejectAll]);

  const handleCardDelete = useCallback(
    (cardId: string) => {
      openDeleteCard(cardId);
    },
    [openDeleteCard]
  );

  const handleCardReject = useCallback(
    (cardId: string) => {
      openDeleteCard(cardId);
    },
    [openDeleteCard]
  );

  // Render loading state
  if (status === "loading") {
    return (
      <div className="container mx-auto max-w-4xl space-y-6 px-4 py-8">
        <Skeleton className="h-10 w-32" />
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    );
  }

  // Render not found state
  if (status === "notFound") {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <NotFoundScreen onBack={handleBack} />
      </div>
    );
  }

  // Render error state
  if (status === "error" || !deck) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <ErrorScreen message={error || "Nie udało się załadować tali"} onRetry={refetch} />
      </div>
    );
  }

  // Render ready state
  return (
    <div className="container mx-auto max-w-4xl space-y-8 px-4 py-8">
      <DeckHeader
        deck={deck}
        onBack={handleBack}
        onEdit={handleEdit}
        onDelete={openDeleteDeck}
        onStartReview={handleStartReview}
      />

      <CardSection
        deckId={deckId}
        cards={cards}
        statusFilter={statusFilter}
        isLoading={isCardsLoading}
        hasUnverified={hasUnverified}
        unverifiedCount={unverifiedCount}
        onFilterChange={setStatusFilter}
        onGenerateAI={handleGenerateAI}
        onAcceptAll={acceptAll}
        onRejectAll={openRejectAll}
        onCardCreate={createCard}
        onCardUpdate={updateCard}
        onCardDelete={handleCardDelete}
        onCardAccept={acceptCard}
        onCardReject={handleCardReject}
      />

      {/* Dialogs */}
      <EditDeckDialog
        open={isEditDialogOpen}
        currentName={deck.name}
        onOpenChange={setIsEditDialogOpen}
        onUpdateDeck={handleUpdateDeck}
        isUpdating={isUpdating}
        errorMessage={updateError}
      />

      <DeleteDeckDialog
        isOpen={dialogs.deleteDeck}
        deckName={deck.name}
        onConfirm={handleDeleteDeck}
        onCancel={closeDeleteDeck}
      />

      <DeleteCardDialog isOpen={dialogs.deleteCard.isOpen} onConfirm={handleDeleteCard} onCancel={closeDeleteCard} />

      <RejectAllDialog
        isOpen={dialogs.rejectAll}
        count={unverifiedCount}
        onConfirm={handleRejectAll}
        onCancel={closeRejectAll}
      />
    </div>
  );
}
