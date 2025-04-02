import React from "react";
import { bugsnagService } from "../services/bugsnag";
import { ErrorFallback } from "../components/development/ErrorFallback";

// Statische Importe für alle möglichen Komponenten
import BugsnagTest from "../dev-tools/BugsnagTest";
// Weitere Komponenten hier importieren falls nötig

// Komponenten-Mapping statt dynamischem Import
const componentMap: Record<string, Record<string, React.ComponentType<any>>> = {
  "../dev-tools/BugsnagTest": {
    default: BugsnagTest,
  },
  // Weitere Module hier hinzufügen
};

/**
 * Importiert eine Komponente aus einem vordefinierten Mapping
 */
export function importComponentDynamically(
  modulePath: string,
  exportName: string = "default",
  errorMessage: string = "Fehler beim Laden der Komponente"
): React.ComponentType<Record<string, unknown>> {
  try {
    const moduleExports = componentMap[modulePath];

    if (!moduleExports) {
      throw new Error(`Modul ${modulePath} nicht gefunden`);
    }

    const Component = moduleExports[exportName];

    if (!Component) {
      throw new Error(
        `Komponente ${exportName} nicht in ${modulePath} gefunden`
      );
    }

    return Component;
  } catch (error: unknown) {
    bugsnagService.notify(
      error instanceof Error ? error : new Error(String(error))
    );

    console.error(
      `Fehler beim Laden von ${modulePath}:`,
      error instanceof Error ? error.message : String(error)
    );

    return () => <ErrorFallback message={errorMessage} />;
  }
}
