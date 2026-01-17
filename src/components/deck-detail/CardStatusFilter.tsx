import type { CardStatusFilter } from "../../types";
import { Button } from "../ui/button";

interface CardStatusFilterProps {
  value: CardStatusFilter;
  onChange: (value: CardStatusFilter) => void;
}

const filterOptions: { value: CardStatusFilter; label: string }[] = [
  { value: "all", label: "Wszystkie" },
  { value: "unverified", label: "Niezweryfikowane" },
  { value: "accepted", label: "Zaakceptowane" },
];

export function CardStatusFilterComponent({ value, onChange }: CardStatusFilterProps) {
  return (
    <div className="flex gap-2">
      {filterOptions.map((option) => (
        <Button
          key={option.value}
          variant={value === option.value ? "default" : "outline"}
          size="sm"
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </Button>
      ))}
    </div>
  );
}
