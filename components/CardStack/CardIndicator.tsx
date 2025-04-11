import React, { memo } from "react";
import { View, Text } from "react-native";
import { textStyles, layoutStyles } from "@/styles/styles"; // Importiere textStyles

interface CardIndicatorProps {
  currentRound: number;
}

const CardIndicator = memo(({ currentRound }: CardIndicatorProps) => {
  return (
    <View
      style={[
        layoutStyles.floatingIndicator,
        layoutStyles.cardIndicatorContainer,
      ]}
      pointerEvents="none"
    >
      <Text style={textStyles.mysticalText}>
        {currentRound === 2 ? "Letzte Karte" : `Karte ${currentRound + 1}/3`}
      </Text>
    </View>
  );
});

CardIndicator.displayName = "CardIndicator";

export default CardIndicator;
