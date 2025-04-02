import { useRef, useEffect, useCallback } from 'react';
import { Animated, Dimensions } from 'react-native';

interface CardFanConfig {
  cardCount: number;
  spreadAngle: number;
  cardDimensions: { width: number; height: number };
  currentRound: number;
  sessionStarted: boolean; // Add sessionStarted to trigger initial animation
}

export const useCardFanAnimation = ({ 
  cardCount, 
  spreadAngle, 
  cardDimensions,
  currentRound,
  sessionStarted 
}: CardFanConfig) => {
  const translateY = useRef(new Array(cardCount).fill(0).map(() => new Animated.Value(1000))).current;
  const translateX = useRef(new Array(cardCount).fill(0).map(() => new Animated.Value(0))).current;
  const rotations = useRef(new Array(cardCount).fill(0).map(() => new Animated.Value(0))).current;
  const scales = useRef(new Array(cardCount).fill(0).map(() => new Animated.Value(0.8))).current;

  const animateToFan = useCallback(() => {
    const { width: screenWidth } = Dimensions.get('window');
    const centerX = screenWidth / 2;
    const radius = cardDimensions.width * 1.5;
    
    const animations = Array(cardCount).fill(0).map((_, index) => {
      const angle = -spreadAngle / 2 + (spreadAngle / (cardCount - 1)) * index;
      const radian = (angle * Math.PI) / 180;
      
      const targetX = centerX + radius * Math.sin(radian);
      const targetY = -radius * Math.cos(radian) + radius;

      return Animated.parallel([
        Animated.spring(translateY[index], {
          toValue: targetY,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(translateX[index], {
          toValue: targetX - centerX,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(rotations[index], {
          toValue: angle,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.spring(scales[index], {
          toValue: 1,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
      ]);
    });

    return Animated.stagger(50, animations);
  }, [cardCount, spreadAngle, cardDimensions, translateX, translateY, rotations, scales]);

  // Trigger animation on both sessionStarted and currentRound changes
  useEffect(() => {
    if (sessionStarted) {
      // Reset to initial positions
      translateY.forEach(anim => anim.setValue(1000));
      translateX.forEach(anim => anim.setValue(0));
      rotations.forEach(anim => anim.setValue(0));
      scales.forEach(anim => anim.setValue(0.8));

      // Start animation with a slight delay
      const timer = setTimeout(() => {
        animateToFan().start();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [currentRound, sessionStarted, animateToFan, rotations, scales, translateX, translateY]); // Now it works correctly

  return {
    translateY,
    translateX,
    rotations,
    scales,
    animateToFan,
  };
};