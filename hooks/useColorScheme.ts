import { useColorScheme as _useColorScheme } from 'react-native';

// Expo Router uses this hook internally, so we wrap it to ensure
// consistent behavior and adherence to the expected type.
// This ensures that `null` is never returned, defaulting to 'light'.
export function useColorScheme(): ReturnType<typeof _useColorScheme> {
  return _useColorScheme() ?? 'light';
}
