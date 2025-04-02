import React, { useCallback, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import * as AppleAuthentication from "expo-apple-authentication";
import * as WebBrowser from "expo-web-browser";
import { useAuth } from "../../context/AuthContext";
import { useGoogleAuth } from "../../providers/GoogleAuthProvider";
import { jwtDecode } from "jwt-decode";

// Initialize WebBrowser for auth session
WebBrowser.maybeCompleteAuthSession();

interface AuthResponse {
  token: string;
  error?: string;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#1F2937",
  },
  title: {
    fontSize: 24,
    color: "#FFFFFF",
    marginBottom: 32,
    fontWeight: "bold",
  },
  googleButton: {
    backgroundColor: "#FFFFFF",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginBottom: 16,
    width: "100%",
    alignItems: "center",
  },
  anonymousButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 24,
    width: "100%",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  anonymousText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "500",
  },
  buttonText: {
    color: "#1F2937",
    fontSize: 16,
    fontWeight: "bold",
  },
  appleButton: {
    width: "100%",
    height: 44,
    marginTop: 16,
  },
  errorText: {
    color: "#EF4444",
    marginBottom: 16,
    textAlign: "center",
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  separatorContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 24,
  },
  separatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
  },
  separatorText: {
    color: "rgba(255, 255, 255, 0.6)",
    marginHorizontal: 10,
    fontSize: 14,
  },
});

export default function AuthScreen() {
  const { signIn, signInAnonymously } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isAnonymousLoading, setIsAnonymousLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState(false);
  const [isAppleLoading, setIsAppleLoading] = useState(false);

  // Verwende den useGoogleAuth Hook aus dem Provider
  const { promptAsync, response } = useGoogleAuth();

  const handleAuthError = useCallback((error: Error) => {
    console.error("Authentication failed:", error);
    setError("Anmeldung fehlgeschlagen. Bitte versuchen Sie es erneut.");
    setIsLoading(false);
  }, []);

  const handleServerAuth = useCallback(
    async (authData: {
      authProvider: string;
      authId: string;
      username?: string;
      email?: string;
      picture?: string;
    }) => {
      try {
        const response = await fetch(
          `${process.env.EXPO_PUBLIC_API_URL}/auth/login`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(authData),
          }
        );

        const data: AuthResponse = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Server authentication failed");
        }

        await signIn(data.token);
        return true;
      } catch (error) {
        handleAuthError(error as Error);
        return false;
      }
    },
    [signIn, handleAuthError]
  );

  // Verarbeite die Google-Antwort, wenn sie sich ändert
  useEffect(() => {
    async function processGoogleResponse() {
      if (response?.type === "success" && response.params.id_token) {
        setIsLoading(true);
        setError(null);

        try {
          const id_token = response.params.id_token;
          const decoded: any = jwtDecode(id_token);
          console.log("Decoded token:", decoded);

          // Extract user information
          const firstName = decoded.given_name || decoded.name || "Google User";
          const email = decoded.email || "";
          const picture = decoded.picture || "";

          console.log("🔄 Exchanging Google token for server token...");

          // Nutze den handleServerAuth für konsistente Fehlerbehandlung
          await handleServerAuth({
            authProvider: "google",
            authId: id_token,
            username: firstName,
            email: email,
            picture: picture,
          });
        } catch (err) {
          console.error("Google Sign In Error:", err);
          setError(
            err instanceof Error ? err.message : "Ein Fehler ist aufgetreten"
          );
        } finally {
          setIsLoading(false);
        }
      } else if (response?.type === "error") {
        setError("Anmeldung fehlgeschlagen");
      }
    }

    processGoogleResponse();
  }, [response, handleServerAuth]);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      await promptAsync();
    } catch (err) {
      console.error("Google Sign In Error:", err);
      setError(
        err instanceof Error ? err.message : "Ein Fehler ist aufgetreten"
      );
      setIsLoading(false);
    }
    // setIsLoading wird im useEffect nach der Antwort auf false gesetzt
  }, [promptAsync]);

  const handleAppleAuth = useCallback(async () => {
    try {
      setIsAppleLoading(true);
      setError(null);

      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      await handleServerAuth({
        authProvider: "apple",
        authId: credential.user,
        username: credential.fullName?.givenName || "Apple User",
      });
    } catch (error) {
      handleAuthError(error as Error);
    } finally {
      setIsAppleLoading(false);
    }
  }, [handleServerAuth, handleAuthError]);

  useEffect(() => {
    const checkAppleAuth = async () => {
      const isAvailable = await AppleAuthentication.isAvailableAsync();
      setIsAppleAuthAvailable(isAvailable);
    };
    checkAppleAuth();
  }, []);

  // Handler for anonymous sign-in
  const handleAnonymousSignIn = useCallback(async () => {
    try {
      setIsAnonymousLoading(true);
      setError(null);
      await signInAnonymously();
    } catch (error) {
      console.error("Anonymous Sign In Error:", error);
      setError(
        error instanceof Error ? error.message : "Ein Fehler ist aufgetreten"
      );
    } finally {
      setIsAnonymousLoading(false);
    }
  }, [signInAnonymously]);

  return (
    <View style={styles.container}>
      {error && <Text style={styles.errorText}>{error}</Text>}

      <TouchableOpacity
        style={[styles.googleButton, isLoading && styles.buttonDisabled]}
        onPress={handleGoogleSignIn}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator color="#1F2937" />
        ) : (
          <Text style={styles.buttonText}>Mit Google fortfahren</Text>
        )}
      </TouchableOpacity>

      {isAppleAuthAvailable && (
        <TouchableOpacity
          style={[styles.appleButton, isAppleLoading && styles.buttonDisabled]}
          onPress={handleAppleAuth}
          disabled={isAppleLoading}
        >
          {isAppleLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Mit Apple fortfahren</Text>
          )}
        </TouchableOpacity>
      )}

      <View style={styles.separatorContainer}>
        <View style={styles.separatorLine} />
        <Text style={styles.separatorText}>ODER</Text>
        <View style={styles.separatorLine} />
      </View>

      <TouchableOpacity
        style={[
          styles.anonymousButton,
          isAnonymousLoading && styles.buttonDisabled,
        ]}
        onPress={handleAnonymousSignIn}
        disabled={isAnonymousLoading}
      >
        {isAnonymousLoading ? (
          <ActivityIndicator color="#FFFFFF" />
        ) : (
          <Text style={styles.anonymousText}>Ohne Anmeldung fortfahren</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}
