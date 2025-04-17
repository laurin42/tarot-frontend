import React, { memo, useState } from "react";
import { View, Dimensions, StyleSheet, LayoutChangeEvent } from "react-native";
import Animated from "react-native-reanimated";
import { textStyles } from "@/styles/styles";
import { useCardStack } from "@/context/CardStackContext";
import { useCardStackLogic } from "./useCardStackLogic";
import AnimatedFanCard from "./AnimatedFanCard";

interface CardStackViewProps {
  drawnSlotPositions: { x: number; y: number }[];
  onCardPositioned?: () => void;
}

const CardStackView = memo((props: CardStackViewProps) => {
  const { drawnSlotPositions, onCardPositioned } = props;

  const {
    sessionStarted,
    predeterminedCards,
    currentRound,
    selectCard,
    cardDimensions,
  } = useCardStack();

  const spreadAngle = 60;
  const [containerDimensions, setContainerDimensions] = useState({
    width: Dimensions.get("window").width,
    height: 300,
  });

  const handleLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    console.log("[CardStackView] Container dimensions:", width, height);
    setContainerDimensions({ width, height });
  };

  const {
    cards,
    showInstruction,
    cardTransforms,
    instructionOpacity,
    handleCardSelect,
  } = useCardStackLogic({
    sessionStarted,
    predeterminedCards,
    currentRound,
    selectCard,
    cardDimensions,
    drawnSlotPositions,
    onCardPositioned,
    spreadAngle,
    containerDimensions,
  });

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {showInstruction && (
        <>
          {cards.map((card) => (
            <AnimatedFanCard
              key={card.id}
              card={card}
              cardTransforms={cardTransforms}
              sessionStarted={sessionStarted}
              cardDimensions={cardDimensions}
              handleCardSelect={handleCardSelect}
              containerDimensions={containerDimensions}
            />
          ))}

          <Animated.Text
            style={[
              textStyles.body,
              styles.instructionText,
              { opacity: instructionOpacity },
            ]}
          >
            Bitte Karte wählen...
          </Animated.Text>
        </>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  instructionText: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    textAlign: "center",
    color: "#FFF",
    zIndex: 1,
  },
});

CardStackView.displayName = "CardStackView";

export default CardStackView;
