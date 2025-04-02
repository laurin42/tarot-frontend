import { bugsnagService } from "../services/bugsnag";

export function setupWebTheme(): void {
  if (typeof document !== "undefined") {
    try {
      document.documentElement.classList.add("darkMode");
    } catch (error: unknown) {
      bugsnagService.notify(
        error instanceof Error
          ? error
          : new Error("Failed to add dark mode class")
      );
    }
  }
}