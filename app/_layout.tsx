import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import { Text, View } from "react-native";
import { useColorScheme } from "@/hooks/useColorScheme";
import { bugsnagService } from "../services/bugsnag";
import { initializeSplashScreen } from "../utils/splashScreen";
import * as SplashScreen from "expo-splash-screen";

// Initialize splash screen
initializeSplashScreen();

export default function RootLayout(): JSX.Element | null {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Quicksand: require("../assets/fonts/Quicksand-Regular.ttf"),
    "Quicksand-Bold": require("../assets/fonts/Quicksand-Bold.ttf"),
    "Quicksand-Light": require("../assets/fonts/Quicksand-Light.ttf"),
    "Quicksand-Medium": require("../assets/fonts/Quicksand-Medium.ttf"),
    "Quicksand-SemiBold": require("../assets/fonts/Quicksand-SemiBold.ttf"),
    EagleLake: require("../assets/fonts/EagleLake-Regular.ttf"),
  });

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
    // Initialize Bugsnag after the app starts
    if (!bugsnagService.isStarted()) {
      bugsnagService.init();
    }
  }, []);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  try {
    return (
      <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
        <Slot />
        <StatusBar style="auto" />
      </ThemeProvider>
    );
  } catch (error: unknown) {
    bugsnagService.notify(
      error instanceof Error ? error : new Error("Failed to render root layout")
    );

    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Die App konnte nicht geladen werden</Text>
      </View>
    );
  }
}
