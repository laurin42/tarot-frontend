import { renderHook, act } from '@testing-library/react-native';
import { useCardFlipAnimation } from '../useCardFlipAnimation'; // Adjust path if needed

// --- Mock react-native-reanimated ---
// Keep track of the shared value's state for assertions
let mockFlipProgressState = { value: 0 };

// Mock the specific functions used by the hook
jest.mock('react-native-reanimated', () => {
  const actualReanimated = jest.requireActual('react-native-reanimated');

  const mockWithTiming = jest.fn((toValue, config, callback) => {
    // Directly update the mock state for testing
    mockFlipProgressState.value = toValue;
    // Simulate callback after timeout if provided (like in previous mocks)
    if (callback) {
      setTimeout(() => callback(true), config?.duration || 50);
    }
    return toValue; // Return target value
  });

  return {
    ...actualReanimated, // Keep other exports just in case
    useSharedValue: jest.fn((initialValue) => {
      mockFlipProgressState.value = initialValue; // Initialize/reset mock state
      // Return an object matching the SharedValue structure
      return {
        get value() {
          return mockFlipProgressState.value;
        },
        set value(newValue) {
           // For simplicity, assume direct assignment or timing call
           if (typeof newValue === 'number') {
             mockFlipProgressState.value = newValue;
           } else {
             // If newValue is a timing animation object from the mock, trigger it
             if (newValue === mockWithTiming) { // Basic check
                // Logic to handle the animation object if needed,
                // but withTiming mock handles state change directly now.
             }
           }
        },
      };
    }),
    useAnimatedStyle: jest.fn((styleFactory) => {
      // Execute the factory to catch errors, return dummy object
      try {
        styleFactory();
      } catch /* ignore error */ { /* ignore */ } // Removed unused 'e'
      return { MOCKED_STYLE_OBJECT: true };
    }),
    withTiming: mockWithTiming,
    interpolate: jest.fn((value, inputRange, outputRange) => {
       // Simplified interpolate mock: return the middle output value for basic checks
       // A more complex mock could try to simulate behavior based on 'value'
       return outputRange[Math.floor(outputRange.length / 2)];
    }),
    // No need to mock Extrapolate here as it's not used by the hook
  };
});

describe('useCardFlipAnimation Hook', () => {
  beforeEach(() => {
    // Reset mocks and state before each test
    jest.clearAllMocks();
    mockFlipProgressState.value = 0; // Reset shared value state
    jest.useFakeTimers(); // Use fake timers for withTiming simulation
  });

  afterEach(() => {
    // Clean up timers
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize flipProgress to 0', () => {
    const { result } = renderHook(() => useCardFlipAnimation());
    expect(result.current.flipProgress.value).toBe(0);
  });

  it('should return animated style objects', () => {
    const { result } = renderHook(() => useCardFlipAnimation());
    // Check that the styles are objects (content checked by reanimated mock)
    expect(result.current.frontAnimatedStyle).toBeInstanceOf(Object);
    expect(result.current.backAnimatedStyle).toBeInstanceOf(Object);
     // Check our mock identifier
    expect((result.current.frontAnimatedStyle as any).MOCKED_STYLE_OBJECT).toBe(true);
    expect((result.current.backAnimatedStyle as any).MOCKED_STYLE_OBJECT).toBe(true);
  });

  it('handleFlip should trigger withTiming to 1 when progress is 0', () => {
    const { result } = renderHook(() => useCardFlipAnimation(500));

    expect(result.current.flipProgress.value).toBe(0);

    act(() => {
      result.current.handleFlip();
    });

    const reanimatedMock = require("react-native-reanimated");
    expect(reanimatedMock.withTiming).toHaveBeenCalledTimes(1);
    expect(reanimatedMock.withTiming).toHaveBeenCalledWith(1, { duration: 500 }); 

    act(() => {
       jest.runAllTimers();
    });

    expect(mockFlipProgressState.value).toBe(1);
    expect(result.current.flipProgress.value).toBe(1);
  });

   it('handleFlip should trigger withTiming to 0 when progress is 1', () => {
     const { result } = renderHook(() => useCardFlipAnimation());

     act(() => {
       mockFlipProgressState.value = 1;
       result.current.handleFlip();
     });

     const reanimatedMock = require("react-native-reanimated");
     expect(reanimatedMock.withTiming).toHaveBeenCalledTimes(1);
     expect(reanimatedMock.withTiming).toHaveBeenCalledWith(0, { duration: 600 });

     act(() => {
        jest.runAllTimers();
     });

     expect(mockFlipProgressState.value).toBe(0);
     expect(result.current.flipProgress.value).toBe(0);
   });

   // Optional: Test dependency array if duration logic was complex
});
