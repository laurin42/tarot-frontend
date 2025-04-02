import { useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import { animationPresets } from '@/styles/theme';

export const useCardSelectionAnimation = (onCardPositioned?: () => void) => {
  const instructionOpacity = useRef(new Animated.Value(0)).current;
  const stackOpacity = useRef(new Animated.Value(1)).current;
  const selectedCardPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const selectedCardScale = useRef(new Animated.Value(1)).current;

  // Show instruction animation
  const showInstruction = () => {
    return Animated.timing(instructionOpacity, {
      toValue: 1,
      ...animationPresets.fadeIn,
    });
  };

  // Reset animations for new round
  const resetAnimations = () => {
    stackOpacity.setValue(1);
    selectedCardPosition.setValue({ x: 0, y: 0 });
    selectedCardScale.setValue(1);
    instructionOpacity.setValue(0);
  };

  // Handle the entire card selection animation sequence
  const animateCardSelection = (
    card: any, 
    currentRound: number,
    drawnSlotPositions: { x: number; y: number }[], 
    onComplete: (card: any) => void
  ) => {
    // First animation: fade out instructions and other cards
    Animated.parallel([
      Animated.timing(instructionOpacity, {
        toValue: 0,
        ...animationPresets.fadeOut,
      }),
      Animated.timing(stackOpacity, {
        toValue: 0,
        duration: 800, // Slightly longer for smoother transition
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Calculate target position for the selected card
      const screenWidth = Dimensions.get("window").width;
      const screenHeight = Dimensions.get("window").height;

      const targetSlot = drawnSlotPositions[currentRound] || {
        x: screenWidth / 2,
        y: 120,
      };

      const targetX = targetSlot.x - screenWidth / 2;
      const targetY = targetSlot.y - 100;

      // Second animation: move card to target position
      Animated.sequence([
        Animated.delay(100),
        Animated.parallel([
          Animated.timing(selectedCardPosition, {
            toValue: { x: targetX, y: targetY },
            ...animationPresets.move,
          }),
          Animated.timing(selectedCardScale, {
            toValue: 0.9,
            ...animationPresets.move,
          }),
        ]),
      ]).start(() => {
        // Animation complete
        if (onCardPositioned) {
          onCardPositioned();
        }
        
        // Call the provided callback with the selected card
        onComplete({
          ...card,
          showFront: true,
          isSelected: true,
        });
      });
    });
  };

  return {
    // Animation values
    instructionOpacity,
    stackOpacity,
    selectedCardPosition,
    selectedCardScale,
    
    // Animation functions
    showInstruction,
    resetAnimations,
    animateCardSelection,
  };
};