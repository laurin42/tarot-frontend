import React from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";

export function LoadingScreen(): JSX.Element {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#A78BFA" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#1F2937",
  },
});
