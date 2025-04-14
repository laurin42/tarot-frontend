import React, { memo, useState } from "react";
import {
  View,
  Text,
  Dimensions,
  StyleSheet,
  LayoutChangeEvent,
} from "react-native";
import Animated from "react-native-reanimated";
import { ISelectedAndShownCard } from "@/constants/tarotCards";
import { layoutStyles, textStyles } from "@/styles/styles";
import { useCardStackLogic } from "./useCardStackLogic";
import AnimatedFanCard from "./AnimatedFanCard";
// import CardInstruction from "./CardInstruction";
// import CardIndicator from "./CardIndicator";

interface CardStackViewProps {
  onCardSelect: (card: ISelectedAndShownCard) => void;
  sessionStarted: boolean;
  cardDimensions: { width: number; height: number };
  drawnSlotPositions: { x: number; y: number }[];
  currentRound: number;
  predeterminedCards: ISelectedAndShownCard[];
  onCardPositioned?: () => void;
}

const CardStackView = memo((props: CardStackViewProps) => {
  const spreadAngle = 60;
  // Initialize containerDimensions with estimated values
  const [containerDimensions, setContainerDimensions] = useState({
    width: Dimensions.get("window").width,
    height: 300, // Initial estimate
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
    ...props,
    spreadAngle,
    containerDimensions,
  });

  return (
    <View style={styles.container} onLayout={handleLayout}>
      {cards.map((card) => (
        <AnimatedFanCard
          key={card.id}
          card={card}
          cardTransforms={cardTransforms}
          sessionStarted={props.sessionStarted}
          handleCardSelect={handleCardSelect}
          cardDimensions={props.cardDimensions}
          containerDimensions={containerDimensions}
        />
      ))}

      {showInstruction && (
        <Animated.Text
          style={[
            textStyles.body,
            styles.instructionText,
            { opacity: instructionOpacity },
          ]}
        >
          Bitte Karte wählen...
        </Animated.Text>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    position: "relative",
    justifyContent: "center", // Center content vertically
    alignItems: "center", // Center content horizontally
    // --- Remove DEBUG STYLES --- //
    // backgroundColor: "rgba(0, 255, 0, 0.3)",
    // borderWidth: 2,
    // borderColor: "green",
    // --- END DEBUG STYLES --- //
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
