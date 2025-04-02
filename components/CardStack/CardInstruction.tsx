import React, { memo } from "react";
import { Animated, Text } from "react-native";
import { globalStyles } from "@/styles/globalStyles";
import { styles } from "@/styles/styles";

interface CardInstructionProps {
  opacity: Animated.Value;
}

const CardInstruction = memo(({ opacity }: CardInstructionProps) => {
  return (
    <Animated.View
      style={[
        globalStyles.floatingIndicator,
        styles.instructionContainer,
        { opacity },
      ]}
    >
      <Text style={globalStyles.mysticalText}>
        {"Tippe auf den Stapel, um eine Karte zu ziehen"}
      </Text>
    </Animated.View>
  );
});

export default CardInstruction;
