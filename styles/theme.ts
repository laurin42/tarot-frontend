import { Platform, Easing, Dimensions } from "react-native";

// Get device dimensions for responsive styling
const { width, height } = Dimensions.get("window");

// Main color palette
export const colors = {
  // Primary colors
  primary: "#8B5CF6", // Main color (purple)
  primaryLight: "#A78BFA",
  primaryDark: "#7C3AED",
  
  // Background colors
  background: "#111827", // Dark background
  backgroundLight: "rgba(31, 41, 55, 0.95)",
  backgroundDarker: "rgba(31, 41, 55, 0.98)",
  backgroundOverlay: "rgba(0, 0, 0, 0.85)",
  
  // Text colors
  text: "#FFFFFF",
  textSecondary: "#F3F4F6",
  textMuted: "#9CA3AF",
  
  // Accent colors
  orange: "rgba(249, 115, 22, 0.9)",
  orangeLight: "rgba(249, 115, 22, 0.7)",
  gold: "#FFD700",
  error: "#EF4444",
  success: "#6EE7B7",
  
  // Glow colors
  purpleGlow: "rgba(139, 92, 246, 0.4)",

  // Border colors
  border: "rgba(139, 92, 246, 0.3)",
  borderLight: "rgba(139, 92, 246, 0.2)",
};

// Spacing scale for consistent layout
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

// Shadow/glow effects with different intensities - optimized for each platform
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
      web: {
        boxShadow: `0 0 20px ${colors.purpleGlow}`,
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
      web: {
        boxShadow: `0 0 15px ${colors.purpleGlow}`,
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
      web: {
        boxShadow: `0 0 10px ${colors.purpleGlow}`,
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
      web: {
        boxShadow: `0 0 20px rgba(255,215,0,0.8)`,
      },
    }),
  },
};

// Reusable border styles
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

// Typography system
export const typography = {
  header: {
    fontSize: 24,
    fontWeight: "bold" as const,
    color: colors.primaryLight,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold" as const,
    color: colors.primaryLight,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "600" as const,
    color: colors.primaryLight,
  },
  body: {
    fontSize: 17,
    lineHeight: 26,
    color: colors.textSecondary,
  },
  button: {
    fontSize: 18,
    fontWeight: "bold" as const,
    color: colors.text,
  },
  caption: {
    fontSize: 14,
    fontWeight: "bold" as const,
    color: colors.textMuted,
  },
  small: {
    fontSize: 12,
    color: colors.textMuted,
  },
};

// Animation presets
export const animation = {
  timing: {
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
    quick: {
      duration: 300,
      useNativeDriver: true,
    },
  },
  spring: {
    gentle: {
      damping: 15,
      stiffness: 120,
      mass: 1,
      useNativeDriver: true,
    },
    bounce: {
      damping: 10,
      stiffness: 180,
      mass: 1,
      useNativeDriver: true,
    },
  },
};

// Component sizes - using responsive dimensions
export const sizes = {
  cardSmall: {
    width: width * 0.3,
    height: width * 0.3 * 1.6,
  },
  cardMedium: {
    width: width * 0.45,
    height: width * 0.45 * 1.6,
  },
  cardLarge: {
    width: width * 0.6,
    height: width * 0.6 * 1.6,
  },
  buttonHeight: 48,
  inputHeight: 56,
  indicatorHeight: 40,
  modalWidth: "90%",
  modalMaxHeight: "85%",
  iconSmall: 20,
  iconMedium: 24,
  iconLarge: 32,
};

// Z-index values for consistent layering
export const zIndex = {
  base: 1,
  card: 10,
  modal: 50,
  overlay: 40,
  tooltip: 30,
  navigation: 20,
  devTools: 1000,
};

// Device-specific metrics
export const device = {
  width,
  height,
  isSmallDevice: width < 375,
  isLargeDevice: width >= 768,
};

// Default card styles used throughout the app
export const cardStyles = {
  standard: {
    backgroundColor: colors.background,
    padding: 16,
    ...glowEffects.medium,
    ...borderEffects.standard,
  },
  medium: {
    backgroundColor: colors.background,
    padding: 12,
    ...glowEffects.subtle,
    ...borderEffects.standard,
  },
  small: {
    backgroundColor: colors.background,
    padding: 8,
    ...glowEffects.subtle,
    ...borderEffects.subtle,
  },
};