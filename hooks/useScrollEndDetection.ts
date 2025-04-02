import { useState } from 'react';
import { NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

export function useScrollEndDetection(paddingToBottom = 20) {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isCloseToBottom =
      layoutMeasurement.height + contentOffset.y >=
      contentSize.height - paddingToBottom;

    if (isCloseToBottom) {
      setHasScrolledToEnd(true);
    }
  };

  return { hasScrolledToEnd, handleScroll };
}