import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ErrorFallbackProps {
  message?: string;
}

/**
 * Generische Fehler-Fallback-Komponente für Entwicklungs-Tools
 */
export const ErrorFallback: React.FC<ErrorFallbackProps> = ({
  message = "Ein Fehler ist aufgetreten",
}) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorText}>{message}</Text>
  </View>
);

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    color: "red",
    fontSize: 16,
    textAlign: "center",
  },
});
