import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
} from "react-native";
import DynamicTarotCard from "@/components/DynamicTarotCard";
import { Shadow } from "react-native-shadow-2";
import { ISelectedAndShownCard } from "@/constants/tarotCards";
import { componentStyles, textStyles, colors } from "@/styles";

interface TarotCardWithLabelProps {
  card: ISelectedAndShownCard;
  index: number;
  onPress: (index: number) => void;
}

const TarotCardWithLabel: React.FC<TarotCardWithLabelProps> = ({
  card,
  index,
  onPress,
}) => {
  // Geräteabmessungen für responsive Darstellung
  const { width: screenWidth } = Dimensions.get("window");
  const cardWidth = screenWidth * 0.25; // ~25% mit etwas Abstand

  return (
    <View style={[styles.container, componentStyles.cardWrapper]}>
      {/* Position Label */}
      {/* Removed getPositionLabel function */}

      {/* Tarot Card Image */}
      <View
        style={{
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
          marginVertical: 4,
        }}
      >
        <TouchableOpacity onPress={() => onPress(index)}>
          <Shadow
            distance={8}
            startColor={colors.purpleGlow}
            endColor="rgba(139, 92, 246, 0.0)"
            offset={[0, 0]}
          >
            <DynamicTarotCard
              cardName={card.name}
              isShown={true}
              style={{
                width: cardWidth,
                height: cardWidth * 1.6,
                borderRadius: 8,
              }}
            />
          </Shadow>
        </TouchableOpacity>
      </View>

      {/* Card Name */}
      <View
        style={{
          marginTop: 8,
          width: "100%",
          minHeight: 36,
          justifyContent: "center",
        }}
      >
        <Text
          style={textStyles.cardName}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {card.name}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
  },
  label: {
    marginTop: 8,
    textAlign: "center",
  },
});

export default React.memo(TarotCardWithLabel); // Optimierung durch Memoization
