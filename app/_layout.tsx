import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";
import "../global.css";
import { UserProvider } from "../context/UserContext";
import { AuthProvider, useAuth } from "../context/AuthContext";
import { DynamicRouteService, DynamicRoute } from "../services/dynamicRoutes";
import { bugsnagService } from "../services/bugsnag";
import {
  DynamicRoutesProvider,
  useDynamicRoutes,
} from "../components/routing/DynamicRoutesProvider";
import { DynamicRouteRenderer } from "../components/routing/DynamicRouteRenderer";
import { DevMenu } from "../components/development/DevMenu";
import { setupWebTheme } from "../utils/setupTheme";
import { registerDevRoutes } from "../utils/devRoutes";
import { useAuthNavigation } from "../hooks/useAuthNavigation";
import { ErrorDisplay } from "../components/ui/ErrorDisplay";
import { LoadingScreen } from "../components/ui/LoadingScreen";
import { initializeSplashScreen } from "../utils/splashScreen";
import * as SplashScreen from "expo-splash-screen";
import React, { useState } from "react";
import { Stack } from "expo-router";
import { Text, View } from "react-native";
import { assetManager, AssetPriority } from "../utils/assetPreloader";
import { tarotDeckOptimizer } from "../utils/tarotDeckOptimizer";
import { tarotCards } from "../constants/tarotcards"; // Deine bestehende Kartendefinition

// Kritische Assets für App-Start definieren
const CRITICAL_IMAGES = [
  require("../assets/images/splash.png"),
  require("../assets/images/icon.png"),
  require("../assets/images/logo.png"),
];

// Prevent the splash screen from auto-hiding before asset loading is complete.
initializeSplashScreen();

// Navigationskomponente mit dynamischen Routen
function RootLayoutNav(): JSX.Element {
  const { isLoading } = useAuth();
  const segments = useSegments();
  // const router = useRouter(); // <-- ENTFERNEN oder für zukünftige Verwendung kommentieren
  const { registerRoute } = useDynamicRoutes();

  // Auth-Navigation Hook
  useAuthNavigation();

  // Setup-Code bei der ersten Renderung ausführen
  useEffect(() => {
    setupWebTheme();
    registerDevRoutes();
  }, []);

  // Registriere alle ausstehenden Routen
  useEffect(() => {
    try {
      const pendingRoutes: ReadonlyArray<DynamicRoute> =
        DynamicRouteService.getPendingRoutes();

      if (pendingRoutes.length > 0) {
        pendingRoutes.forEach(({ path, component }) => {
          registerRoute(path, component);
        });
        DynamicRouteService.clearPendingRoutes();
        // Bei Zahlen als Metadaten
        bugsnagService.leaveBreadcrumb("Pending routes registered", {
          routes: { count: pendingRoutes.length }, // Strukturiert anstatt direkt pendingRoutes.length
        });
      }
    } catch (error: unknown) {
      bugsnagService.notify(
        error instanceof Error
          ? error
          : new Error("Failed to register pending routes")
      );
    }
  }, [registerRoute]);

  // Zeige einen Ladebildschirm während des Ladens
  if (isLoading) {
    return <LoadingScreen />;
  }

  try {
    // Typsichere Prüfung, ob es sich um eine dynamische Route handelt
    if (
      segments.length > 0 &&
      typeof segments[0] === "string" &&
      segments[0].startsWith("/")
    ) {
      const path = segments.join("/");
      return (
        <>
          <DynamicRouteRenderer path={path} />
          <DevMenu />
        </>
      );
    }

    return (
      <>
        <Slot />
        <DevMenu />
      </>
    );
  } catch (error: unknown) {
    bugsnagService.notify(
      error instanceof Error
        ? error
        : new Error("Error in root layout rendering")
    );

    return (
      <ErrorDisplay
        message="Ein Fehler ist aufgetreten"
        showReloadButton={true}
      />
    );
  }
}

export default function RootLayout(): JSX.Element | null {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync().catch((error: unknown) => {
        bugsnagService.notify(
          error instanceof Error ? error : new Error(String(error))
        );
        console.error(
          "Fehler beim Ausblenden des SplashScreens:",
          error instanceof Error ? error.message : String(error)
        );
      });
    }
  }, [loaded]);

  useEffect(() => {
    // Assets vorbereiten und laden
    async function prepareApp() {
      try {
        // Schriften registrieren
        assetManager.registerFonts({
          Montserrat: require("../assets/fonts/Montserrat-Regular.ttf"),
          "Montserrat-Bold": require("../assets/fonts/Montserrat-Bold.ttf"),
          "Montserrat-Light": require("../assets/fonts/Montserrat-Light.ttf"),
        });

        // Kritische UI-Assets registrieren
        assetManager.registerImages(CRITICAL_IMAGES, AssetPriority.CRITICAL);

        // Tarotkarten vorbereiten
        const cardModules = tarotCards.map((card) => ({
          id: card.id,
          name: card.name,
          image: card.image, // Nehme an, dass das ein require('./path/to/image') ist
        }));

        // Kritische Assets vorladen
        await assetManager.preloadCriticalAssets();

        // Tarot-Deck im Hintergrund initialisieren (nach App-Start)
        tarotDeckOptimizer.initializeDeck(cardModules).catch(console.error);

        setIsReady(true);
      } catch (error) {
        console.error("Error loading app assets:", error);
        setIsReady(true); // Trotz Fehler fortsetzen
      }
    }

    prepareApp();
  }, []);

  useEffect(() => {
    // Initialisiere den Optimizer mit allen verfügbaren Karten
    const cardModules = tarotCards.map((card) => ({
      id: card.id,
      name: card.name,
      image: card.image,
    }));

    // Starte Initialisierung im Hintergrund
    tarotDeckOptimizer
      .initializeDeck(cardModules)
      .catch((err) =>
        console.error("Failed to initialize tarot deck optimizer:", err)
      );
  }, []);

  if (!loaded || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  try {
    return (
      <DynamicRoutesProvider>
        <UserProvider>
          <AuthProvider>
            <ThemeProvider
              value={colorScheme === "dark" ? DarkTheme : DefaultTheme}
            >
              <RootLayoutNav />
              <StatusBar style="auto" />
            </ThemeProvider>
          </AuthProvider>
        </UserProvider>
      </DynamicRoutesProvider>
    );
  } catch (error: unknown) {
    bugsnagService.notify(
      error instanceof Error ? error : new Error("Failed to render root layout")
    );

    return (
      <ErrorDisplay
        message="Die App konnte nicht geladen werden"
        darkMode={true}
      />
    );
  }
}
