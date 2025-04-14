import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { useCardStack } from "../../context/CardStackContext";
import { layoutStyles } from "../../styles/layoutStyles";
import { cardContainerStyle, instructionStyle } from "../../styles/cardStyles";
import AnimatedFanCard from "./AnimatedFanCard";

const CardFan = () => {
  const {
    cards,
    spreadAngle,
    cardDimensions,
    sessionStarted,
    handleCardSelect,
  } = useCardStack();
  const fanRef = useRef(new Animated.Value(0));

  useEffect(() => {
    Animated.timing(fanRef.current, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <View
      style={[layoutStyles.flexCenter, { flex: 1, alignItems: "center" }]}
      testID="card-fan-container"
    >
      <View style={cardContainerStyle}>
        <Text style={instructionStyle}>Click a card to select it</Text>
        {cards.map((card, index) => (
          <AnimatedFanCard
            key={card.id}
            card={card}
            index={index}
            totalCards={cards.length}
            spreadAngle={spreadAngle}
            cardDimensions={cardDimensions}
            handleCardSelect={handleCardSelect}
            sessionStarted={sessionStarted}
            testID={`card-${card.id}`}
          />
        ))}
      </View>
    </View>
  );
};

export default CardFan;
