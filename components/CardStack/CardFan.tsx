import React, { memo } from "react";
import { View, Animated, Pressable } from "react-native";
import { ISelectedAndShownCard } from "@/constants/tarotcards";
import { layoutPatterns, globalStyles } from "@/styles/globalStyles";
import { styles } from "@/styles/styles";
import OptimizedTarotCard from "../OptimizedTarotCard";

interface CardFanProps {
  cards: ISelectedAndShownCard[];
  currentRound: number;
  cardDimensions: { width: number; height: number };
  fanAnimation: {
    translateX: Animated.Value[];
    translateY: Animated.Value[];
    rotations: Animated.Value[];
    scales: Animated.Value[];
  };
  stackOpacity: Animated.Value;
  selectedCardPosition: Animated.ValueXY;
  selectedCardScale: Animated.Value;
  animatingToPosition: boolean;
  onCardSelect: (card: ISelectedAndShownCard) => void;
}

const CardFan = memo(
  ({
    cards,
    currentRound,
    cardDimensions,
    fanAnimation,
    stackOpacity,
    selectedCardPosition,
    selectedCardScale,
    animatingToPosition,
    onCardSelect,
  }: CardFanProps) => {
    return (
      <View style={layoutPatterns.cardFan}>
        {cards.map((card, index) => (
          <Animated.View
            key={`${currentRound}-${index}`}
            style={[
              styles.animatedCard,
              {
                zIndex: cards.length - index,
                transform:
                  card.isSelected && animatingToPosition
                    ? [
                        { translateX: selectedCardPosition.x },
                        { translateY: selectedCardPosition.y },
                        { scale: selectedCardScale },
                        { rotate: "0deg" },
                      ]
                    : [
                        { translateY: fanAnimation.translateY[index] },
                        { translateX: fanAnimation.translateX[index] },
                        {
                          rotate: fanAnimation.rotations[index].interpolate({
                            inputRange: [-30, 30],
                            outputRange: ["-30deg", "30deg"],
                          }),
                        },
                        { scale: fanAnimation.scales[index] },
                      ],
                opacity: card.isSelected ? 1 : stackOpacity,
              },
            ]}
          >
            <Pressable
              style={[globalStyles.cardBase, styles.cardPressable]}
              onPress={() => onCardSelect(card)}
            >
              <OptimizedTarotCard
                cardId={card.id}
                imageSource={card.image}
                isShown={card.showFront || false}
                size="medium"
                style={{
                  width: cardDimensions.width,
                  height: cardDimensions.height,
                }}
              />
            </Pressable>
          </Animated.View>
        ))}
      </View>
    );
  }
);

export default CardFan;
