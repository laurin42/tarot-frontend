import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import TarotCard from "./TarotCard";
import { ISelectedAndShownCard } from "@/constants/tarotcards";
import { componentStyles, glowEffects, textStyles } from "@/styles";
import { typography } from "@/styles/theme";

interface DrawnCardsDisplayProps {
  selectedCards: ISelectedAndShownCard[];
  onDismiss: () => void;
  currentRound: number;
}

export default function DrawnCardsDisplay({
  selectedCards,
  onDismiss,
  currentRound,
}: DrawnCardsDisplayProps) {
  // Get the card to display (the last one in the array)
  const currentCard =
    selectedCards.length > 0 ? selectedCards[selectedCards.length - 1] : null;

  // LOGGING: Check if currentCard exists and has expected data
  console.log("DrawnCardsDisplay - currentCard:", JSON.stringify(currentCard));
  console.log("DrawnCardsDisplay - currentRound (prop):", currentRound); // Log the prop
  console.log(
    "DrawnCardsDisplay - selectedCards length:",
    selectedCards.length
  );

  // Lokaler State für Button-Opazität
  const [buttonOpacity, setButtonOpacity] = useState(0.3);

  // Für Scroll-Positionsberechnung
  const scrollContainerHeight = useRef(0);
  const scrollContentHeight = useRef(0);

  // Event-Handler
  function handleScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const offsetY = e.nativeEvent.contentOffset.y;
    const visibleHeight = scrollContainerHeight.current;
    const totalHeight = scrollContentHeight.current - visibleHeight;

    // Fortschritt von 0 bis 1:
    const progress = totalHeight > 0 ? Math.min(offsetY / totalHeight, 1) : 0;

    // Beispiel: Opazität linear von 0.3 (oben) bis 0.9 (unten)
    const newOpacity = 0.3 + progress * 0.6;
    setButtonOpacity(newOpacity);
  }

  return (
    <View style={styles.overlay}>
      <View style={[componentStyles.modalContainer, styles.containerOverrides]}>
        {/* Restore ScrollView */}
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          scrollEventThrottle={16}
          onLayout={(e) => {
            scrollContainerHeight.current = e.nativeEvent.layout.height;
          }}
          onContentSizeChange={(h) => {
            scrollContentHeight.current = h;
          }}
          onScroll={handleScroll}
        >
          {currentCard && (
            <View style={styles.cardContainer}>
              <Text style={[textStyles.title, styles.cardTitleOverrides]}>
                {currentCard.name}
              </Text>
              <View style={styles.cardWrapper}>
                <TarotCard
                  name={currentCard.name}
                  image={currentCard.image}
                  isShown={true}
                  style={[componentStyles.cardImage, styles.cardOverrides]}
                />
              </View>
              <Text style={[textStyles.body, styles.explanationTextOverrides]}>
                {currentCard.explanation}
              </Text>
            </View>
          )}
        </ScrollView>

        <TouchableOpacity
          onPress={onDismiss}
          style={[
            componentStyles.buttonFullWidth,
            styles.buttonOverrides,
            { backgroundColor: `rgba(124, 58, 237, ${buttonOpacity})` },
          ]}
        >
          <Text style={typography.button}>
            {currentRound === 3
              ? "Zusammenfassung anzeigen"
              : "Zur nächsten Karte"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.85)",
  },
  containerOverrides: {
    flexDirection: "column",
    padding: 20,
    width: "90%",
    maxHeight: "90%",
    alignItems: "stretch",
  },
  scrollView: {
    // width: "100%", // Keep this if needed (though stretch should handle it)
    flex: 1,
    // backgroundColor: "rgba(255, 0, 0, 0.3)", // Remove DEBUG background
  },
  scrollViewContent: {
    alignItems: "center", // Restore center alignment
    paddingBottom: 20,
  },
  cardContainer: {
    marginBottom: 24,
    alignItems: "center",
  },
  cardTitleOverrides: {
    color: "#A78BFA",
    marginBottom: 24,
    textAlign: "center",
  },
  cardWrapper: {
    width: 160,
    height: 256,
    alignItems: "center",
    justifyContent: "center",
    ...glowEffects.medium,
    borderRadius: 16,
    marginBottom: 24,
  },
  cardOverrides: {
    width: "100%",
    height: "100%",
  },
  explanationTextOverrides: {
    textAlign: "center",
    marginTop: 0,
    paddingHorizontal: 10,
  },
  buttonOverrides: {
    borderTopWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    marginTop: 16,
  },
});
