import React, { createContext, useState, useCallback, useContext } from "react";
import { bugsnagService } from "../../services/bugsnag";
import {
  DynamicRoute,
  DynamicRoutesContextType,
} from "../../services/dynamicRoutes";

// Kontext für dynamische Routen
export const DynamicRoutesContext = createContext<DynamicRoutesContextType>({
  routes: [],
  registerRoute: () => {},
  getRouteComponent: () => null,
});

export function DynamicRoutesProvider({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const [routes, setRoutes] = useState<DynamicRoute[]>([]);

  // Implementierung des Route-Registrierens
  const registerRoute = useCallback(
    (
      path: string,
      component: React.ComponentType<Record<string, unknown>>
    ): void => {
      try {
        console.log(`Registering route: ${path}`);
        setRoutes((prevRoutes) => {
          const existingRouteIndex = prevRoutes.findIndex(
            (route) => route.path === path
          );
          if (existingRouteIndex >= 0) {
            const updatedRoutes = [...prevRoutes];
            updatedRoutes[existingRouteIndex] = { path, component };
            return updatedRoutes;
          } else {
            return [...prevRoutes, { path, component }];
          }
        });

        bugsnagService.leaveBreadcrumb("Route registered", { path });
      } catch (error: unknown) {
        bugsnagService.notify(
          error instanceof Error
            ? error
            : new Error(`Failed to register route: ${path}`)
        );
      }
    },
    []
  );

  const getRouteComponent = useCallback(
    (path: string): React.ComponentType<Record<string, unknown>> | null => {
      try {
        const route = routes.find((r) => r.path === path);
        return route ? route.component : null;
      } catch (error: unknown) {
        bugsnagService.notify(
          error instanceof Error
            ? error
            : new Error(`Failed to get route component: ${path}`)
        );
        return null;
      }
    },
    [routes]
  );

  return (
    <DynamicRoutesContext.Provider
      value={{ routes, registerRoute, getRouteComponent }}
    >
      {children}
    </DynamicRoutesContext.Provider>
  );
}

// Hook zum Verwenden der dynamischen Routen
export function useDynamicRoutes(): DynamicRoutesContextType {
  return useContext(DynamicRoutesContext);
}
