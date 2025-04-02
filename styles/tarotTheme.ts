import { StyleSheet, Platform } from 'react-native';
import { colors, glowEffects, spacing, typography } from './theme';

// Tarot-spezifische Textsstile
export const globalTextStyles = StyleSheet.create({
  title: {
    ...typography.title,
    marginVertical: spacing.lg,
    paddingHorizontal: spacing.xl + spacing.md,
    ...Platform.select({
      ios: {
        ...glowEffects.text,
      },
    }),
  },
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
  buttonText: {
    color: colors.text,
    fontWeight: "bold",
    fontSize: 16,
  },
  summaryText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "left",
  },
  modalTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: spacing.md,
    textAlign: "center",
  },
  modalText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 24,
    textAlign: "left",
    marginBottom: spacing.lg,
  },
  errorText: {
    color: colors.error,
    fontSize: 16,
    textAlign: "center",
    marginTop: spacing.lg,
  },
});

// Container und Layout-Stile
export const commonStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  button: {
    backgroundColor: colors.orange,
    paddingVertical: spacing.sm + 4,
    paddingHorizontal: spacing.lg,
    borderRadius: 8,
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: colors.backgroundOverlay,
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
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
});

// Shadow-Effekte mit Wiederverwendung der glow-Definitionen
export const shadowStyles = {
  cardGlow: glowEffects.medium,
  modalGlow: glowEffects.strong,
  buttonGlow: glowEffects.subtle,
};