import React, { Component, ErrorInfo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { bugsnagService } from "../services/bugsnag";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary-Komponente zur Behandlung von Renderfehlern
 * Fängt Fehler in React-Komponenten ab und zeigt eine Fallback-UI
 */
export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // ✅ Korrigierter Aufruf ohne zweiten Parameter (gemäß Fehler "Expected 1 arguments")
    bugsnagService.notify(error);
    console.error("React component error:", error, errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Etwas ist schiefgelaufen</Text>
          <Text style={styles.errorMessage}>
            {this.state.error?.message ||
              "Ein unbekannter Fehler ist aufgetreten."}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8d7da",
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#721c24",
    marginBottom: 10,
  },
  errorMessage: {
    fontSize: 14,
    color: "#721c24",
    textAlign: "center",
  },
});
