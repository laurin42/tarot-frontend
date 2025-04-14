import React, { useEffect } from "react";
import { Dimensions, Pressable } from "react-native";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from "react-native-reanimated";
import { ISelectedAndShownCard } from "@/constants/tarotCards";
import DynamicTarotCard from "../DynamicTarotCard";
import { componentStyles } from "@/styles";
import {
  CardTransformMap,
  CardTransform,
} from "@/hooks/useCardSelectionAnimation";
import { animation } from "@/styles/theme";

const fallbackTransform: CardTransform = {
  translateX: 0,
  translateY: 1000,
  rotate: 0,
  scale: 0,
  opacity: 0,
  zIndex: 0,
};

interface AnimatedFanCardProps {
  card: ISelectedAndShownCard;
  cardTransforms: Animated.SharedValue<CardTransformMap>;
  cardDimensions: { width: number; height: number };
  containerDimensions: { width: number; height: number };
  sessionStarted: boolean;
  handleCardSelect: (card: ISelectedAndShownCard) => void;
  testID?: string;
}

const AnimatedFanCard: React.FC<AnimatedFanCardProps> = React.memo(
  ({
    card,
    cardTransforms,
    cardDimensions,
    containerDimensions,
    sessionStarted,
    handleCardSelect,
    testID,
  }) => {
    console.log(
      `[AnimatedFanCard ${card.id}] Received cardDimensions:`,
      JSON.stringify(cardDimensions)
    );
    console.log(
      `[AnimatedFanCard ${card.id}] Received containerDimensions:`,
      JSON.stringify(containerDimensions)
    );
    console.log(`[AnimatedFanCard] Rendering card ID: ${card.id}`);

    const animatedStyle = useAnimatedStyle(() => {
      const transform = cardTransforms.value[card.id] || fallbackTransform;

      console.log(
        `[AnimatedFanCard ${card.id}] Applying static transform:`,
        JSON.stringify(transform)
      );

      // Berechne die absolute Position im Container basierend auf der Container-Mitte
      const containerCenterX = containerDimensions.width / 2;
      const containerCenterY = containerDimensions.height / 2;
      const cardWidth = cardDimensions.width;
      const cardHeight = cardDimensions.height;

      // Calculate final absolute translate values
      const finalTranslateX =
        containerCenterX - cardWidth / 2 + transform.translateX;
      const finalTranslateY =
        containerCenterY - cardHeight / 2 + transform.translateY;

      // --> Log final calculated values used in transform
      console.log(
        `[AnimatedFanCard ${card.id}] Final transform values: X=${finalTranslateX}, Y=${finalTranslateY}, R=${transform.rotate}`
      );
      // --> Log the rotate value passed to withTiming
      const rotateValue = `${transform.rotate}deg`;
      console.log(
        `[AnimatedFanCard ${card.id}] Rotate value passed to withTiming: ${rotateValue}`
      );

      return {
        position: "absolute",
        width: cardDimensions.width,
        height: cardDimensions.height,
        opacity: withTiming(transform.opacity, {
          duration: animation.timing.fadeOut.duration,
        }),
        zIndex: transform.zIndex,
        transform: [
          {
            translateX: withTiming(finalTranslateX, {
              duration: animation.timing.move.duration,
            }),
          },
          {
            translateY: withTiming(finalTranslateY, {
              duration: animation.timing.move.duration,
            }),
          },
          {
            rotate: withTiming(rotateValue, {
              duration: animation.timing.move.duration,
            }),
          },
          {
            scale: withTiming(transform.scale, {
              duration: animation.timing.move.duration,
            }),
          },
        ],
      };
    });

    return (
      <Animated.View style={animatedStyle} testID={testID}>
        <Pressable
          onPress={() => handleCardSelect(card)}
          style={{ width: "100%", height: "100%" }}
        >
          <DynamicTarotCard
            cardName={card.name}
            isShown={card.showFront || false}
          />
        </Pressable>
      </Animated.View>
    );
  }
);

AnimatedFanCard.displayName = "AnimatedFanCard";

export default AnimatedFanCard;
