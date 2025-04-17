import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import BugsnagTest from "@/dev-tools/bugsnagTest";
import { bugsnagService } from "@/services/bugsnag";

export default function DebugScreen() {
  const isBugsnagStarted = bugsnagService.isStarted();

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Debug & Test</Text>
        {!isBugsnagStarted && (
          <Text style={styles.warningText}>Bugsnag is not initialized!</Text>
        )}
      </View>
      <BugsnagTest />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
  },
  warningText: {
    color: "red",
    marginTop: 4,
  },
});
