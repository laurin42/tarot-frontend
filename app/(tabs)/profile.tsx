import React from "react";
import { View, Text, StyleSheet, ScrollView, Platform } from "react-native";

export default function ProfileScreen() {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.headerBackground}>
        <Text style={styles.placeholderTitle}>Profil</Text>
      </View>
      <View style={styles.section}>
        <Text style={styles.placeholderText}>
          Diese Funktion ist in der vereinfachten Version nicht verfügbar. Keine
          Benutzerdaten oder Anmeldung erforderlich.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "rgba(17, 24, 39, 0.98)",
  },
  headerBackground: {
    backgroundColor: "rgba(31, 41, 55, 0.95)",
    padding: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(167, 139, 250, 0.3)",
  },
  placeholderTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "center",
  },
  section: {
    padding: 20,
    alignItems: "center",
  },
  placeholderText: {
    color: "#D1D5DB",
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
});
