import React, { createContext, useContext, useCallback } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

// Define the context type
interface GoogleAuthContextType {
  request: any; // Replace with the actual type if known
  response: any; // Replace with the actual type if known
  promptAsync: () => Promise<{ type: string; token?: string; error?: string }>;
}

// Create the context
const GoogleAuthContext = createContext<GoogleAuthContextType | undefined>(
  undefined
);

// GoogleAuthProvider component
export const GoogleAuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
    responseType: "id_token" as const,
    usePKCE: true,
    redirectUri:
      Platform.OS === "web"
        ? "http://localhost:8081/auth/google/--/expo-auth-session"
        : makeRedirectUri({
            scheme: "yourAppScheme", // Replace with your app's scheme
            path: "oauth2redirect/google",
          }),
  });

  const handleAuth = useCallback(async () => {
    try {
      const result = await promptAsync();

      if (result?.type === "success") {
        const idToken = result.params?.id_token;
        if (!idToken) {
          throw new Error("No ID token received");
        }
        return { type: "success", token: idToken, error: undefined };
      }
      return { type: "error", error: "Auth cancelled", token: undefined };
    } catch (error) {
      console.error("Google auth error:", error);
      return {
        type: "error",
        error: (error as Error).message || "An error occurred",
        token: undefined,
      };
    }
  }, [promptAsync]);

  return (
    <GoogleAuthContext.Provider
      value={{ request, response, promptAsync: handleAuth }}
    >
      {children}
    </GoogleAuthContext.Provider>
  );
};

// Custom hook to use the GoogleAuthContext
export const useGoogleAuth = () => {
  const context = useContext(GoogleAuthContext);
  if (context === undefined) {
    throw new Error("useGoogleAuth must be used within a GoogleAuthProvider");
  }
  return context;
};
