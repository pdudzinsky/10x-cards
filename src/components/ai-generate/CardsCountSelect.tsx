import type { CardsCountSelectProps } from "./types";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

export function CardsCountSelect({ value, onChange, disabled }: CardsCountSelectProps) {
  return (
    <div className="space-y-2">
      <label htmlFor="cards-count" className="text-sm font-medium">
        Liczba fiszek do wygenerowania
      </label>
      <Select
        value={value.toString()}
        onValueChange={(val) => onChange(Number(val) as 5 | 10 | 20)}
        disabled={disabled}
      >
        <SelectTrigger id="cards-count" className="w-full">
          <SelectValue placeholder="Wybierz liczbę fiszek" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="5">5 fiszek</SelectItem>
          <SelectItem value="10">10 fiszek</SelectItem>
          <SelectItem value="20">20 fiszek</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
