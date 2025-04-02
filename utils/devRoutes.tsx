import React from "react";
import { DynamicRouteService } from "../services/dynamicRoutes";
import { bugsnagService } from "../services/bugsnag";
import { importComponentDynamically } from "./dynamicImport";
import { DYNAMIC_ROUTES } from "../constants/routes";

/**
 * Registriert Development-Routes, die nur im DEV-Modus verfügbar sind
 */
export function registerDevRoutes(): void {
  if (!__DEV__) return;

  try {
    // Registriere die Debug-Tools-Route mit dem Helper
    DynamicRouteService.registerRoute(
      DYNAMIC_ROUTES.DEV_TOOLS,
      (): React.ComponentType<Record<string, unknown>> => {
        return importComponentDynamically(
          "../dev-tools/BugsnagTest",
          "default",
          "Fehler beim Laden der Debug-Tools"
        );
      }
    );

    bugsnagService.leaveBreadcrumb("Debug route registered");
  } catch (error: unknown) {
    bugsnagService.notify(
      error instanceof Error ? error : new Error(String(error))
    );

    console.error(
      "Fehler beim Registrieren der Debug-Route:",
      error instanceof Error ? error.message : String(error)
    );
  }
}
