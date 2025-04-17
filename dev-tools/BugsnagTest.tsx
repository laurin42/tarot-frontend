import React, { useState } from "react";
import { View, Button, Text, StyleSheet, Platform } from "react-native";
import { bugsnagService } from "@/services/bugsnag";

export default function BugsnagTest() {
  const [testStatus, setTestStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleManualError = () => {
    setIsLoading(true);
    try {
      bugsnagService.notify(new Error("Manueller Test-Fehler"), {
        test: {
          type: "manual",
          timestamp: new Date().toISOString(),
          platform: Platform.OS,
        },
      });
      setTestStatus("Fehler wurde an Bugsnag gesendet");
    } catch (error: any) {
      setTestStatus(`Fehler beim Senden: ${error?.message || String(error)}`);
      console.error("Bugsnag notify error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBreadcrumb = () => {
    setIsLoading(true);
    try {
      bugsnagService.leaveBreadcrumb("Test Breadcrumb", {
        action: "button_press",
        timestamp: new Date().toISOString(),
      });
      setTestStatus("Breadcrumb wurde erstellt");
    } catch (error: any) {
      setTestStatus(
        `Fehler beim Breadcrumb: ${error?.message || String(error)}`
      );
      console.error("Bugsnag breadcrumb error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUncaughtError = () => {
    // This error is caught by the ErrorBoundary
    throw new Error("Unhandled test error");
  };

  const handlePromiseRejection = () => {
    setIsLoading(true);
    // Add a setTimeout to display the status message before the Promise-Rejection blocks the JavaScript thread
    setTestStatus("Promise-Rejection wird ausgelöst...");
    setTimeout(() => {
      Promise.reject(new Error("Test Promise-Rejection"));
      setIsLoading(false);
    }, 500);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Bugsnag Test</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="1. Send manual error"
          onPress={handleManualError}
          color="#4CAF50"
          disabled={isLoading}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="2. Create breadcrumb"
          onPress={handleBreadcrumb}
          color="#2196F3"
          disabled={isLoading}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="3. Trigger unhandled error"
          onPress={handleUncaughtError}
          color="#F44336"
          disabled={isLoading}
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          title="4. Trigger Promise-Rejection"
          onPress={handlePromiseRejection}
          color="#FF9800"
          disabled={isLoading}
        />
      </View>

      {testStatus && (
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{testStatus}</Text>
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          API-Key:{" "}
          {process.env.EXPO_PUBLIC_BUGSNAG_API_KEY?.substring(0, 5) ||
            "not set"}
          ...
        </Text>
        <Text style={styles.infoText}>
          Environment: {process.env.EXPO_PUBLIC_ENVIRONMENT || "not set"}
        </Text>
        <Text style={styles.infoText}>
          Bugsnag initialized: {bugsnagService.isStarted() ? "Yes" : "No"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
    margin: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  buttonContainer: {
    marginBottom: 12,
  },
  statusContainer: {
    marginTop: 16,
    padding: 12,
    backgroundColor: "#e1f5fe",
    borderRadius: 4,
  },
  statusText: {
    textAlign: "center",
    color: "#0277bd",
  },
  infoContainer: {
    marginTop: 16,
    padding: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 4,
  },
  infoText: {
    fontSize: 12,
    color: "#666",
  },
});
