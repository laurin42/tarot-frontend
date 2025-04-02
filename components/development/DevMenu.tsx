import React from "react";
import { View, Pressable, Text } from "react-native";
import { useRouter } from "expo-router";
import { bugsnagService } from "../../services/bugsnag";
import { navigateToCustomPath } from "../../services/dynamicRoutes";
import { devStyles } from "@/styles/styles";
import { DYNAMIC_ROUTES } from "../../constants/routes";

export function DevMenu(): JSX.Element | null {
  const router = useRouter();

  if (!__DEV__) return null;

  return (
    <View style={devStyles.devMenu}>
      <Pressable
        style={devStyles.devButton}
        onPress={() => {
          try {
            navigateToCustomPath(router, DYNAMIC_ROUTES.DEV_TOOLS);
            bugsnagService.leaveBreadcrumb("Opened dev tools");
          } catch (error: unknown) {
            bugsnagService.notify(
              error instanceof Error
                ? error
                : new Error("Failed to navigate to dev tools")
            );
          }
        }}
      >
        <Text style={devStyles.devButtonText}>Debug-Tools</Text>
      </Pressable>
    </View>
  );
}
