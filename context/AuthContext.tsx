import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useUser } from "./UserContext";
import auth from "@react-native-firebase/auth";
import { signOut as firebaseSignOut } from "@/services/firebase";

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isGuest: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (token: string) => Promise<void>;
  signOut: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  skipLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    token: null,
    isAuthenticated: false,
    isLoading: true,
    isGuest: false,
  });

  // Use UserContext to manage user data
  const { setUser } = useUser();

  // Bei App-Start Token aus Storage laden
  useEffect(() => {
    const loadToken = async () => {
      try {
        const token = await AsyncStorage.getItem("userToken");
        console.log(
          "Token beim App-Start:",
          token ? "vorhanden" : "nicht vorhanden"
        );

        setAuthState({
          token: token,
          isAuthenticated: !!token,
          isLoading: false,
          isGuest: false,
        });
      } catch (error) {
        console.error("Fehler beim Laden des Tokens:", error);
        setAuthState({
          token: null,
          isAuthenticated: false,
          isLoading: false,
          isGuest: false,
        });
      }
    };

    loadToken();
  }, []);

  const signIn = async (token: string) => {
    try {
      console.log("Token speichern...");
      await AsyncStorage.setItem("userToken", token);

      setAuthState({
        token,
        isAuthenticated: true,
        isLoading: false,
        isGuest: false,
      });
      console.log("Anmeldung erfolgreich");
    } catch (error) {
      console.error("Fehler bei der Anmeldung:", error);
      throw error;
    }
  };

  // Implement a proper signOut function
  const signOut = async () => {
    try {
      console.log("Beginne Abmeldeprozess...");

      // Clear the token
      await AsyncStorage.removeItem("userToken");
      console.log("Token entfernt");

      // Sign out from Firebase
      await firebaseSignOut();

      // Reset user data
      setUser(null);
      console.log("Benutzerdaten zurückgesetzt");

      // Update auth state last
      setAuthState({
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isGuest: false,
      });
      console.log("Authentifizierungsstatus zurückgesetzt");

      return Promise.resolve();
    } catch (error) {
      console.error("Fehler beim Abmelden:", error);
      return Promise.reject(error);
    }
  };

  // New function for anonymous sign-in
  const signInAnonymously = async () => {
    try {
      console.log("Starte anonyme Anmeldung...");
      setAuthState((prev) => ({ ...prev, isLoading: true }));

      // Use Firebase anonymous auth
      const { user } = await auth().signInAnonymously();
      console.log("Firebase anonymous auth successful", user.uid);

      // Get the Firebase ID token
      const idToken = await user.getIdToken();

      // Call your backend to register/login the anonymous user
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            authProvider: "anonymous",
            authId: `anonymous|${user.uid}`,
            token: idToken,
            username: "Anonymer Benutzer",
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Anonyme Anmeldung fehlgeschlagen");
      }

      // Save backend token
      await AsyncStorage.setItem("userToken", data.token);

      // Set user data if available
      if (data.user) {
        setUser(data.user);
      }

      // Update auth state
      setAuthState({
        token: data.token,
        isAuthenticated: true,
        isLoading: false,
        isGuest: false,
      });

      console.log("Anonyme Anmeldung erfolgreich");
      return Promise.resolve();
    } catch (error) {
      console.error("Fehler bei anonymer Anmeldung:", error);
      setAuthState((prev) => ({
        ...prev,
        isLoading: false,
        isAuthenticated: false,
        isGuest: false,
      }));
      return Promise.reject(error);
    }
  };

  // NEU: Funktion für den Gast-Modus
  const skipLogin = () => {
    console.log("Skipping login, entering guest mode.");
    setUser(null); // Kein User im UserContext
    setAuthState({
      token: null, // Kein Token
      isAuthenticated: false, // Nicht authentifiziert
      isLoading: false, // Laden abgeschlossen
      isGuest: true, // Ist Gast
    });
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        signIn,
        signOut,
        signInAnonymously,
        skipLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
