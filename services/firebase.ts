import { initializeApp, getApps } from '@react-native-firebase/app';
import { getAuth, signInAnonymously as firebaseSignInAnonymously, signOut as firebaseSignOut } from '@react-native-firebase/auth';
import { bugsnagService } from "./bugsnag";

type FirebaseAppOptions = Parameters<typeof initializeApp>[0];

// Initialize Firebase outside of any component
const initializeFirebase = (): void => {
  // Check if Firebase is already initialized
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
    bugsnagService?.notify(error);
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
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID || "",
  };

  try {
    // Log config for debugging (remove sensitive data in production)
    console.log("Initializing Firebase with config:", {
      projectId,
      hasApiKey: !!apiKey,
      hasAppId: !!appId,
    });

    // Initialize Firebase
    initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");

    bugsnagService?.leaveBreadcrumb("Firebase initialized", {
      firebase: {
        success: true,
        projectId,
      },
    });
  } catch (error) {
    console.error("Firebase initialization failed:", error);
    bugsnagService?.notify(error instanceof Error ? error : new Error("Firebase initialization failed"));
  }
};

// Initialize immediately
initializeFirebase();

// Export an authentication status check function
export const isFirebaseInitialized = (): boolean => getApps().length > 0;

// Implement anonymous sign-in function
export const signInAnonymously = async (): Promise<any | null> => {
  try {
    if (getApps().length === 0) {
      console.error("Firebase not initialized");
      return null;
    }

    const auth = getAuth();
    const { user } = await firebaseSignInAnonymously(auth);
    console.log('User signed in anonymously:', user?.uid);
    return user;
  } catch (error) {
    console.error('Anonymous sign-in error:', error);
    bugsnagService?.notify(error instanceof Error ? error : new Error("Anonymous sign-in failed"));
    return null;
  }
};

// Implement sign-out function
export const signOut = async (): Promise<void> => {
  try {
    if (getApps().length === 0) {
      console.error("Firebase not initialized");
      return;
    }

    const auth = getAuth();
    await firebaseSignOut(auth);
    console.log('User signed out successfully');
  } catch (error) {
    console.error('Sign-out error:', error);
    bugsnagService?.notify(error instanceof Error ? error : new Error("Sign-out failed"));
  }
};