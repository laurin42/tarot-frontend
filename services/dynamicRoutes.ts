import  { ComponentType } from 'react';
import type { Router } from 'expo-router';

// typsafe routes
export type CustomRoutePathString = `/dev-tools` | `/debug` | `/bugsnag-test`;

// Typ definition for dynamic Routes
export interface DynamicRoute {
  path: string;
  component: ComponentType<Record<string, unknown>>;
}

// Types for the context
export interface DynamicRoutesContextType {
  routes: DynamicRoute[];
  registerRoute: (path: string, component: ComponentType<Record<string, unknown>>) => void;
  getRouteComponent: (path: string) => ComponentType<Record<string, unknown>> | null;
}

// Globaler store for dynamic routes
const pendingRoutes: DynamicRoute[] = [];

/**
 * Service for managing dynamic routes
 */
export const DynamicRouteService = {
  /**
   * Registers a new dynamic route
   */
  registerRoute(path: CustomRoutePathString, getComponent: () => ComponentType<Record<string, unknown>>): void {
    try {
      const component = getComponent();
      if (component) {
        pendingRoutes.push({ path, component });
      } else {
        console.error(`component for path ${path} could not be loaded`);
      }
    } catch (error: unknown) {
      console.error(
        `Error registering route ${path}:`, 
        error instanceof Error ? error.message : String(error)
      );
    }
  },
  
  /**
   * Returns all registered routes
   */
  getPendingRoutes(): readonly DynamicRoute[] {
    return [...pendingRoutes];
  },
  
  /**
   * Clears the list of pending routes
   */
  clearPendingRoutes(): void {
    pendingRoutes.length = 0;
  }
};

/**
* Helper function for type-safe routing to dynamic routes
 */
export function navigateToCustomPath(
  router: Router, // ✅ Use the correct Expo Router type
  path: CustomRoutePathString
): void {
  // Since the Router type has type constraints, we need a cast
  // This is safe because we restrict the paths through CustomRoutePathString
  router.push(path as any);
}