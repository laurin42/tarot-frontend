import * as SplashScreen from "expo-splash-screen";
import { bugsnagService } from "../services/bugsnag";

/**
 * Initialisiert den SplashScreen und verhindert automatisches Ausblenden
 */
export function initializeSplashScreen(): void {
  try {
    SplashScreen.preventAutoHideAsync().catch((error: unknown) => {
      bugsnagService.notify(
        error instanceof Error
          ? error
          : new Error("Failed to prevent splash screen auto hiding")
      );
    });
  } catch (error: unknown) {
    bugsnagService.notify(
      error instanceof Error
        ? error
        : new Error("Error in SplashScreen.preventAutoHideAsync()")
    );
  }
}