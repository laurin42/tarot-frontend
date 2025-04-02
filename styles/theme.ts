import { Platform, Easing, Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

// Zentrale Farbpalette
export const colors = {
  // Primärfarben
  primary: "#8B5CF6", // Hauptfarbe (Lila)
  primaryLight: "#A78BFA",
  primaryDark: "#7C3AED",
  
  // Hintergrundfarben
  background: "#111827", // Dunkler Hintergrund
  backgroundLight: "rgba(31, 41, 55, 0.95)",
  backgroundDarker: "rgba(31, 41, 55, 0.98)",
  backgroundOverlay: "rgba(0, 0, 0, 0.85)",
  
  // Textfarben
  text: "#FFFFFF",
  textSecondary: "#F3F4F6",
  textMuted: "#9CA3AF",
  
  // Akzentfarben
  orange: "rgba(249, 115, 22, 0.9)",
  orangeLight: "rgba(249, 115, 22, 0.7)",
  gold: "#FFD700",
  error: "#EF4444",
  success: "#6EE7B7",
  
  // Hinzufügen der fehlenden Farbe
  purpleGlow: "rgba(139, 92, 246, 0.4)",

  // Rahmenfarben
  border: "rgba(139, 92, 246, 0.3)",
  borderLight: "rgba(139, 92, 246, 0.2)",
};

// Glow-Effekte mit verschiedenen Intensitäten
export const glowEffects = {
  strong: {
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
      },
      android: {
        elevation: 15,
      },
    }),
  },
  medium: {
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 15,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  subtle: {
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  text: {
    textShadowColor: `rgba(139, 92, 246, 0.8)`,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  gold: {
    ...Platform.select({
      ios: {
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 20,
      },
      android: {
        elevation: 20,
        backgroundColor: "rgba(255,215,0,0.05)",
      },
    }),
  },
};

// Wiederverwendbare Rahmeneffekte
export const borderEffects = {
  standard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
  },
  subtle: {
    borderWidth: 0.5,
    borderColor: colors.border,
    borderRadius: 8,
  },
  none: {
    borderWidth: 0,
    borderColor: "transparent",
  },
};

// Typografie-Stile
export const typography = {
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: colors.primaryLight,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: colors.primaryLight,
    textAlign: "center",
  },
  body: {
    fontSize: 17,
    lineHeight: 26,
    color: colors.textSecondary,
  },
  button: {
    fontSize: 18,
    fontWeight: "bold",
    color: colors.text,
  },
  caption: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.textMuted,
  },
};

// Animation Presets
export const animationPresets = {
  fadeIn: {
    duration: 800,
    useNativeDriver: true,
  },
  fadeOut: {
    duration: 500,
    useNativeDriver: true,
  },
  move: {
    duration: 700,
    easing: Easing.out(Easing.cubic),
    useNativeDriver: true,
  },
};

// Abstandswerte
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
};

// Komponentengrößen
export const sizes = {
  cardWidth: width * 0.6,
  cardHeight: width * 0.6 * 1.6, // Standard Kartenverhältnis
  buttonHeight: 48,
  indicatorHeight: 40,
  modalWidth: "90%",
  modalMaxHeight: "85%",
};

export const card = {
  backgroundColor: colors.background,
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 0 20px rgba(139, 92, 246, 0.8)",
};

export const cardMedium = {
  backgroundColor: colors.background,
  borderRadius: 12,
  padding: 12,
  boxShadow: "0 0 15px rgba(139, 92, 246, 0.5)",
};

export const cardSmall = {
  backgroundColor: colors.background,
  borderRadius: 8,
  padding: 8,
  boxShadow: "0 0 10px rgba(139, 92, 246, 0.3)",
};

export const title = {
  fontSize: 24,
  fontWeight: "bold",
  color: colors.text,
  textShadow: "0 0 10px rgba(139, 92, 246, 0.8)",
};

export const goldCard = {
  backgroundColor: colors.background,
  borderRadius: 16,
  padding: 16,
  boxShadow: "0 0 20px rgba(234, 179, 8, 0.8)",
};