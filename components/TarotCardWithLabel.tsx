import React from "react";
import { View, Text, TouchableOpacity, Dimensions } from "react-native";
import OptimizedTarotCard from "@/components/OptimizedTarotCard";
import { Shadow } from "react-native-shadow-2";
import { ISelectedAndShownCard } from "@/constants/tarotcards";
import { commonStyles, globalTextStyles } from "@/styles/tarotTheme";
import { colors } from "@/styles/theme";

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

  const getPositionLabel = (index: number): string => {
    switch (index) {
      case 0:
        return "Gegenwart";
      case 1:
        return "Konflikt";
      case 2:
        return "Perspektive";
      default:
        return `Position ${index + 1}`;
    }
  };

  return (
    <View style={commonStyles.cardWrapper}>
      {/* Position Label */}
      <Text style={globalTextStyles.cardLabel}>
        ({getPositionLabel(index)})
      </Text>

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
            <OptimizedTarotCard
              cardId={card.id}
              imageSource={card.image}
              isShown={true}
              size="small" // Für Listenansichten ist "small" effizienter
              name={card.name}
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
          style={globalTextStyles.cardName}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {card.name}
        </Text>
      </View>
    </View>
  );
};

export default React.memo(TarotCardWithLabel); // Optimierung durch Memoization
