import { useCallback, useRef } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  withTiming,
  withSpring,
  Easing,
  runOnJS,
  useAnimatedReaction,
  withDelay,
} from 'react-native-reanimated';
import { animation } from '@/styles/theme';
import { ISelectedAndShownCard } from '@/constants/tarotcards';

// Type for the transform values of a single card
export interface CardTransform {
  translateX: number;
  translateY: number;
  rotate: number;
  scale: number;
  opacity: number;
  zIndex: number;
}

// Type for the shared value holding all card transforms, mapped by card ID
export type CardTransformMap = Record<string, CardTransform>;

// Type for the callback more specifically if possible
type OnSelectionComplete = (card: ISelectedAndShownCard) => void;

// Define the hook's actual return structure
interface CardSelectionAnimationHookReturn {
  instructionOpacity: Animated.SharedValue<number>;
  cardTransforms: Animated.SharedValue<CardTransformMap>;
  showInstruction: () => void;
  resetAnimations: () => void;
  animateCardSelection: (
    selectedCard: ISelectedAndShownCard,
    allCards: ISelectedAndShownCard[],
    currentRound: number,
    drawnSlotPositions: { x: number; y: number }[],
    cardDimensions: { width: number; height: number },
    onComplete: OnSelectionComplete
  ) => void;
  updateAllCardTransforms: (
    cards: ISelectedAndShownCard[],
    sessionStarted: boolean,
    spreadAngle: number, // Keep even if calculation is internal
    cardDimensions: { width: number; height: number }
  ) => void;
}

// Export the return type
export type UseCardSelectionAnimationResult = CardSelectionAnimationHookReturn;

// Default transform state for a card (off-screen or initial state)
const getDefaultTransform = (index: number, cardCount: number): CardTransform => ({
  translateX: 0,
  translateY: 1000, // Start off-screen
  rotate: 0,
  scale: 0.8,
  opacity: 0, // Start invisible
  zIndex: cardCount - index, // Initial stacking order
});

// Helper to calculate fan target transform (RELATIVE to container center)
const calculateFanTarget = (
  index: number,
  cardCount: number, // Keep cardCount for potential future use/consistency
  spreadAngle: number, // No longer directly used here, but keep signature
  cardDimensions: { width: number; height: number },
): Omit<CardTransform, 'opacity' | 'zIndex'> => {

    const radius = cardDimensions.width * 1.4; // Keep reduced radius

    // --- Direct angle assignment for 3 cards: -15, 0, 15 --- //
    let angle = 0;
    if (index === 0) {
      angle = -15; // Left card
    } else if (index === 1) {
      angle = 0; // Center card
    } else if (index === 2) {
      angle = 15; // Right card
    }
    // --- End direct angle assignment --- //

    const radian = (angle * Math.PI) / 180; // Use calculated angle

    const targetXRelativeToCenter = radius * Math.sin(radian);
    // Hebe die Karten etwas an, um sie besser sichtbar zu machen
    const targetYRelativeToArcOrigin = -radius * Math.cos(radian) + radius * 0.6; // Reduzierte Verschiebung nach unten
    const adjustedTranslateY = targetYRelativeToArcOrigin - cardDimensions.height / 2;

    // Calculation for top-left corner based on center offset
    const adjustedTranslateX = targetXRelativeToCenter - cardDimensions.width / 2;

    return {
      translateX: adjustedTranslateX,
      translateY: adjustedTranslateY,
      rotate: angle,
      scale: 1,
    };
};

// --- NEW: Helper to calculate stacked target transform (RELATIVE to container center) --- //
const calculateStackedTarget = (index: number, cardCount: number): Omit<CardTransform, 'opacity' | 'zIndex'> => {
  return {
    translateX: 0, // Center X
    translateY: 0, // Center Y (adjust slightly for stacking visual? maybe later)
    rotate: 0, // No rotation
    scale: 1, // Normal scale
  };
};

export const useCardSelectionAnimation = (
  onCardPositioned?: () => void
): UseCardSelectionAnimationResult => {
  const instructionOpacity = useSharedValue(0);
  // Shared value holding the transform state for ALL cards
  const cardTransforms = useSharedValue<CardTransformMap>({});
  // Store previous cards to detect changes
  const previousCardsRef = useRef<ISelectedAndShownCard[]>([]);

  // --- Animation Functions --- //

  const showInstruction = useCallback(() => {
    instructionOpacity.value = withTiming(1, {
      duration: animation.timing.fadeIn.duration,
    });
  }, [instructionOpacity]);


  // NEW: Function to update/initialize transforms for all cards (STACKED, then FAN)
  const updateAllCardTransforms = useCallback(
    (
      cards: ISelectedAndShownCard[],
      sessionStarted: boolean,
      spreadAngle: number, // Still needed for fan calculation signature
      cardDimensions: { width: number; height: number }
    ) => {
      const initialTransforms: CardTransformMap = {};
      const fanTransforms: CardTransformMap = {};

      if (sessionStarted && cards.length > 0) {
        cards.forEach((card, index) => {
          if (!card.id) return;

          // Calculate both target states
          const stackedTarget = calculateStackedTarget(index, cards.length);
          const fanTarget = calculateFanTarget(
            index,
            cards.length,
            spreadAngle, // Use the fixed -15/0/15 logic inside
            cardDimensions
          );

          // Initial state: Stacked, visible
          initialTransforms[card.id] = {
            translateX: stackedTarget.translateX,
            translateY: stackedTarget.translateY,
            rotate: stackedTarget.rotate,
            scale: stackedTarget.scale,
            opacity: 1, // Start visible
            zIndex: cards.length - index, // Stacking order
          };

          // Final state: Fanned out
          fanTransforms[card.id] = {
            translateX: fanTarget.translateX,
            translateY: fanTarget.translateY,
            rotate: fanTarget.rotate,
            scale: fanTarget.scale,
            opacity: 1, // Stay visible
            zIndex: cards.length - index,
          };
        });

        // 1. Set initial stacked state IMMEDIATELY
        console.log(
          "[updateAllCardTransforms] Setting initial STACKED transforms:",
          JSON.stringify(initialTransforms)
        );
        cardTransforms.value = initialTransforms;

        // 2. Show instruction text IMMEDIATELY
        instructionOpacity.value = withTiming(1, { duration: 0 });

        // 3. Animate to FAN state after a delay, hide instruction during animation
        console.log(
          "[updateAllCardTransforms] Scheduling animation to FAN transforms:",
          JSON.stringify(fanTransforms)
        );
        cards.forEach((card) => {
          if (!card.id) return;
          const target = fanTransforms[card.id];
          if (!target) return;

          cardTransforms.value = {
            ...cardTransforms.value,
            [card.id]: {
              ...cardTransforms.value[card.id],
              translateX: withDelay(
                500, // Delay before fanning out
                withTiming(target.translateX, { duration: animation.timing.move.duration })
              ),
              translateY: withDelay(
                500,
                withTiming(target.translateY, { duration: animation.timing.move.duration })
              ),
              rotate: withDelay(
                500,
                withTiming(target.rotate, { duration: animation.timing.move.duration })
              ),
              // Scale/Opacity/zIndex don't change in this step
            },
          };
        });

        // 4. Hide instruction text during/after fanning animation
        instructionOpacity.value = withDelay(
            600, // Start fading slightly after fan animation starts
            withTiming(0, { duration: animation.timing.fadeOut.duration })
        );


      } else {
        // Session ended or no cards: Reset everything immediately
        console.log("[updateAllCardTransforms] Resetting transforms and instruction");
        cardTransforms.value = {};
        instructionOpacity.value = withTiming(0, { duration: 0 });
      }
    },
    [cardTransforms, instructionOpacity] // Dependencies: shared values
  );

  const resetAnimations = useCallback(() => {
    instructionOpacity.value = withTiming(0, { duration: 0 });
    cardTransforms.value = {};
    previousCardsRef.current = [];
  }, [instructionOpacity, cardTransforms]);

  // --- Animate Single Card Selection --- //
  const animateCardSelection = useCallback(
    (
      selectedCard: ISelectedAndShownCard,
      allCards: ISelectedAndShownCard[], // Need all cards to fade others out
      currentRound: number,
      drawnSlotPositions: { x: number; y: number }[],
      cardDimensions: { width: number; height: number }, // Pass cardDimensions here
      onComplete: OnSelectionComplete // Callback still needed, but triggering is complex now
    ) => {
      if (!selectedCard.id) return;

      // Fade out instructions
      instructionOpacity.value = withTiming(0, { duration: animation.timing.fadeOut.duration });

      // Update transforms for all cards: set target values directly
      const newTransforms = { ...cardTransforms.value }; // Clone current transforms

      // --- Calculate target position for selected card FIRST --- //
      const screenWidth = Dimensions.get("window").width;
      const targetSlot = drawnSlotPositions[currentRound] || { x: screenWidth / 2, y: 120 };
      const finalTargetX = targetSlot.x;
      const finalTargetY = targetSlot.y;
      const targetTranslateX = finalTargetX - cardDimensions.width / 2;
      const targetTranslateY = finalTargetY - cardDimensions.height / 2;
      // --- End target calculation ---

      let animationFinished = false; // Simple flag to prevent multiple calls

      allCards.forEach((card) => {
        if (!card.id) return;
        // Get existing or default transform values to merge
        const currentOrDefTransform = newTransforms[card.id] || getDefaultTransform(allCards.findIndex(c => c.id === card.id), allCards.length);

        if (card.id === selectedCard.id) {
            // Set target values for selected card
            newTransforms[card.id] = {
                ...currentOrDefTransform,
                translateX: targetTranslateX,
                translateY: targetTranslateY,
                rotate: 0,
                scale: 0.9,
                opacity: 1,
                zIndex: 1000,
            };
        } else {
          // Set target values for non-selected cards (fade out)
          newTransforms[card.id] = {
              ...currentOrDefTransform,
              opacity: 0,
              // Keep other target values (translateX, Y, rotate, scale, zIndex) as they were
          };
        }
      });

      // --- Trigger completion using withTiming callback --- //
      // Define the completion logic as a reusable function
      const completeAnimation = () => {
        if (!animationFinished) {
          animationFinished = true;
          if (onCardPositioned) {
            runOnJS(onCardPositioned)();
          }
          runOnJS(onComplete)({
            ...selectedCard,
            showFront: true,
            isSelected: true,
          });
        }
      };

      // Find the selected card's transform to apply the callback
      const selectedTransform = newTransforms[selectedCard.id];
      if (selectedTransform) {
          // Apply the animations - we apply the callback to one of the main animations
          cardTransforms.value = {
              ...cardTransforms.value, // Keep existing non-animated values
              [selectedCard.id]: {
                  ...selectedTransform,
                  translateX: withTiming(selectedTransform.translateX, { duration: animation.timing.move.duration }, completeAnimation), // Attach callback here
                  translateY: withTiming(selectedTransform.translateY, { duration: animation.timing.move.duration }),
                  rotate: withTiming(0, { duration: animation.timing.move.duration }), // Animate rotate to 0
                  scale: withTiming(selectedTransform.scale, { duration: animation.timing.move.duration }),
                  opacity: withTiming(selectedTransform.opacity, { duration: animation.timing.move.duration }), // Use move duration for selected card fade-in (if applicable)
                  zIndex: selectedTransform.zIndex, // zIndex is immediate
              }
          };

          // Animate non-selected cards separately (only opacity)
          allCards.forEach(card => {
              if (card.id !== selectedCard.id && card.id && newTransforms[card.id]) {
                  cardTransforms.value = {
                      ...cardTransforms.value,
                      [card.id]: {
                          ...newTransforms[card.id],
                          opacity: withTiming(newTransforms[card.id].opacity, { duration: animation.timing.fadeOut.duration })
                      }
                  };
              }
          });
      } else {
        console.warn("[animateCardSelection] Could not find transform for selected card:", selectedCard.id);
      }
      // --- End completion trigger --- //

    },
    [instructionOpacity, cardTransforms, onCardPositioned]
  );

  // Return shared values and memoized functions
  return {
    instructionOpacity,
    cardTransforms, // Expose the map of transforms
    showInstruction,
    resetAnimations,
    animateCardSelection,
    updateAllCardTransforms, // Expose the function to update all transforms
  };
};