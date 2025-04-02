import React, { memo } from "react";
import { View, Text } from "react-native";
import { globalStyles } from "@/styles/globalStyles";
import { styles } from "@/styles/styles";

interface CardIndicatorProps {
  currentRound: number;
}

const CardIndicator = memo(({ currentRound }: CardIndicatorProps) => {
  return (
    <View
      style={[globalStyles.floatingIndicator, styles.cardIndicatorContainer]}
    >
      <Text style={globalStyles.mysticalText}>
        {currentRound === 2 ? "Letzte Karte" : `Karte ${currentRound + 1}/3`}
      </Text>
    </View>
  );
});

export default CardIndicator;
