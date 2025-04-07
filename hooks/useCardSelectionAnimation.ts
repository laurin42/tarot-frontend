import { useRef, useCallback } from 'react';
import { Animated, Dimensions } from 'react-native';
import { animation } from '@/styles/theme';

export const useCardSelectionAnimation = (onCardPositioned?: () => void) => {
  const instructionOpacity = useRef(new Animated.Value(0)).current;
  const stackOpacity = useRef(new Animated.Value(1)).current;
  const selectedCardPosition = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current;
  const selectedCardScale = useRef(new Animated.Value(1)).current;

  // Wrap functions in useCallback
  const showInstruction = useCallback(() => {
    return Animated.timing(instructionOpacity, {
      toValue: 1,
      ...animation.timing.fadeIn,
    });
  }, [instructionOpacity]);

  const resetAnimations = useCallback(() => {
    stackOpacity.setValue(1);
    selectedCardPosition.setValue({ x: 0, y: 0 });
    selectedCardScale.setValue(1);
    instructionOpacity.setValue(0);
  }, [stackOpacity, selectedCardPosition, selectedCardScale, instructionOpacity]);

  const animateCardSelection = useCallback(
    (
      card: any,
      currentRound: number,
      drawnSlotPositions: { x: number; y: number }[],
      onComplete: (card: any) => void
    ) => {
      // First animation: fade out instructions and other cards
      Animated.parallel([
        Animated.timing(instructionOpacity, {
          toValue: 0,
          ...animation.timing.fadeOut,
        }),
        Animated.timing(stackOpacity, {
          toValue: 0,
          duration: 800, // Slightly longer for smoother transition
          useNativeDriver: true,
        }),
      ]).start(() => {
        // Calculate target position for the selected card
        const screenWidth = Dimensions.get("window").width;

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
              ...animation.timing.move,
            }),
            Animated.timing(selectedCardScale, {
              toValue: 0.9,
              ...animation.timing.move,
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
    },
    [instructionOpacity, stackOpacity, selectedCardPosition, selectedCardScale, onCardPositioned]
  );

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