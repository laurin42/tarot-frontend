import { renderHook, act } from "@testing-library/react-native";
// Remove direct import, theme will be mocked
// import { animation } from "@/styles/theme"; 

// Import hook and type
import {
  useCardFanAnimation,
  CardFanAnimationHookResult,
} from "../useCardFanAnimation"; 


// --- Mock the theme module --- 
jest.mock('@/styles/theme', () => ({
    animation: {
        timing: {
            fadeIn: { duration: 100 }, // Simple mock value
            fadeOut: { duration: 100 }, // Simple mock value
            move: {
                duration: 300, // Simple mock value for duration
                easing: jest.fn(t => t), // Simple linear mock
                useNativeDriver: true,
            },
        },
        // Add other parts of 'animation' if the hook uses them
    },
    // Mock other exports from theme if needed by the hook
}));

// --- Mock react-native-reanimated (Copied & adapted from useCardSelectionAnimation.test.ts) ---
let mockSharedValueRegistry = new Map<symbol, { _value: any }>(); 

interface MockAnimationObject {
    __isAnimation: true;
    type: 'timing' | 'delay' | 'spring'; // Added spring
    toValue?: any;
    config?: any;
    callback?: (finished?: boolean) => void; // Optional finished arg
    delayMs?: number;
    delayedAnimation?: MockAnimationObject; 
}

jest.mock("react-native-reanimated", () => {

    const mockWithTiming = jest.fn(
        (toValue, config, callback): MockAnimationObject => {
            return { __isAnimation: true, type: 'timing', toValue, config, callback };
        }
    );

     const mockWithDelay = jest.fn(
        (delayMs, delayedAnimation): MockAnimationObject => {
            return { __isAnimation: true, type: 'delay', delayMs, delayedAnimation };
        }
    );

    // Copied mock for withSpring
    const mockWithSpring = jest.fn((toValue, config, callback): MockAnimationObject => {
        return { __isAnimation: true, type: 'spring', toValue, config, callback };
    });

    const mockUseSharedValue = jest.fn((initialValue) => {
        const key = Symbol();
        mockSharedValueRegistry.set(key, { _value: initialValue });

        return {
            get value() {
                return mockSharedValueRegistry.get(key)?._value;
            },
            set value(newValue: any) {
                const internalState = mockSharedValueRegistry.get(key);
                if (!internalState) return;

                const executeTimingOrSpring = (anim: MockAnimationObject, targetKey: symbol, path: string[]) => {
                    const isSpring = anim.type === 'spring';
                    const duration = isSpring ? 500 : (anim.config?.duration ?? 300); // Default spring duration? Arbitrary 500
                    const targetVal = anim.toValue;
                    const cb = anim.callback;
                    const stateToUpdate = mockSharedValueRegistry.get(targetKey);
                    if (!stateToUpdate) return;

                    const updateValueAtPath = () => {
                         try {
                            // Use the direct update logic that worked
                              if (path.length === 0) {
                                 stateToUpdate._value = targetVal;
                              } else {
                                 let parent = stateToUpdate._value;
                                 for (let i = 0; i < path.length - 1; i++) {
                                     if (!parent || typeof parent !== 'object') { return; }
                                     parent = parent[path[i]];
                                 }
                                 if (!parent || typeof parent !== 'object') { return; }
                                 const finalKey = path[path.length - 1];
                                 if (parent.hasOwnProperty(finalKey)) {
                                    parent[finalKey] = targetVal;
                                 }
                              }
                         } catch (e) { /* handle error */ }
                    };

                    const runCallback = () => {
                        if(cb) { cb(true); }
                    };

                    if (duration === 0) {
                        updateValueAtPath();
                        runCallback();
                    } else {
                        setTimeout(() => {
                            updateValueAtPath();
                            runCallback();
                        }, duration);
                    }
                };

                 let containsAnimation = false;
                 const checkAndSchedule = (currentValue: any, currentPath: string[] = []) => {
                     if (currentValue?.__isAnimation) {
                         containsAnimation = true; 
                         const anim = currentValue as MockAnimationObject;
                         if (anim.type === 'timing' || anim.type === 'spring') {
                            executeTimingOrSpring(anim, key, currentPath);
                         } else if (anim.type === 'delay' && anim.delayedAnimation) {
                             const delay = anim.delayMs ?? 0;
                             setTimeout(() => {
                                 if(anim.delayedAnimation?.__isAnimation) {
                                     executeTimingOrSpring(anim.delayedAnimation, key, currentPath);
                                 }
                             }, delay);
                         }
                         return; 
                     }
                     if (typeof currentValue === 'object' && currentValue !== null) {
                         for (const propKey in currentValue) {
                             if (Object.prototype.hasOwnProperty.call(currentValue, propKey)) {
                                 checkAndSchedule(currentValue[propKey], [...currentPath, propKey]);
                             }
                         }
                     }
                 };

                checkAndSchedule(newValue); 
                if (!containsAnimation) {
                    internalState._value = newValue;
                } 
            },
        };
    });

     const mockRunOnJS = jest.fn((fn) => (...args: any[]) => fn(...args));

    const mockEasing = {
        // Add easing functions if needed
    };

    const mockUseAnimatedReaction = jest.fn(); 

    // Copied mock for useAnimatedStyle
    const mockUseAnimatedStyle = jest.fn((styleCallback) => {
        try {
            return styleCallback(); 
        } catch (e) {
            return {}; 
        }
    });

  return {
    // Provide all potentially needed mocks
    useSharedValue: mockUseSharedValue,
    withTiming: mockWithTiming,
    withSpring: mockWithSpring,
    withDelay: mockWithDelay,
    useAnimatedStyle: mockUseAnimatedStyle,
    runOnJS: mockRunOnJS,
    Easing: mockEasing, 
    useAnimatedReaction: mockUseAnimatedReaction,
    // ... add any other specific exports if needed
  };
});

// Remove Dimensions mock here, as theme is mocked
// jest.mock('react-native', () => ({ /* ... */ }));

describe("useCardFanAnimation", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSharedValueRegistry = new Map(); // Reset registry for shared values
    jest.useFakeTimers(); // Use fake timers for animations
  });

  afterEach(() => {
    jest.runOnlyPendingTimers(); 
    jest.useRealTimers();
  });

  it("should initialize with default transform values", () => {
    const { result } = renderHook<CardFanAnimationHookResult, void>(() =>
      useCardFanAnimation()
    );
    // Expect initial values defined in the hook
    expect(result.current.translateX.value).toBe(0);
    expect(result.current.translateY.value).toBe(1000); 
    expect(result.current.rotate.value).toBe(0);
    expect(result.current.scale.value).toBe(0.8);
    expect(result.current.opacity.value).toBe(0);
  });

  it("should animate to target values when animateFan is called for center card (index 1)", () => {
    const { result } = renderHook<CardFanAnimationHookResult, void>(() =>
      useCardFanAnimation()
    );
    const index = 1;
    const cardCount = 3;
    const cardDimensions = { width: 100, height: 150 };
    // Re-import mocked theme animation
    const { animation } = require('@/styles/theme'); 

    const expectedTarget: { translateX: number, translateY: number, rotate: number, scale: number, opacity: number } = { 
        translateX: 0, translateY: 0, rotate: 0, scale: 0, opacity: 0 
    };
    const expectedRadius = cardDimensions.width * 1.4;
    const expectedAngle = 0; 
    const expectedRadian = (expectedAngle * Math.PI) / 180;
    const expectedTargetXCenter = expectedRadius * Math.sin(expectedRadian);
    const expectedTargetYArc = -expectedRadius * Math.cos(expectedRadian) + expectedRadius * 0.6;
    expectedTarget.translateY = expectedTargetYArc - cardDimensions.height / 2;
    expectedTarget.translateX = expectedTargetXCenter - cardDimensions.width / 2;
    expectedTarget.rotate = expectedAngle;
    expectedTarget.scale = 1;
    expectedTarget.opacity = 1;

    const reanimatedMock = require("react-native-reanimated");

    act(() => {
      result.current.animateFan(index, cardCount, cardDimensions);
    });

    // Check if withTiming was called (immediately)
    expect(reanimatedMock.withTiming).toHaveBeenCalledWith(
      expectedTarget.translateX,
      expect.objectContaining({ duration: animation.timing.move.duration }) 
    );
    // ... add similar checks for other withTiming calls ...
    expect(reanimatedMock.withTiming).toHaveBeenCalledTimes(5); // 5 properties animated with withTiming

    // Advance timers
    act(() => {
        jest.runAllTimers();
    });

    // Check final state AFTER timers
    expect(result.current.translateX.value).toBeCloseTo(expectedTarget.translateX);
    expect(result.current.translateY.value).toBeCloseTo(expectedTarget.translateY);
    expect(result.current.rotate.value).toBe(expectedTarget.rotate);
    expect(result.current.scale.value).toBe(expectedTarget.scale);
    expect(result.current.opacity.value).toBe(expectedTarget.opacity);
  });

  // --- Adapt other tests (index 0 and index 2) similarly ---
  it("should animate to target values when animateFan is called for left card (index 0)", () => {
    const { result } = renderHook<CardFanAnimationHookResult, void>(() => useCardFanAnimation());
    const index = 0;
    const cardCount = 3;
    const cardDimensions = { width: 100, height: 150 };
    const { animation } = require('@/styles/theme');
    const reanimatedMock = require("react-native-reanimated");

    const expectedTarget: { translateX: number, translateY: number, rotate: number, scale: number, opacity: number } = { 
        translateX: 0, translateY: 0, rotate: 0, scale: 0, opacity: 0 
    };
    const expectedRadius = cardDimensions.width * 1.4;
    const expectedAngle = -15; 
    const expectedRadian = (expectedAngle * Math.PI) / 180;
    const expectedTargetXCenter = expectedRadius * Math.sin(expectedRadian);
    const expectedTargetYArc = -expectedRadius * Math.cos(expectedRadian) + expectedRadius * 0.6;
    expectedTarget.translateY = expectedTargetYArc - cardDimensions.height / 2;
    expectedTarget.translateX = expectedTargetXCenter - cardDimensions.width / 2;
    expectedTarget.rotate = expectedAngle;
    expectedTarget.scale = 1;
    expectedTarget.opacity = 1;

    act(() => {
      result.current.animateFan(index, cardCount, cardDimensions);
    });
    
    expect(reanimatedMock.withTiming).toHaveBeenCalledTimes(5);

    act(() => {
        jest.runAllTimers();
    });

    expect(result.current.translateX.value).toBeCloseTo(expectedTarget.translateX);
    expect(result.current.translateY.value).toBeCloseTo(expectedTarget.translateY);
    expect(result.current.rotate.value).toBe(expectedTarget.rotate);
    expect(result.current.scale.value).toBe(expectedTarget.scale);
    expect(result.current.opacity.value).toBe(expectedTarget.opacity);
  });

  it("should animate to target values when animateFan is called for right card (index 2)", () => {
    const { result } = renderHook<CardFanAnimationHookResult, void>(() => useCardFanAnimation());
    const index = 2;
    const cardCount = 3;
    const cardDimensions = { width: 100, height: 150 };
    const { animation } = require('@/styles/theme');
    const reanimatedMock = require("react-native-reanimated");

    const expectedTarget: { translateX: number, translateY: number, rotate: number, scale: number, opacity: number } = { 
        translateX: 0, translateY: 0, rotate: 0, scale: 0, opacity: 0 
    };
    const expectedRadius = cardDimensions.width * 1.4;
    const expectedAngle = 15; 
    const expectedRadian = (expectedAngle * Math.PI) / 180;
    const expectedTargetXCenter = expectedRadius * Math.sin(expectedRadian);
    const expectedTargetYArc = -expectedRadius * Math.cos(expectedRadian) + expectedRadius * 0.6;
    expectedTarget.translateY = expectedTargetYArc - cardDimensions.height / 2;
    expectedTarget.translateX = expectedTargetXCenter - cardDimensions.width / 2;
    expectedTarget.rotate = expectedAngle;
    expectedTarget.scale = 1;
    expectedTarget.opacity = 1;

    act(() => {
      result.current.animateFan(index, cardCount, cardDimensions);
    });

    expect(reanimatedMock.withTiming).toHaveBeenCalledTimes(5);

    act(() => {
        jest.runAllTimers();
    });

    expect(result.current.translateX.value).toBeCloseTo(expectedTarget.translateX);
    expect(result.current.translateY.value).toBeCloseTo(expectedTarget.translateY);
    expect(result.current.rotate.value).toBe(expectedTarget.rotate);
    expect(result.current.scale.value).toBe(expectedTarget.scale);
    expect(result.current.opacity.value).toBe(expectedTarget.opacity);
  });
});
