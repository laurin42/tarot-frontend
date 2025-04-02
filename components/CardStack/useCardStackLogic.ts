import { useState, useEffect, useCallback } from "react";
import { ISelectedAndShownCard } from "@/constants/tarotcards";
import { useCardFanAnimation } from "@/hooks/useCardFanAnimation";
import { useCardSelectionAnimation } from "@/hooks/useCardSelectionAnimation";

interface CardStackLogicParams {
  onAnimationComplete: () => void;
  onCardSelect: (card: ISelectedAndShownCard) => void;
  sessionStarted: boolean;
  cardDimensions: { width: number; height: number };
  drawnSlotPositions: { x: number; y: number }[];
  currentRound: number;
  predeterminedCards: ISelectedAndShownCard[];
  onCardPositioned?: () => void;
}

export function useCardStackLogic({
  onAnimationComplete,
  onCardSelect,
  sessionStarted,
  cardDimensions,
  currentRound,
  predeterminedCards,
  drawnSlotPositions,
  onCardPositioned,
}: CardStackLogicParams) {
  const [cards, setCards] = useState<ISelectedAndShownCard[]>([]);
  const [showInstruction, setShowInstruction] = useState(false);
  const [isCardSelected, setIsCardSelected] = useState(false);
  const [animatingToPosition, setAnimatingToPosition] = useState(false);

  // Animation hooks - Wiederverwendung der bestehenden Hooks
  const fanAnimation = useCardFanAnimation({
    cardCount: 5,
    spreadAngle: 60,
    cardDimensions,
    currentRound,
    sessionStarted,
  });

  const cardAnimation = useCardSelectionAnimation(onCardPositioned);

  // Initialize cards and start animation
  useEffect(() => {
    if (
      sessionStarted &&
      predeterminedCards.length > 0 &&
      currentRound < predeterminedCards.length
    ) {
      const newStack = Array(5)
        .fill(null)
        .map(() => ({
          ...predeterminedCards[currentRound],
          showFront: false,
          isSelected: false,
        }));

      setCards(newStack);

      // Start fan animation with delay
      const timer = setTimeout(() => {
        fanAnimation.animateToFan().start(() => {
          if (typeof onAnimationComplete === "function") {
            onAnimationComplete();
          }
        });
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [currentRound, predeterminedCards, sessionStarted, onAnimationComplete, fanAnimation]);

  // Reset states when round changes
  useEffect(() => {
    setIsCardSelected(false);
    cardAnimation.resetAnimations();
  }, [currentRound, cardAnimation]);

  // Show instruction after card initialization
  useEffect(() => {
    if (cards.length > 0 && !cards.some((c) => c.isSelected)) {
      const timer = setTimeout(() => {
        setShowInstruction(true);
        cardAnimation.showInstruction().start();
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [cards, cardAnimation]);

  // Handle card selection with animations
  const handleCardSelect = useCallback((card: ISelectedAndShownCard) => {
    if (cards.some((c) => c.isSelected) || isCardSelected) return;

    setIsCardSelected(true);
    setAnimatingToPosition(true);

    setCards((prevCards) =>
      prevCards.map((c) => ({
        ...c,
        showFront: c === card ? true : false,
        isSelected: c === card ? true : false,
      }))
    );

    // Start the card selection animation sequence
    cardAnimation.animateCardSelection(
      card,
      currentRound,
      drawnSlotPositions,
      (selectedCard) => {
        setAnimatingToPosition(false);
        onCardSelect(selectedCard);
      }
    );

    // Hide instruction
    setShowInstruction(false);
  }, [cards, isCardSelected, currentRound, drawnSlotPositions, onCardSelect, cardAnimation]);

  return {
    cards,
    showInstruction,
    isCardSelected,
    animatingToPosition,
    fanAnimation,
    cardAnimation,
    handleCardSelect,
  };
}