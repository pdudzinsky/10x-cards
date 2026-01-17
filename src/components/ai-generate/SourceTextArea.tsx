import type { SourceTextAreaProps } from "./types";
import { Textarea } from "../ui/textarea";
import { cn } from "@/lib/utils";

const MAX_TEXT_LENGTH = 10000;

export function SourceTextArea({ value, onChange, error, disabled }: SourceTextAreaProps) {
  const characterCount = value.length;
  const isOverLimit = characterCount > MAX_TEXT_LENGTH;

  return (
    <div className="space-y-2">
      <label htmlFor="source-text" className="text-sm font-medium">
        Tekst źródłowy
      </label>
      <Textarea
        id="source-text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className={cn("min-h-[200px] resize-y", error && "border-destructive focus-visible:ring-destructive")}
        placeholder="Wklej tekst, z którego mają zostać wygenerowane fiszki (minimum 50 znaków)"
        aria-label="Tekst źródłowy do generowania fiszek"
        aria-describedby={error ? "source-text-error" : "source-text-counter"}
        aria-invalid={!!error}
      />
      <div className="flex items-center justify-between text-sm">
        {error ? (
          <span id="source-text-error" className="text-destructive" role="alert">
            {error}
          </span>
        ) : (
          <span className="text-muted-foreground">Minimum 50 znaków wymagane</span>
        )}
        <span
          id="source-text-counter"
          className={cn("text-muted-foreground", isOverLimit && "text-destructive font-semibold")}
        >
          {characterCount} / {MAX_TEXT_LENGTH}
        </span>
      </div>
    </div>
  );
}
