import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import TarotCard from "./TarotCard";
import { ISelectedAndShownCard } from "@/constants/tarotcards";

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
  const currentCard = selectedCards[currentRound];

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
      <View style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollViewContent}
          scrollEventThrottle={16}
          onLayout={(e) => {
            // sichtbarer Bereich
            scrollContainerHeight.current = e.nativeEvent.layout.height;
          }}
          onContentSizeChange={(h) => {
            // gesamte Scroll-Höhe
            scrollContentHeight.current = h;
          }}
          onScroll={handleScroll}
        >
          {currentCard && (
            <View style={styles.cardContainer}>
              <Text style={styles.cardTitle}>{currentCard.name}</Text>
              <View style={styles.cardWrapper}>
                <TarotCard
                  image={currentCard.image}
                  isShown={true}
                  style={styles.card}
                />
              </View>
              <Text style={styles.explanationText}>
                {currentCard.explanation}
              </Text>
            </View>
          )}
        </ScrollView>

        <TouchableOpacity
          onPress={onDismiss}
          style={[
            styles.button,
            { backgroundColor: `rgba(124, 58, 237, ${buttonOpacity})` },
          ]}
        >
          <Text style={styles.buttonText}>
            {currentRound === 2
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
  container: {
    width: "90%",
    maxHeight: "90%",
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.98)",
    borderRadius: 16,
    padding: 20, // Reduced from 24
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    ...Platform.select({
      ios: {
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  cardTitle: {
    color: "#A78BFA",
    fontSize: 24, // Reduced from 28
    fontWeight: "bold",
    marginBottom: 24, // Reduced from 32
    textAlign: "center",
  },
  cardWrapper: {
    // Der Wrapper hat dieselben Dimensionen wie die Karte
    width: 160,
    height: 256,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 8,
    borderRadius: 16, // Stimmt den Glow-Radius auf die Karte ab
  },
  card: {
    // Karte auf volle Wrapper-Fläche
    width: "100%",
    height: "100%",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.2)",
  },
  explanationContainer: {
    width: "100%",
    marginTop: 24, // Reduced from 32
    flex: 1.5, // Increased from 1 to give more space to text
    backgroundColor: "rgba(17, 24, 39, 0.95)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    overflow: "hidden", // Ensures content doesn't overflow
    display: "flex", // Ensures proper flex layout
    ...Platform.select({
      ios: {
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  scrollView: {
    flex: 1, // Takes remaining space
    padding: 20, // Adjusted padding
  },
  scrollViewContent: {
    flexGrow: 1,
    alignItems: "center", // <-- zentriert Inhalt im ScrollView
  },
  explanationText: {
    color: "#F3F4F6",
    fontSize: 17, // Slightly reduced from 18
    lineHeight: 26, // Adjusted for better readability
    textAlign: "center",
    marginTop: 24, // füge diesen hinzu
  },
  button: {
    width: "100%",
    paddingVertical: 16,
    paddingHorizontal: 32,
    backgroundColor: "rgba(124, 58, 237, 0.9)",
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    borderTopWidth: 1,
    borderColor: "rgba(139, 92, 246, 0.3)",
    marginTop: "auto", // Statt "auto" kommt ein fester Wert für minimalen Abstand
    ...Platform.select({
      ios: {
        shadowColor: "#8B5CF6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  cardContainer: {
    marginBottom: 24,
    alignItems: "center", // <-- zentriert die Karte im Wrapper
  },
});
