import Animated, { useSharedValue, withTiming } from 'react-native-reanimated';
import { animation } from '@/styles/theme';

// Define the structure of the returned animated values
interface CardFanAnimatedValues {
  translateX: Animated.SharedValue<number>;
  translateY: Animated.SharedValue<number>;
  rotate: Animated.SharedValue<number>;
  scale: Animated.SharedValue<number>;
  opacity: Animated.SharedValue<number>;
}

// Define the type for the animation function
type AnimateFanFunction = (
  index: number,
  cardCount: number,
  cardDimensions: { width: number; height: number }
) => void;

// Define and export the hook's return type
export interface CardFanAnimationHookResult extends CardFanAnimatedValues {
  animateFan: AnimateFanFunction;
}

// Helper to calculate fan target transform (returns plain numbers)
interface FanTargetTransform {
    translateX: number;
    translateY: number;
    rotate: number;
    scale: number;
}

const calculateFanTarget = (
    index: number,
    cardCount: number, // Keep for consistency, even if unused currently
    cardDimensions: { width: number; height: number }
  ): FanTargetTransform => {
  const radius = cardDimensions.width * 1.4;
  let angle = 0;
  if (index === 0) angle = -15;
  else if (index === 2) angle = 15;
  // Index 1 keeps angle = 0

  const radian = (angle * Math.PI) / 180;
  const targetXRelativeToCenter = radius * Math.sin(radian);
  const targetYRelativeToArcOrigin = -radius * Math.cos(radian) + radius * 0.6;
  const adjustedTranslateY = targetYRelativeToArcOrigin - cardDimensions.height / 2;
  const adjustedTranslateX = targetXRelativeToCenter - cardDimensions.width / 2;

  return {
    translateX: adjustedTranslateX,
    translateY: adjustedTranslateY,
    rotate: angle,
    scale: 1, // Assuming scale stays 1 for the fan
  };
};

// This hook provides animated values and a function to trigger the fan animation for ONE card.
// It does NOT take config like cardCount etc. as an argument anymore.
export const useCardFanAnimation = (): CardFanAnimationHookResult => {
  const translateX = useSharedValue(0); // Initial position (off-screen logic might be better handled by the component using this)
  const translateY = useSharedValue(1000); // Start off-screen below
  const rotate = useSharedValue(0);
  const scale = useSharedValue(0.8); // Match initial scale from selection hook
  const opacity = useSharedValue(0); // Start invisible

  const animateFan: AnimateFanFunction = (index, cardCount, cardDimensions) => {
    const target = calculateFanTarget(index, cardCount, cardDimensions);

    // Use withTiming for smooth transition
    translateX.value = withTiming(target.translateX, { duration: animation.timing.move.duration });
    translateY.value = withTiming(target.translateY, { duration: animation.timing.move.duration });
    rotate.value = withTiming(target.rotate, { duration: animation.timing.move.duration });
    scale.value = withTiming(target.scale, { duration: animation.timing.move.duration }); // Animate scale to 1
    opacity.value = withTiming(1, { duration: animation.timing.fadeIn.duration }); // Fade in
  };

  return {
    translateX,
    translateY,
    rotate,
    scale,
    opacity,
    animateFan,
  };
};