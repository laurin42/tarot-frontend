import { StyleSheet } from "react-native";

/**
 * Gemeinsame Styles für Entwicklungs-UI-Elemente
 */
export const devStyles = StyleSheet.create({
  devMenu: {
    position: "absolute",
    bottom: 20,
    right: 20,
    opacity: 0.8,
    zIndex: 1000,
  },
  devButton: {
    backgroundColor: "#FF3B30",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  devButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});