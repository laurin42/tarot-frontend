import React, { useState, useRef } from "react";
import { View, Text, ScrollView, Platform, StyleSheet } from "react-native";
import { ISelectedAndShownCard } from "@/constants/tarotcards";
import { useTarotSummary } from "@/hooks/useTarotSummary";
import { useScrollEndDetection } from "@/hooks/useScrollEndDetection";
import TarotCardWithLabel from "@/components/TarotCardWithLabel";
import CardDetailModal from "@/components/CardDetailModal";
import SummaryPanel from "@/components/SummaryPanel";
import {
  componentStyles,
  textStyles,
  layoutStyles,
  glowEffects,
} from "@/styles";

interface SummaryViewProps {
  cards: ISelectedAndShownCard[];
  onDismiss: () => void;
}

const SummaryView: React.FC<SummaryViewProps> = ({ cards, onDismiss }) => {
  // State für den ausgewählten Kartenindex für das Modal
  const [selectedCardIndex, setSelectedCardIndex] = useState<number | null>(
    null
  );

  // Custom Hooks
  const { summary, loading, error } = useTarotSummary(cards);
  const { hasScrolledToEnd, handleScroll } = useScrollEndDetection();

  // ScrollView Referenz
  const summaryScrollViewRef = useRef<ScrollView>(null);

  // Handler
  const handleCardPress = (index: number) => {
    setSelectedCardIndex(index);
  };

  // Erstelle einen zusammengesetzten Style mit StyleSheet.flatten
  const titleStyle = StyleSheet.flatten([
    textStyles.title,
    Platform.OS === "ios" ? glowEffects.text : {},
  ]);

  return (
    <View style={layoutStyles.container}>
      <ScrollView
        ref={summaryScrollViewRef}
        style={{ flex: 1, width: "100%" }}
        onScroll={handleScroll}
        scrollEventThrottle={400}
      >
        <Text style={titleStyle}>Deine Kartenlegung</Text>

        <View style={componentStyles.cardsContainer}>
          {cards.map((card, index) => (
            <TarotCardWithLabel
              key={index}
              card={card}
              index={index}
              onPress={handleCardPress}
            />
          ))}
        </View>

        <SummaryPanel
          loading={loading}
          error={error}
          summary={summary ?? ""}
          showButton={hasScrolledToEnd}
          onButtonPress={onDismiss}
        />

        {/* Spacer for scrolling */}
        <View style={{ height: 40 }} />
      </ScrollView>

      <CardDetailModal
        isVisible={selectedCardIndex !== null}
        card={selectedCardIndex !== null ? cards[selectedCardIndex] : null}
        onClose={() => setSelectedCardIndex(null)}
      />
    </View>
  );
};

export default SummaryView;
