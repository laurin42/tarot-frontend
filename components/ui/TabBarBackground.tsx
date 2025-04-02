// Überprüfe diese Datei und stelle sicher, dass sie keinen Balken erzeugt
// Beispiel für einen korrekten TabBarBackground:
import React from "react";
import { View } from "react-native";

export default function TabBarBackground() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#111827", // Konsistent mit der App
      }}
    />
  );
}

export function useBottomTabOverflow() {
  return 0;
}
