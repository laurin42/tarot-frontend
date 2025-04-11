import { renderHook } from '@testing-library/react-native';
import { useColorScheme as useDeviceColorScheme } from 'react-native'; // Mock this
import { useColorScheme } from '../useColorScheme'; // The hook we are testing

// Mock the underlying react-native useColorScheme
jest.mock('react-native', () => ({
  // --- DO NOT use requireActual ---
  // ...jest.requireActual('react-native'), 

  // --- Mock only needed parts ---
  useColorScheme: jest.fn(),
  
  // Add Platform mock (copied from other tests)
  Platform: {
      OS: 'ios', // Or 'android', depending on what you want to test as default
      select: jest.fn((spec) => {
          return spec.ios ?? spec.default ?? spec.android;
      }),
      Version: 25, 
      constants: { /* Add constants if needed */ },
  },
  // Mock Appearance if needed, though useColorScheme is usually sufficient
  Appearance: {
    getColorScheme: jest.fn(),
    addChangeListener: jest.fn(),
    removeChangeListener: jest.fn(),
  },
}));

// Helper to set the mocked device color scheme
const setMockDeviceColorScheme = (scheme: 'light' | 'dark' | null | undefined) => {
   (useDeviceColorScheme as jest.Mock).mockReturnValue(scheme);
   // Also mock Appearance.getColorScheme if your hook might use it as a fallback
   require('react-native').Appearance.getColorScheme.mockReturnValue(scheme);
};


describe('useColorScheme', () => {
  beforeEach(() => {
    // Reset mocks before each test
    (useDeviceColorScheme as jest.Mock).mockClear();
    require('react-native').Appearance.getColorScheme.mockClear();
  });

  it('should return "light" when device color scheme is "light"', () => {
    setMockDeviceColorScheme('light');
    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBe('light');
    expect(useDeviceColorScheme).toHaveBeenCalledTimes(1);
  });

  it('should return "dark" when device color scheme is "dark"', () => {
    setMockDeviceColorScheme('dark');
    const { result } = renderHook(() => useColorScheme());
    expect(result.current).toBe('dark');
     expect(useDeviceColorScheme).toHaveBeenCalledTimes(1);
  });

   it('should return "light" (default) when device color scheme is null or undefined', () => {
    // Test with null
    setMockDeviceColorScheme(null);
    const { result: resultNull } = renderHook(() => useColorScheme());
    expect(resultNull.current).toBe('light');
    expect(useDeviceColorScheme).toHaveBeenCalledTimes(1);

    (useDeviceColorScheme as jest.Mock).mockClear(); // Clear calls for next check

    // Test with undefined
    setMockDeviceColorScheme(undefined);
     const { result: resultUndefined } = renderHook(() => useColorScheme());
    expect(resultUndefined.current).toBe('light');
    expect(useDeviceColorScheme).toHaveBeenCalledTimes(1);
  });

  // If your hook includes logic for web or specific overrides, add tests for those.
  // Since useColorScheme.ts seems to just re-export, these tests cover its basic behavior.
  // If useColorScheme.web.ts has different logic, it might need its own test file
  // or conditional tests within this file based on platform.

});

// Optional: Add tests for useColorScheme.web.ts if its logic differs significantly

describe('useColorScheme.web (if applicable)', () => {
    // Add specific tests for web behavior if useColorScheme.web.ts exists
    // and has unique logic (e.g., using matchMedia).
    // You might need to mock `window.matchMedia`.

    // Example:
    /*
    const mockMatchMedia = (matches: boolean, scheme: 'dark' | 'light') => {
        window.matchMedia = jest.fn().mockImplementation(query => ({
            matches: query === `(prefers-color-scheme: ${scheme})` ? matches : !matches,
            media: query,
            onchange: null,
            addListener: jest.fn(), // Deprecated
            removeListener: jest.fn(), // Deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        }));
    };

    beforeEach(() => {
       // Reset mocks if testing web version specifically
       // e.g., mockMatchMedia(true, 'dark');
    });

    it('web: should return dark if prefers-color-scheme is dark', () => {
        // Requires importing useColorScheme from the .web file specifically
        // or configuring Jest platform resolution.
        // const { useColorScheme: useWebColorScheme } = require('../useColorScheme.web');
        // const { result } = renderHook(() => useWebColorScheme());
        // expect(result.current).toBe('dark');
    });
    */
}); 