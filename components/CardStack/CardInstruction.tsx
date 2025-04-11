import React, { memo } from "react";
import { Animated, Text } from "react-native";
import { textStyles, layoutStyles } from "@/styles/styles";

interface CardInstructionProps {
  opacity: Animated.Value;
}

const CardInstruction = memo(({ opacity }: CardInstructionProps) => {
  return (
    <Animated.View
      style={[
        layoutStyles.floatingIndicator,
        layoutStyles.instructionContainer,
        { opacity },
      ]}
      pointerEvents="none"
    >
      <Text style={textStyles.mysticalText}>
        {"Tippe auf den Stapel, um eine Karte zu ziehen"}
      </Text>
    </Animated.View>
  );
});

CardInstruction.displayName = "CardInstruction";

export default CardInstruction;
