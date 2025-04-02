import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { storage } from "../utils/storage"; // Use your storage utility instead

// Update your UserProfile interface to include all needed fields
interface User {
  id: number;
  authId: string;
  email: string;
  name?: string;
  picture?: string;
  goals?: string;
  // Neue Felder hinzufügen
  gender?: string;
  zodiacSign?: string;
  birthday?: string;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  updateGoals: (
    goals: string,
    additionalFields?: {
      gender?: string;
      zodiacSign?: string;
      birthday?: string;
    }
  ) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user data from storage on mount
  useEffect(() => {
    async function loadUserData() {
      try {
        const userData = await AsyncStorage.getItem("userData");
        if (userData) {
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error("Failed to load user data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, []);

  // Save user data to storage when it changes
  useEffect(() => {
    if (user) {
      storage
        .setItem("userData", JSON.stringify(user))
        .catch((error) => console.error("Failed to save user data:", error));
    }
  }, [user]);

  const updateGoals = async (
    goals: string,
    additionalFields?: {
      gender?: string;
      zodiacSign?: string;
      birthday?: string;
    }
  ) => {
    if (!user) {
      console.error("Cannot update goals: No user is logged in");
      throw new Error("User not authenticated");
    }

    try {
      // Get the auth token
      const token = await storage.getItem("userToken");
      if (!token) {
        throw new Error("No authentication token available");
      }

      console.log(`🔄 Updating profile for user:`, user);

      // IMPORTANT: You're using authId in backend but sending id in frontend
      // We need to use authId since that's what your endpoint expects
      if (!user.authId) {
        console.error("User has no authId:", user);
        throw new Error("User has no authId");
      }

      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/users/${user.authId}/goals`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`, // Add token for auth
          },
          body: JSON.stringify({
            goals,
            ...additionalFields,
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server rejected profile update:", errorText);
        throw new Error(`Server error: ${response.status}`);
      }

      const updatedUser = await response.json();

      // Update the local user state
      setUser({
        ...user,
        goals,
        ...additionalFields,
        updatedAt: updatedUser.updatedAt,
      });

      console.log("✅ Profile updated successfully");
    } catch (error) {
      console.error("Failed to update profile:", error);
      throw error;
    }
  };

  const value = {
    user,
    setUser,
    updateGoals,
    loading,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
