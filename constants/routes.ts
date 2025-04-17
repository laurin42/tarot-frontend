import type { Route } from '@/types/navigation';

/**
 * Typsichere Routenkonstanten für die Navigation
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

/**
 * Konstanten für dynamische Routen
 */
export const DYNAMIC_ROUTES = {
  DEV_TOOLS: "/dev-tools" as const,
};