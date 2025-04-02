import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

class Storage {
  async setItem(key: string, value: string) {
    if (Platform.OS === 'web') {
      try {
        localStorage.setItem(key, value);
      } catch (err) {
        console.error('Error setting localStorage key:', err);
      }
    } else {
      try {
        await SecureStore.setItemAsync(key, value);
      } catch (err) {
        console.error('Error setting SecureStore key:', err);
      }
    }
  }

  async getItem(key: string): Promise<string | null> {
    if (Platform.OS === 'web') {
      try {
        return localStorage.getItem(key);
      } catch (err) {
        console.error('Error getting localStorage key:', err);
        return null;
      }
    } else {
      try {
        return await SecureStore.getItemAsync(key);
      } catch (err) {
        console.error('Error getting SecureStore key:', err);
        return null;
      }
    }
  }

  async removeItem(key: string) {
    if (Platform.OS === 'web') {
      try {
        localStorage.removeItem(key);
      } catch (err) {
        console.error('Error removing localStorage key:', err);
      }
    } else {
      try {
        await SecureStore.deleteItemAsync(key);
      } catch (err) {
        console.error('Error removing SecureStore key:', err);
      }
    }
  }
}

export const storage = new Storage();