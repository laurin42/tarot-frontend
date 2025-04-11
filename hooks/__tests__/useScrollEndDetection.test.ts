import { renderHook, act } from '@testing-library/react-native';
import { useScrollEndDetection } from '../useScrollEndDetection';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

// Helper function to create a mock scroll event
const createMockScrollEvent = (
  layoutHeight: number,
  contentOffsetY: number,
  contentHeight: number
): NativeSyntheticEvent<NativeScrollEvent> => {
  // The structure needs to match NativeSyntheticEvent<NativeScrollEvent>
  // We only need the relevant properties for the hook's calculation.
  return {
    nativeEvent: {
      layoutMeasurement: { height: layoutHeight, width: 0 }, // Width is irrelevant here
      contentOffset: { y: contentOffsetY, x: 0 }, // X is irrelevant here
      contentSize: { height: contentHeight, width: 0 }, // Width is irrelevant here
      contentInset: { top: 0, left: 0, bottom: 0, right: 0 }, // Not used by hook
      zoomScale: 1, // Not used by hook
    },
    // These properties are technically part of NativeSyntheticEvent but often not needed for mocks
    bubbles: true,
    cancelable: false,
    currentTarget: 0, // Use 0 as placeholder for unused currentTarget
    defaultPrevented: false,
    eventPhase: 0,
    isDefaultPrevented: () => false,
    isPropagationStopped: () => false,
    isTrusted: true,
    persist: () => {},
    preventDefault: () => {},
    stopPropagation: () => {},
    targetInst: undefined, // Deprecated but might be expected by types
    timeStamp: Date.now(),
    type: '',
    view: undefined, // Deprecated
  };
};


describe('useScrollEndDetection Hook', () => {
  it('should initialize with hasScrolledToEnd as false', () => {
    const { result } = renderHook(() => useScrollEndDetection());
    expect(result.current.hasScrolledToEnd).toBe(false);
  });

  it('should set hasScrolledToEnd to true when scrolled close to bottom (default padding)', () => {
    const { result } = renderHook(() => useScrollEndDetection()); // default padding = 20

    // Simulate scroll event: layoutHeight=600, contentHeight=1000, offsetY=381 (1000 - 600 - 19 = 381)
    // Calculation: 600 + 381 >= 1000 - 20  => 981 >= 980 (true)
    const scrollEvent = createMockScrollEvent(600, 381, 1000);

    act(() => {
      result.current.handleScroll(scrollEvent);
    });

    expect(result.current.hasScrolledToEnd).toBe(true);
  });

  it('should set hasScrolledToEnd to true when scrolled exactly to bottom', () => {
    const { result } = renderHook(() => useScrollEndDetection()); // default padding = 20

    // Simulate scroll event: layoutHeight=600, contentHeight=1000, offsetY=400 (1000 - 600)
    // Calculation: 600 + 400 >= 1000 - 20 => 1000 >= 980 (true)
    const scrollEvent = createMockScrollEvent(600, 400, 1000);

    act(() => {
      result.current.handleScroll(scrollEvent);
    });

    expect(result.current.hasScrolledToEnd).toBe(true);
  });

  it('should not set hasScrolledToEnd to true when not scrolled close to bottom', () => {
    const { result } = renderHook(() => useScrollEndDetection()); // default padding = 20

    // Simulate scroll event: layoutHeight=600, contentHeight=1000, offsetY=300
    // Calculation: 600 + 300 >= 1000 - 20 => 900 >= 980 (false)
    const scrollEvent = createMockScrollEvent(600, 300, 1000);

    act(() => {
      result.current.handleScroll(scrollEvent);
    });

    expect(result.current.hasScrolledToEnd).toBe(false);
  });

  it('should remain true once hasScrolledToEnd becomes true', () => {
    const { result } = renderHook(() => useScrollEndDetection());

    // Scroll to end
    const scrollToEndEvent = createMockScrollEvent(600, 400, 1000);
    act(() => {
      result.current.handleScroll(scrollToEndEvent);
    });
    expect(result.current.hasScrolledToEnd).toBe(true);

    // Scroll back up
    const scrollUpEvent = createMockScrollEvent(600, 100, 1000);
    act(() => {
      result.current.handleScroll(scrollUpEvent);
    });

    // Should still be true
    expect(result.current.hasScrolledToEnd).toBe(true);
  });

  it('should respect custom paddingToBottom value', () => {
    const customPadding = 50;
    const { result } = renderHook(() => useScrollEndDetection(customPadding));

    // Simulate scroll event: layoutHeight=600, contentHeight=1000, offsetY=360
    // Calculation: 600 + 360 >= 1000 - 50 => 960 >= 950 (true)
    const scrollEventNear = createMockScrollEvent(600, 360, 1000);
    act(() => {
      result.current.handleScroll(scrollEventNear);
    });
    expect(result.current.hasScrolledToEnd).toBe(true);

    // Reset hook instance for next check
    const { result: result2 } = renderHook(() => useScrollEndDetection(customPadding));
    // Simulate scroll event: layoutHeight=600, contentHeight=1000, offsetY=340
    // Calculation: 600 + 340 >= 1000 - 50 => 940 >= 950 (false)
    const scrollEventFar = createMockScrollEvent(600, 340, 1000);
    act(() => {
        result2.current.handleScroll(scrollEventFar);
    });
    expect(result2.current.hasScrolledToEnd).toBe(false);
  });

}); 