import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { devStyles } from "@/styles/styles";
import { useRouter } from "expo-router";
import { APP_ROUTES } from "../../constants/routes";
import { toValidRoute } from "../../types/navigation";

interface ErrorDisplayProps {
  message: string;
  showReloadButton?: boolean;
  darkMode?: boolean;
}

export function ErrorDisplay({
  message,
  showReloadButton = false,
  darkMode = false,
}: ErrorDisplayProps): JSX.Element {
  const router = useRouter();

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      <Text style={[styles.errorText, darkMode && styles.darkModeText]}>
        {message}
      </Text>

      {showReloadButton && (
        <Pressable
          style={devStyles.devButton}
          onPress={() => router.replace(toValidRoute(APP_ROUTES.HOME))}
        >
          <Text style={devStyles.devButtonText}>Neu laden</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  darkContainer: {
    backgroundColor: "#1F2937",
  },
  errorText: {
    color: "red",
    marginBottom: 20,
    fontSize: 16,
    textAlign: "center",
  },
  darkModeText: {
    color: "white",
  },
});
