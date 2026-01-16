import { FolderOpen } from "lucide-react";

import { Button } from "@/components/ui/button";

interface DecksEmptyStateProps {
  onCreateClick: () => void;
}

export function DecksEmptyState({ onCreateClick }: DecksEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FolderOpen className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="mb-2 text-lg font-medium">Nie masz jeszcze żadnych tali</h3>
      <p className="mb-4 text-muted-foreground">Utwórz swoją pierwszą talię, aby rozpocząć naukę</p>
      <Button onClick={onCreateClick}>Utwórz talię</Button>
    </div>
  );
}
