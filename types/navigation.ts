// Entferne die ungenutzten Imports
import type { Href } from "expo-router";

// Wir definieren einen Route-Typ
export type Route = string;

/**
 * Wandelt einen Route-String in einen gültigen Navigationstyp für expo-router um
 * @param route Der zu konvertierende Route-String
 * @returns Ein für expo-router kompatibler Navigationsparameter
 */
export function toValidRoute(route: Route): Href {
  // Dies ist ein Trick, um TypeScript zufriedenzustellen
  // Wir wissen, dass die Routen gültig sind, auch wenn TypeScript es nicht erkennt
  return { pathname: route } as unknown as Href;
}

/**
 * Konstanten für alle App-Routen mit korrekter Typisierung
 */
export const APP_ROUTES = {
  TABS: {
    THREECARDS: "/(tabs)/threeCards" as Route,
    DAILYCARD: "/(tabs)/dailyCard" as Route,
    PROFILE: "/(tabs)/profile" as Route,
  },
  AUTH: "/(auth)" as Route,
  HOME: "/" as Route,
};