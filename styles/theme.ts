import { Platform, Easing, Dimensions } from "react-native";

// Get device dimensions for responsive styling
// Use default dimensions if Dimensions API is not available (e.g., during Jest tests)
const getDimensions = () => {
  try {
    // Attempt to get dimensions, check if 'get' exists
    if (Dimensions && typeof Dimensions.get === 'function') {
      return Dimensions.get("window");
    }
  } catch (error) {
    // Handle potential errors during access, although unlikely with the check above
    console.warn("Dimensions API failed during initialization:", error);
  }
  // Return default values if API fails or is not available
  return { width: 400, height: 800 };
};

const { width, height } = getDimensions();

// Main color palette
export const colors = {
  // Primary colors
  primary: "#8B5CF6", // Main color (purple)
  primaryLight: "#A78BFA",
  primaryDark: "#7C3AED",
  
  // Background colors
  background: "#0D1117", // Darker, less saturated background
  backgroundLight: "rgba(30, 36, 44, 0.95)", // Slightly darker light bg
  backgroundDarker: "rgba(25, 30, 38, 0.98)", // Slightly darker darker bg
  backgroundOverlay: "rgba(0, 0, 0, 0.8)", // Adjust overlay opacity if needed
  
  // Text colors
  text: "#FFFFFF",
  textSecondary: "#F3F4F6",
  textMuted: "#9CA3AF",
  
  // Accent colors
  orange: "rgba(249, 115, 22, 0.9)",
  orangeLight: "rgba(249, 115, 22, 0.7)",
  gold: "#FFD700",
  cardBackGold: "#rgba(237, 179, 96, 0.3)",
  error: "#EF4444",
  success: "#6EE7B7",
  
  // Glow colors
  purpleGlow: "rgba(139, 92, 246, 0.3)", // Reduce alpha for purple glow

  // Border colors
  border: "rgba(139, 92, 246, 0.3)",
  borderLight: "rgba(139, 92, 246, 0.2)",

  // Tab Bar Colors - ADD THESE
  tabBarBackground: "#0D1117",
  tabBarActive: "rgba(237, 179, 96, 0.8)",   // Gold with 50% opacity (wie gewünscht)
  tabBarInactive: "#9CA3AF",                 // Muted grey (textMuted)
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
  strong: { // Keep strong glow for specific highlights if needed, maybe reduce slightly
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.7,
        shadowRadius: 18,
      },
      android: {
        elevation: 14,
      },
      web: {
        boxShadow: `0 0 18px ${colors.purpleGlow}`,
      },
    }),
  },
  medium: { // Reduce medium glow significantly
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.25, // Lower opacity
        shadowRadius: 8, // Smaller radius
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: `0 0 8px rgba(139, 92, 246, 0.25)`, // Smaller, less opaque glow
      },
    }),
  },
  subtle: { // Reduce subtle glow
    ...Platform.select({
      ios: {
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.15, // Lower opacity
        shadowRadius: 5, // Smaller radius
      },
      android: {
        elevation: 3,
      },
      web: {
        boxShadow: `0 0 5px rgba(139, 92, 246, 0.15)`, // Smaller, less opaque glow
      },
    }),
  },
  text: { // Reduce text glow
    textShadowColor: `rgba(139, 92, 246, 0.6)`, // Less intense color
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 6, // Smaller radius
  },
  gold: { // Reduce gold glow significantly
    ...Platform.select({
      ios: {
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5, // Lower opacity
        shadowRadius: 10, // Smaller radius
      },
      android: {
        elevation: 10,
        backgroundColor: "rgba(255,215,0,0.02)", // Less bg color influence
      },
      web: {
        boxShadow: `0 0 10px rgba(255,215,0,0.5)`, // Smaller, less opaque glow
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
  // Font families
  fontFamily: {
    primary: "Quicksand",
    primaryBold: "Quicksand-Bold",
    primaryLight: "Quicksand-Light",
    primaryMedium: "Quicksand-Medium",
    primarySemiBold: "Quicksand-SemiBold",
    decorative: "EagleLake",
    monospace: "SpaceMono",
  },
  
  header: {
    fontFamily: "Quicksand-Bold",
    fontSize: 24,
    fontWeight: "bold" as const,
    color: colors.primaryLight,
  },
  title: {
    fontFamily: "EagleLake",
    fontSize: 28,
    fontWeight: "bold" as const,
    color: colors.primaryLight,
    textAlign: "center" as const,
  },
  subtitle: {
    fontFamily: "Quicksand-SemiBold",
    fontSize: 20,
    fontWeight: "600" as const,
    color: colors.primaryLight,
  },
  body: {
    fontFamily: "Quicksand",
    fontSize: 17,
    lineHeight: 26,
    color: colors.textSecondary,
  },
  button: {
    fontFamily: "Quicksand-Medium",
    fontSize: 18,
    fontWeight: "bold" as const,
    color: colors.text,
  },
  caption: {
    fontFamily: "Quicksand-Medium",
    fontSize: 14,
    fontWeight: "bold" as const,
    color: colors.textMuted,
  },
  small: {
    fontFamily: "Quicksand-Light",
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