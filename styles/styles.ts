import { StyleSheet, Platform } from "react-native";
import {
  colors,
  glowEffects,
  borderEffects,
  typography,
  spacing,
  zIndex,
} from "./theme";

/**
 * Layout & Container Styles
 * Basic layout patterns used throughout the app
 */
export const layoutStyles = StyleSheet.create({
  // Common container styles
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centeredContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: colors.background,
  },
  flexCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  column: {
    flexDirection: "column",
  },
  spaceBetween: {
    justifyContent: "space-between",
  },
  alignCenter: {
    alignItems: "center",
  },
  
  // Overlay and absolute positioning
  fullscreenAbsolute: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: zIndex.overlay,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.backgroundOverlay,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
    zIndex: zIndex.modal,
  },
  
  // Card layouts
  cardStack: {
    position: "relative",
    width: "100%",
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  cardFan: {
    position: "relative",
    width: "100%",
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  instructionContainer: {
    top: "10%",
    zIndex: zIndex.tooltip,
    alignSelf: "center",
  },
  floatingIndicator: {
    position: "absolute", // Damit der Indikator über anderen Elementen schwebt
    backgroundColor: "rgba(255, 255, 255, 0.8)", // Leicht transparenter Hintergrund
    paddingVertical: 10, // Vertikales Padding
    paddingHorizontal: 20, // Horizontales Padding
    borderRadius: 8, // Abgerundete Ecken
    alignSelf: "center", // Zentriert auf der X-Achse
    zIndex: zIndex.tooltip, // Z-Index für die Schichtung
  },
  cardIndicatorContainer: {
    position: "absolute", // Damit der Indikator über anderen Elementen schwebt
    bottom: "8%", // Positionierung am unteren Rand
    alignSelf: "center", // Zentriert auf der X-Achse
    backgroundColor: "rgba(255, 255, 255, 0.9)", // Leicht transparenter Hintergrund
    padding: 10, // Padding für den Indikator
    borderRadius: 8, // Abgerundete Ecken
    zIndex: zIndex.tooltip, // Z-Index für die Schichtung
  },
  mysticalGlowContainer: {
    position: "absolute",
    width: "100%",
    height: "100%",
    borderRadius: 250,
    backgroundColor: "rgba(139, 92, 246, 0.3)",
    zIndex: zIndex.overlay,
    ...glowEffects.gold,
  },

  gamePlayArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    backgroundColor: colors.backgroundLight,
    padding: spacing.md,
    borderRadius: 16,
    ...glowEffects.medium,
  },
});


/**
 * Component Styles
 * Reusable component styles organized by type
 */
export const componentStyles = StyleSheet.create({
  // Card components
  cardBase: {
    ...borderEffects.standard,
    ...glowEffects.medium,
  },
  cardContainer: {
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: colors.backgroundLight,
  },
  cardImage: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  cardWrapper: {
    alignItems: "center",
    width: "29%",
    maxWidth: "30%",
    justifyContent: "flex-start",
    backgroundColor: "transparent",
    flexDirection: "column",
    height: "auto",
    marginHorizontal: 2,
  },
  animatedCard: {
    position: "absolute",
    ...glowEffects.medium,
  },
  cardPressable: {
    borderRadius: 16,
  },
  
  // Button components
  primaryButton: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: colors.primaryDark,
    borderRadius: 16,
    ...glowEffects.subtle,
  },
  secondaryButton: {
    backgroundColor: colors.orange,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonFullWidth: {
    width: "100%",
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.orange,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing.lg,
    alignItems: "center",
  },
  
  // Modal components
  modalContainer: {
    width: "90%",
    maxHeight: "90%",
    alignItems: "center",
    backgroundColor: colors.backgroundLight,
    padding: 20,
    ...borderEffects.standard,
    ...glowEffects.medium,
  },
  modalContent: {
    backgroundColor: colors.backgroundDarker,
    borderRadius: 16,
    padding: spacing.lg,
    paddingBottom: 0,
    width: "100%",
    maxHeight: "85%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: colors.border,
    ...glowEffects.medium,
  },
  
  // Other UI elements
  floatingIndicator: {
    position: "absolute",
    backgroundColor: "transparent",
    paddingVertical: 6,
    paddingHorizontal: 12,
    minWidth: 250,
    maxWidth: "80%",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  mysticalGlowContainer: {
    position: "absolute",
    width: 500,
    height: 500,
    borderRadius: 250,
    backgroundColor: "transparent",
    ...glowEffects.gold,
  },
  instructionContainer: {
    top: "10%",
    zIndex: zIndex.tooltip,
    alignSelf: "center",
  },
  summaryContainer: {
    backgroundColor: colors.backgroundLight,
    borderRadius: 16,
    padding: spacing.lg,
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    ...glowEffects.medium,
  },
  cardsContainer: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "flex-start",
    width: "100%",
    paddingHorizontal: spacing.sm,
    marginBottom: 4,
  },
});

/**
 * Text Styles
 * Typography styles for various text elements
 */
export const textStyles = StyleSheet.create({
  // Title and heading styles
  title: {
    ...typography.title,
    marginVertical: spacing.lg,
    ...Platform.select({
      ios: {
        ...glowEffects.text,
      },
    }),
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  
  // Body text styles
  body: {
    ...typography.body,
  },
  explanationText: {
    color: colors.textSecondary,
    fontSize: 17,
    lineHeight: 26,
    textAlign: "center",
  },
  summaryText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "left",
  },
  modalText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "left",
    marginBottom: spacing.lg,
  },
  
  // Special text styles
  mysticalText: {
    color: colors.primaryLight,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    ...glowEffects.text,
  },
  glowingText: {
    color: colors.primaryLight,
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
    textShadowColor: "rgba(139, 92, 246, 0.9)",
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 14,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: "center",
    marginTop: spacing.lg,
  },
  
  // Button text styles
  primaryButtonText: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  buttonText: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  
  // Card-specific text styles
  cardLabel: {
    color: colors.orangeLight,
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  cardName: {
    color: colors.primaryLight,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    lineHeight: 18,
  },
});


/**
 * Game-specific styles
 * Styles related to the game interface and tarot features
 */
export const gameStyles = StyleSheet.create({
  gamePlayArea: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  cardIndicatorContainer: {
    bottom: "8%",
    alignSelf: "center",
  },
  startButton: {
    position: 'absolute',
    alignSelf: 'center',
    backgroundColor: 'rgba(234, 88, 12, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 8,
    zIndex: zIndex.card,
  },
  startButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  bgGray900: {
    backgroundColor: '#111827',
  },
});

/**
 * Development styles
 * Styles for development UI elements, separate for clarity
 */
export const devStyles = StyleSheet.create({
  devMenu: {
    position: "absolute",
    bottom: 20,
    right: 20,
    opacity: 0.8,
    zIndex: zIndex.devTools,
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