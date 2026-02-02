import { useCallback, useState } from "react";

import { ApiError, createDeck } from "./api";
import { CreateDeckDialog } from "./CreateDeckDialog";
import { DecksContent } from "./DecksContent";
import { DecksHeader } from "./DecksHeader";
import { useDecksList } from "./useDecksList";

export function DecksPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const handleUnauthorized = useCallback(() => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_refresh_token");
    window.location.href = "/login";
  }, []);

  const { vm, actions } = useDecksList({
    onUnauthorized: handleUnauthorized,
  });

  const handleOpenDialog = useCallback(() => {
    setCreateError(null);
    setDialogOpen(true);
  }, []);

  const handleCreateDeck = useCallback(
    async (name: string) => {
      setIsCreating(true);
      setCreateError(null);

      try {
        await createDeck({ name });
        setDialogOpen(false);
        actions.reset();
      } catch (error) {
        if (error instanceof ApiError) {
          if (error.status === 401) {
            handleUnauthorized();
            return;
          }
          setCreateError(error.message);
        } else {
          setCreateError("Nie udało się utworzyć tali");
        }
      } finally {
        setIsCreating(false);
      }
    },
    [actions, handleUnauthorized]
  );

  return (
    <main className="container mx-auto max-w-3xl px-4 py-8">
      <DecksHeader onCreateClick={handleOpenDialog} isCreating={isCreating} />

      <DecksContent
        vm={vm}
        onRetry={actions.retry}
        onPrev={actions.goPrev}
        onNext={actions.goNext}
        onCreateClick={handleOpenDialog}
      />

      <CreateDeckDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreateDeck={handleCreateDeck}
        isCreating={isCreating}
        errorMessage={createError}
      />
    </main>
  );
}
