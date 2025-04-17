import { PixelRatio } from 'react-native'; // Import PixelRatio
/* global jest, setTimeout, clearTimeout */

// --- Polyfills ---

// Mock setImmediate
global.setImmediate = (callback) => setTimeout(callback, 0);

// Mock requestAnimationFrame
global.requestAnimationFrame = function (callback) {
    return setTimeout(callback, 0);
};

// Mock cancelAnimationFrame
global.cancelAnimationFrame = function (id) {
    clearTimeout(id);
};

// --- End Polyfills ---

// --- Mock AsyncStorage ---
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// --- Mock Pixel Ratio ---
const mockGet = jest.fn(() => 1); // Standard PixelRatio von 1

jest.spyOn(PixelRatio, 'get').mockImplementation(mockGet);
jest.spyOn(PixelRatio, 'getFontScale').mockImplementation(() => 1); // Standard FontScale
jest.spyOn(PixelRatio, 'getPixelSizeForLayoutSize').mockImplementation((layoutSize) => layoutSize);
jest.spyOn(PixelRatio, 'roundToNearestPixel').mockImplementation((layoutSize) => Math.round(layoutSize));

// --- Mock specific react-native functions/hooks ---
// We mock react-native here to specifically override useColorScheme
// while letting jest-expo handle the rest of the module's mocks.
jest.mock('react-native', () => {
    const RN = jest.requireActual('react-native');

    // Override useColorScheme
    RN.useColorScheme = jest.fn(() => 'light');

    // If other specific mocks are needed later for 'react-native' itself,
    // they can be added here.

    // Return the modified RN object
    return RN;
});
// --- End Mock specific react-native functions/hooks ---

// --- Mock react-native Animated ---
jest.mock('react-native/Libraries/Animated/Animated', () => {
    const ActualAnimated = jest.requireActual('react-native/Libraries/Animated/Animated');

    // Einfacher Mock für Animated.Value (ohne Typen)
    class MockValue {
        constructor(initialValue) {
            this._value = initialValue;
        }
        setValue(newValue) {
            this._value = newValue;
        }
        interpolate() { return this; }
        addListener() { return 'mockListenerId'; }
        removeListener() { }
        stopAnimation() { }
    }

    return {
        ...ActualAnimated,
        Value: MockValue,
        timing: (value, config) => ({
            start: (callback) => {
                if (typeof value?.setValue === 'function') {
                    value.setValue(config.toValue);
                }
                if (callback) {
                    callback();
                }
            },
            stop: jest.fn(),
        }),
        View: ActualAnimated.View,
        Text: ActualAnimated.Text,
    };
});
// --- Ende Mock react-native Animated ---

// --- Mock react-native-reanimated ---
// Verwende den eingebauten Mock von Reanimated
jest.mock('react-native-reanimated', () => {
    const Reanimated = require('react-native-reanimated/mock');

    // Hier könntest du spezifische Funktionen von Reanimated überschreiben, falls nötig
    // Beispiel: Reanimated.useSharedValue = jest.fn()...

    return Reanimated;
});


// --- Mock TouchableOpacity ---
jest.mock('react-native/Libraries/Components/Touchable/TouchableOpacity', () => {
    const React = require('react');

    const MockTouchableOpacity = (props) => {
        return React.createElement('TouchableOpacity', props, props.children);
    };
    MockTouchableOpacity.displayName = 'TouchableOpacity';
    return MockTouchableOpacity;
});

// Removed manual React Native mocks to rely on jest-expo preset.
// Add specific mocks below ONLY if jest-expo doesn't cover them
// and they are causing errors. 