import React from "react";
import { Link, Stack } from "expo-router";
import { StyleSheet, Text, View } from "react-native";

export default function NotFoundScreen(): JSX.Element {
  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: "Oops!" }} />
      <Text style={styles.text}>Diese Seite existiert nicht.</Text>
      <Link href="/" style={styles.link}>
        <Text style={styles.linkText}>Zurück zur Startseite</Text>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  text: {
    fontSize: 16,
    marginBottom: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
  linkText: {
    color: "#007AFF",
    fontWeight: "600",
  },
});
