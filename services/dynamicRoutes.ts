import React, { ComponentType } from 'react';
import type { Router } from 'expo-router';

// Typensichere Route-Pfade
export type CustomRoutePathString = `/dev-tools` | `/debug` | `/bugsnag-test`;

// Typdefinition für eine dynamische Route
export interface DynamicRoute {
  path: string;
  component: ComponentType<Record<string, unknown>>;
}

// Typen für den Kontext
export interface DynamicRoutesContextType {
  routes: DynamicRoute[];
  registerRoute: (path: string, component: ComponentType<Record<string, unknown>>) => void;
  getRouteComponent: (path: string) => ComponentType<Record<string, unknown>> | null;
}

// Globaler Store für die dynamischen Routen
const pendingRoutes: DynamicRoute[] = [];

/**
 * Service für die Verwaltung dynamischer Routen
 */
export const DynamicRouteService = {
  /**
   * Registriert eine neue dynamische Route
   */
  registerRoute(path: CustomRoutePathString, getComponent: () => ComponentType<Record<string, unknown>>): void {
    try {
      const component = getComponent();
      if (component) {
        pendingRoutes.push({ path, component });
      } else {
        console.error(`Komponente für Pfad ${path} konnte nicht geladen werden`);
      }
    } catch (error: unknown) {
      console.error(
        `Fehler beim Registrieren der Route ${path}:`, 
        error instanceof Error ? error.message : String(error)
      );
    }
  },
  
  /**
   * Gibt alle registrierten Routen zurück
   */
  getPendingRoutes(): ReadonlyArray<DynamicRoute> {
    return [...pendingRoutes];
  },
  
  /**
   * Leert die Liste der ausstehenden Routen
   */
  clearPendingRoutes(): void {
    pendingRoutes.length = 0;
  }
};

/**
 * Hilfsfunktion für typsicheres Routing zu dynamischen Routen
 */
export function navigateToCustomPath(
  router: Router, // ✅ Verwende den korrekten Expo Router Typ
  path: CustomRoutePathString
): void {
  // Da der Router Typ-Einschränkungen hat, benötigen wir einen Cast
  // Dies ist sicher, da wir die Pfade durch CustomRoutePathString einschränken
  router.push(path as any);
}