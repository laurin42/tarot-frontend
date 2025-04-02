import { StyleSheet } from "react-native";
import { colors, glowEffects, borderEffects } from "./theme";

export const styles = StyleSheet.create({
  animatedCard: {
    position: "absolute",
    ...glowEffects.medium,
  },
  cardPressable: {
    borderRadius: 16,
  },
  gamePlayArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  instructionContainer: {
    top: "10%",
    zIndex: 100,
    alignSelf: "center",
  },
  cardIndicatorContainer: {
    bottom: "8%",
    alignSelf: "center",
  },
});
