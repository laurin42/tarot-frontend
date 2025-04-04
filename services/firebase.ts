import { initializeApp, getApps } from '@react-native-firebase/app';
import { getAuth, signInAnonymously as firebaseSignInAnonymously, signOut as firebaseSignOut } from '@react-native-firebase/auth';

type FirebaseAppOptions = Parameters<typeof initializeApp>[0];

// Hilfsfunktion, um Bugsnag bei Bedarf zu laden und zu verwenden
const reportErrorToBugsnag = async (error: Error | string) => {
    try {
        // Dynamischer Import *nur* wenn ein Fehler gemeldet werden soll
        const { bugsnagService } = await import("./bugsnag");
        if (bugsnagService && bugsnagService.isStarted && bugsnagService.isStarted()) { // Prüfen ob init aufgerufen wurde
            bugsnagService.notify(error);
        } else { // Service loaded, but not started
            // Optional: Versuchen zu initialisieren und dann melden (kann zu Race Conditions führen)
             console.warn("Bugsnag was not initialized when trying to report Firebase error.");
             // bugsnagService.init(); // Vorsicht mit erneutem Init
             // bugsnagService.notify(error);
             console.error("[Bugsnag not ready] Firebase Error:", error);
        }
    } catch (importError) { // Handles if loading bugsnagService failed
        console.error("Failed to dynamically import bugsnagService to report Firebase error:", importError);
        console.error("Original Firebase Error:", error); // Logge den ursprünglichen Fehler trotzdem
    }
};

const leaveBugsnagBreadcrumb = async (message: string, metadata?: any) => {
     try {
         const { bugsnagService } = await import("./bugsnag");
         if (bugsnagService && bugsnagService.isStarted && bugsnagService.isStarted()) {
             bugsnagService.leaveBreadcrumb(message, metadata);
         } else {
              console.log("[Bugsnag not ready] Firebase Breadcrumb:", message, metadata);
         }
     } catch (importError) {
         console.error("Failed to dynamically import bugsnagService for Firebase breadcrumb:", importError);
          console.log("Original Firebase Breadcrumb:", message, metadata);
     }
};


const initializeFirebase = (): void => {
  try {
    if (getApps().length > 0) {
      console.log("Firebase is already initialized");
      return;
    }

    console.log("Starting Firebase initialization...");
    
    const apiKey = process.env.EXPO_PUBLIC_FIREBASE_API_KEY;
    const appId = process.env.EXPO_PUBLIC_FIREBASE_APP_ID;
    const projectId = process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID;

    if (!apiKey || !appId || !projectId) {
      const error = new Error("Firebase configuration missing required values (apiKey, appId, projectId)");
      console.error(error);
      reportErrorToBugsnag(error);
      return;
    }

    const firebaseConfig: FirebaseAppOptions = {
      apiKey,
      projectId,
      appId,
      databaseURL: `https://${projectId}.firebaseio.com`,
      authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || "",
      storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET || "",
      messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "",
    };

    // Log config for debugging (remove sensitive data in production)
    console.log("Initializing Firebase with config:", {
      projectId,
      hasApiKey: !!apiKey,
      hasAppId: !!appId,
    });

    // Initialize Firebase
    initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");

    leaveBugsnagBreadcrumb("Firebase initialized", {
      firebase: {
        success: true,
        projectId,
      },
    });
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    reportErrorToBugsnag(error instanceof Error ? error : new Error("Firebase initialization failed"));
  }
};

// Wir verzögern die Initialisierung, um sicherzustellen, dass sie in der korrekten Umgebung stattfindet
setTimeout(() => {
  initializeFirebase();
}, 0);

// Export an authentication status check function
export const isFirebaseInitialized = (): boolean => {
  try {
    return getApps().length > 0;
  } catch (error) {
    console.error("Error checking Firebase initialization:", error);
    return false;
  }
};

// Implement anonymous sign-in function
export const signInAnonymously = async (): Promise<any | null> => {
  try {
    if (!isFirebaseInitialized()) {
      console.error("Firebase not initialized");
      return null;
    }

    const auth = getAuth();
    const { user } = await firebaseSignInAnonymously(auth);
    console.log('User signed in anonymously:', user?.uid);
    return user;
  } catch (error) {
    console.error('Anonymous sign-in error:', error);
    reportErrorToBugsnag(error instanceof Error ? error : new Error("Anonymous sign-in failed"));
    return null;
  }
};

// Implement sign-out function
export const signOut = async (): Promise<void> => {
  try {
    if (!isFirebaseInitialized()) {
      console.error("Firebase not initialized");
      return;
    }

    const auth = getAuth();
    await firebaseSignOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign-out error:', error);
    reportErrorToBugsnag(error instanceof Error ? error : new Error("Sign-out failed"));
  }
};