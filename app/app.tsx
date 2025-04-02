import "react-native-gesture-handler";
import { useEffect } from "react";
import { ExpoRoot } from "expo-router";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Import korrektes Firebase
import { firebase, auth, signInAnonymously } from "@/services/firebase";
import { bugsnagService } from "@/services/bugsnag";

function App(): JSX.Element {
  useEffect(() => {
    const performAnonymousLogin = async (): Promise<void> => {
      try {
        console.log("Attempting anonymous login...");

        // Prüfen, ob Firebase initialisiert wurde
        if (firebase.apps.length === 0) {
          throw new Error("Cannot perform login: Firebase not initialized");
        }

        const userCredential = await auth().signInAnonymously();
        const user = userCredential.user;

        console.log("Anonymous login successful:", user.uid);

        // Store user information in AsyncStorage
        await AsyncStorage.setItem("userToken", user.uid);

        // Set Bugsnag with user information
        bugsnagService.setUser(user.uid, "Anonymous", "");
        bugsnagService.leaveBreadcrumb("User signed in anonymously", {
          userId: user.uid,
        });
      } catch (error) {
        console.error("Anonymous login failed:", error);
        bugsnagService.notify(
          error instanceof Error ? error : new Error("Anonymous login failed")
        );
      }
    };

    performAnonymousLogin();
  }, []);

  return (
    <ErrorBoundary>
      <ExpoRoot context={require.context(".", true, /^\.\/app(_|\/).*$/)} />
    </ErrorBoundary>
  );
}

export default App;
