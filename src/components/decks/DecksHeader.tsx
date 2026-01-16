import { CreateDeckButton } from "./CreateDeckButton";

interface DecksHeaderProps {
  onCreateClick: () => void;
  isCreating: boolean;
}

export function DecksHeader({ onCreateClick, isCreating }: DecksHeaderProps) {
  return (
    <header className="mb-6 flex items-center justify-between">
      <h1 className="text-2xl font-bold">Twoje talie</h1>
      <CreateDeckButton onClick={onCreateClick} disabled={isCreating} />
    </header>
  );
}
