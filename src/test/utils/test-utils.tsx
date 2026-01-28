import { render, type RenderOptions } from "@testing-library/react";
import type { ReactElement } from "react";

/**
 * Custom render function that wraps components with common providers
 */
export function renderWithProviders(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">) {
  // Add common providers here when needed (e.g., ThemeProvider, QueryClientProvider)
  return render(ui, { ...options });
}

// Re-export everything from testing library
export * from "@testing-library/react";
export { renderWithProviders as render };
