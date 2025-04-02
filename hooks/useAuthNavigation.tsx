import { useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { bugsnagService } from "../services/bugsnag";
import { APP_ROUTES } from "../constants/routes";
import { useAuth } from "../context/AuthContext";
import { toValidRoute } from "../types/navigation";

/**
 * Prüft, ob der Wert ein dynamischer Routenpfad ist (beginnt mit /)
 */
function isDynamicRoutePath(value: unknown): boolean {
  if (typeof value !== "string") return false;
  return value.charAt(0) === "/";
}

/**
 * Hook für die authentifizierungsbasierte Navigation
 * Leitet den Benutzer automatisch zur richtigen Route weiter
 */
export function useAuthNavigation(): void {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    try {
      if (isLoading) return;

      // Sicherstellen, dass segments ein Array ist
      if (!Array.isArray(segments)) return;

      const firstSegment = segments[0];
      // Typensicherere Variante mit explizitem String-Vergleich
      const inAuthGroup =
        typeof firstSegment === "string" &&
        (firstSegment as string) === "(auth)";

      // Typsichere Prüfung auf dynamische Routen
      const isDynamicRoute = isDynamicRoutePath(firstSegment);

      if (isDynamicRoute) {
        // Bei dynamischen Routen keine Umleitung
        return;
      }

      if (isAuthenticated && inAuthGroup) {
        router.replace(toValidRoute(APP_ROUTES.TABS.THREECARDS));
        bugsnagService.leaveBreadcrumb("Redirected authenticated user", {
          navigation: {
            from: "(auth)",
            to: APP_ROUTES.TABS.THREECARDS,
          },
        });
      } else if (
        !isAuthenticated &&
        !inAuthGroup &&
        firstSegment !== undefined
      ) {
        router.replace(toValidRoute(APP_ROUTES.AUTH));
        bugsnagService.leaveBreadcrumb("Redirected unauthenticated user", {
          navigation: {
            from: String(firstSegment), // Sicherer String-Cast
            to: APP_ROUTES.AUTH,
          },
        });
      }
    } catch (error: unknown) {
      bugsnagService.notify(
        error instanceof Error
          ? error
          : new Error(`Navigation error in auth routing: ${String(error)}`)
      );
    }
  }, [isAuthenticated, segments, isLoading, router]);
}
