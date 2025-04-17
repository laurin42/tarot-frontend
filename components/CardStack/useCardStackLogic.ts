import { useState, useEffect, useCallback } from "react";
import { ISelectedAndShownCard } from "@/constants/tarotCards";
import {
  useCardSelectionAnimation,
  // CardTransformMap, // No longer explicitly needed here
} from "@/hooks/useCardSelectionAnimation";

interface CardStackLogicParams {
  predeterminedCards: ISelectedAndShownCard[];
  sessionStarted: boolean;
  currentRound: number;
  drawnSlotPositions: { x: number; y: number }[];
  cardDimensions: { width: number; height: number };
  spreadAngle: number;
  onCardPositioned?: () => void;
  containerDimensions: { width: number; height: number };
  selectCard: (card: ISelectedAndShownCard) => void;
}

export const useCardStackLogic = ({
  predeterminedCards,
  sessionStarted,
  currentRound,
  drawnSlotPositions,
  cardDimensions,
  spreadAngle,
  onCardPositioned,
  containerDimensions,
  selectCard,
}: CardStackLogicParams) => {
  const [cards, setCards] = useState<ISelectedAndShownCard[]>([]);
  // const [showInstruction, setShowInstruction] = useState(false); // Removed state
  const [isCardSelected, setIsCardSelected] = useState(false);
  const [animatingToPosition, setAnimatingToPosition] = useState(false);

  const cardAnimation = useCardSelectionAnimation(onCardPositioned);

  // Effect 1: Set cards when session starts or predetermined cards change
  useEffect(() => {
    console.log("[useCardStackLogic Effect 1] Triggered. sessionStarted:", sessionStarted);
    if (sessionStarted && predeterminedCards && predeterminedCards.length > 0) {
      console.log("[useCardStackLogic Effect 1] Setting cards from predeterminedCards:", predeterminedCards);
      setCards(predeterminedCards);
      // Reset selection state when new cards are set
      setIsCardSelected(false);
      setAnimatingToPosition(false);
    } else if (!sessionStarted) {
        console.log("[useCardStackLogic Effect 1] Session ended or not started, clearing cards.");
        setCards([]); // Clear cards if session ends
        cardAnimation.resetAnimations(); // Reset animations including instruction
    }
  }, [sessionStarted, predeterminedCards, cardAnimation]); // Added cardAnimation dependency for reset

  // Effect 2: Update transforms and show instruction when cards state updates and session is active
  useEffect(() => {
    console.log("[useCardStackLogic Effect 2] Triggered. cards.length:", cards.length, "sessionStarted:", sessionStarted);
    if (sessionStarted && cards.length > 0) {
      console.log("[useCardStackLogic Effect 2] Calling updateAllCardTransforms and showInstruction for cards:", cards);
      cardAnimation.updateAllCardTransforms(
        cards,
        sessionStarted, // Pass sessionStarted here
        spreadAngle,
        cardDimensions
      );
      // Use the animation hook's method to show instruction
      if (!isCardSelected && !animatingToPosition) { // Only show instruction if no card is selected/animating
          cardAnimation.showInstruction();
      }
    }
    // If session is not started or cards are empty, transforms/instruction should already be reset by Effect 1 / resetAnimations
  }, [
    cards, // Depend on the actual cards state
    sessionStarted,
    cardDimensions,
    spreadAngle,
    cardAnimation,
    isCardSelected, // Add dependency to re-evaluate showing instruction
    animatingToPosition, // Add dependency to re-evaluate showing instruction
    containerDimensions,
  ]);


  const handleCardSelect = useCallback(
    (selectedCard: ISelectedAndShownCard) => {
      // Check for dummy cards or if an animation is already in progress or if session not started
      if (!sessionStarted || selectedCard.id.startsWith("dummy-") || isCardSelected || animatingToPosition) {
         console.log(`[handleCardSelect] Selection blocked: sessionStarted=${sessionStarted}, dummy=${selectedCard.id.startsWith("dummy-")}, isSelected=${isCardSelected}, animating=${animatingToPosition}`);
        return;
      }
      console.log("[handleCardSelect] Animating card selection:", selectedCard.id);

      setIsCardSelected(true); // Set flag immediately
      setAnimatingToPosition(true); // Indicate animation start
      // setShowInstruction(false); // Instruction opacity is handled by animateCardSelection now

      cardAnimation.animateCardSelection(
        selectedCard,
        cards, // Pass current cards state
        currentRound,
        drawnSlotPositions,
        cardDimensions,
        (finalCardState) => {
          console.log("[handleCardSelect] Animation complete, calling context selectCard for:", finalCardState.id);
          selectCard(finalCardState); // Call original callback
          // Keep isCardSelected true, but allow new animations *after* this one completes fully
          setAnimatingToPosition(false);
          // Don't reset isCardSelected here, let the parent component manage rounds/reset
        }
      );
    },
    [
      sessionStarted, // Add dependency
      isCardSelected,
      animatingToPosition, // Add dependency
      cards,
      currentRound, // Add dependency
      drawnSlotPositions, // Add dependency
      cardDimensions, // Add dependency
      cardAnimation,
      selectCard, // Add dependency
    ]
  );

  // --- Berechne den booleschen Wert für die Anzeige der Instruktion ---
  const shouldShowInstruction = sessionStarted && cards.length > 0 && !isCardSelected && !animatingToPosition;


  return {
    cards,
    showInstruction: shouldShowInstruction,
    isCardSelected,
    animatingToPosition,
    cardTransforms: cardAnimation.cardTransforms,
    instructionOpacity: cardAnimation.instructionOpacity,
    handleCardSelect,
  };
};