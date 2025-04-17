import { useCallback } from 'react';
import {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
} from 'react-native-reanimated';

export interface CardFlipAnimationResult {
  flipProgress: { value: number };
  frontAnimatedStyle: Record<string, any>;
  backAnimatedStyle: Record<string, any>;
  handleFlip: () => void;
}

export const useCardFlipAnimation = (duration = 600): CardFlipAnimationResult => {
  const flipProgress = useSharedValue(0);

  const frontAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(flipProgress.value, [0, 1], [0, 180], 'clamp');
    const opacity = interpolate(
      flipProgress.value,
      [0, 0.5, 0.5, 1],
      [1, 1, 0, 0],
      'clamp'
    );
    return {
      opacity,
      transform: [{ rotateY: `${rotate}deg` }],
    };
  });

  const backAnimatedStyle = useAnimatedStyle(() => {
    const rotate = interpolate(flipProgress.value, [0, 1], [180, 360], 'clamp');
    const opacity = interpolate(
      flipProgress.value,
      [0, 0.5, 0.5, 1],
      [0, 0, 1, 1],
      'clamp'
    );
    return {
      opacity,
      transform: [{ rotateY: `${rotate}deg` }],
    };
  });

  const handleFlip = useCallback(() => {
    flipProgress.value = withTiming(flipProgress.value === 0 ? 1 : 0, {
      duration,
    });
  }, [flipProgress, duration]);

  return {
    flipProgress,
    frontAnimatedStyle,
    backAnimatedStyle,
    handleFlip,
  };
};
