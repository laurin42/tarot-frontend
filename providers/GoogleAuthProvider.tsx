import { createContext, useContext, useCallback } from "react";
import * as Google from "expo-auth-session/providers/google";
import * as WebBrowser from "expo-web-browser";
import { makeRedirectUri } from "expo-auth-session";
import { Platform } from "react-native";

WebBrowser.maybeCompleteAuthSession();

const GoogleAuthConfig = {
  androidClientId: process.env.EXPO_PUBLIC_ANDROID_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_IOS_CLIENT_ID,
  webClientId: process.env.EXPO_PUBLIC_WEB_CLIENT_ID,
  responseType: "id_token" as const,
  usePKCE: true,
  webOptions: {
    preferEphemeralSession: true,
  },
};

export function useGoogleAuth() {
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    ...GoogleAuthConfig,
    selectAccount: true,
    shouldAutoExchangeCode: false,
    redirectUri:
      Platform.OS === "web"
        ? "http://localhost:8081/auth/google/--/expo-auth-session"
        : makeRedirectUri({
            scheme: "tarot",
            path: "oauth2redirect/google",
          }),
  });

  return {
    request,
    response,
    promptAsync: useCallback(async () => {
      try {
        const result = await promptAsync();

        if (result?.type === "success") {
          const idToken = result.params?.id_token;
          if (!idToken) {
            throw new Error("No ID token received");
          }
          return { type: "success", token: idToken };
        }
        return { type: "error", error: "Auth cancelled" };
      } catch (error) {
        console.error("Google auth error:", error);
        return { type: "error", error };
      }
    }, [promptAsync]),
  };
}
