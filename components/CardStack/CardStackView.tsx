import React, { memo } from "react";
import { View } from "react-native";
import { ISelectedAndShownCard } from "@/constants/tarotcards";
import { globalStyles } from "@/styles/globalStyles";
import { styles } from "@/styles/styles";
import { useCardStackLogic } from "./useCardStackLogic";
import CardFan from "./CardFan";
import CardInstruction from "./CardInstruction";
import CardIndicator from "./CardIndicator";

interface CardStackViewProps {
  onAnimationComplete: () => void;
  onCardSelect: (card: ISelectedAndShownCard) => void;
  sessionStarted: boolean;
  cardDimensions: { width: number; height: number };
  drawnSlotPositions: { x: number; y: number }[];
  currentRound: number;
  predeterminedCards: ISelectedAndShownCard[];
  onCardPositioned?: () => void;
}

const CardStackView = memo((props: CardStackViewProps) => {
  const {
    cards,
    showInstruction,
    isCardSelected,
    animatingToPosition,
    fanAnimation,
    cardAnimation,
    handleCardSelect,
  } = useCardStackLogic(props);

  const {
    instructionOpacity,
    stackOpacity,
    selectedCardPosition,
    selectedCardScale,
  } = cardAnimation;

  return (
    <View style={globalStyles.centeredContainer}>
      {/* Mystical glow background */}
      <View style={globalStyles.mysticalGlowContainer} />

      <View style={styles.gamePlayArea}>
        {/* Instruction floating indicator */}
        {showInstruction && <CardInstruction opacity={instructionOpacity} />}

        {/* Card fan container */}
        <CardFan
          cards={cards}
          currentRound={props.currentRound}
          cardDimensions={props.cardDimensions}
          fanAnimation={fanAnimation}
          stackOpacity={stackOpacity}
          selectedCardPosition={selectedCardPosition}
          selectedCardScale={selectedCardScale}
          animatingToPosition={animatingToPosition}
          onCardSelect={handleCardSelect}
        />

        {/* Card indicator */}
        {cards.length > 0 && !isCardSelected && (
          <CardIndicator currentRound={props.currentRound} />
        )}
      </View>
    </View>
  );
});

export default CardStackView;
