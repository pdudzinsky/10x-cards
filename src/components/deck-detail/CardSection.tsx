import { useState } from "react";

import type { CardStatusFilter } from "../../types";
import { AddCardForm } from "./AddCardForm";
import { BulkActions } from "./BulkActions";
import { CardList } from "./CardList";
import { CardStatusFilterComponent } from "./CardStatusFilter";
import type { CardListItemVM } from "./types";
import { Button } from "../ui/button";

interface CardSectionProps {
  deckId: string;
  cards: CardListItemVM[];
  statusFilter: CardStatusFilter;
  isLoading: boolean;
  hasUnverified: boolean;
  unverifiedCount: number;
  onFilterChange: (filter: CardStatusFilter) => void;
  onGenerateAI: () => void;
  onAcceptAll: () => Promise<void>;
  onRejectAll: () => void;
  onCardCreate: (front: string, back: string) => Promise<void>;
  onCardUpdate: (cardId: string, front: string, back: string) => Promise<void>;
  onCardDelete: (cardId: string) => void;
  onCardAccept: (cardId: string) => Promise<void>;
  onCardReject: (cardId: string) => void;
}

export function CardSection({
  cards,
  statusFilter,
  hasUnverified,
  unverifiedCount,
  onFilterChange,
  onGenerateAI,
  onAcceptAll,
  onRejectAll,
  onCardCreate,
  onCardUpdate,
  onCardDelete,
  onCardAccept,
  onCardReject,
}: CardSectionProps) {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);

  const handleAddCard = async (front: string, back: string) => {
    await onCardCreate(front, back);
    setIsAddFormOpen(false);
  };

  const handleStartEdit = (card: CardListItemVM) => {
    setEditingCardId(card.id);
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
  };

  const handleSaveEdit = async (cardId: string, front: string, back: string) => {
    await onCardUpdate(cardId, front, back);
    setEditingCardId(null);
  };

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-semibold">Fiszki</h2>
          <CardStatusFilterComponent value={statusFilter} onChange={onFilterChange} />
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsAddFormOpen(true)}
            disabled={isAddFormOpen}
            size="sm"
            data-testid="add-card-button"
          >
            Dodaj fiszkę
          </Button>
          <Button onClick={onGenerateAI} variant="outline" size="sm">
            Generuj fiszki
          </Button>
        </div>
      </div>

      {/* Bulk Actions */}
      {hasUnverified && statusFilter !== "accepted" && (
        <BulkActions unverifiedCount={unverifiedCount} onAcceptAll={onAcceptAll} onRejectAll={onRejectAll} />
      )}

      {/* Add Card Form */}
      {isAddFormOpen && <AddCardForm onSubmit={handleAddCard} onCancel={() => setIsAddFormOpen(false)} />}

      {/* Card List */}
      <CardList
        cards={cards}
        editingCardId={editingCardId}
        onStartEdit={handleStartEdit}
        onCancelEdit={handleCancelEdit}
        onSaveEdit={handleSaveEdit}
        onDelete={onCardDelete}
        onAccept={onCardAccept}
        onReject={onCardReject}
      />
    </div>
  );
}
