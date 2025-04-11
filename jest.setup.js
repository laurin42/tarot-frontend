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

// Removed manual React Native mocks to rely on jest-expo preset.
// Add specific mocks below ONLY if jest-expo doesn't cover them
// and they are causing errors. 