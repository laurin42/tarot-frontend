import React, { useState, useEffect } from "react";
import { View, Pressable, Text, Dimensions, Animated } from "react-native";
import CardStackView from "@/components/CardStack";
import DrawnCardsDisplay from "@/components/DrawnCardsDisplay";
import { getRandomDrawnCards } from "@/utils/tarotCardPool";
import { ISelectedAndShownCard } from "@/constants/tarotcards";
import SummaryView from "@/components/SummaryView";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saveDrawnCards } from "@/utils/tarotCardUtils";

export default function Index() {
  const { width, height } = Dimensions.get("window");

  const baseCardWidth = width > 400 ? 150 : 100;
  const cardDimensions = {
    width: baseCardWidth,
    height: baseCardWidth * 1.6,
    spacing: baseCardWidth * 0.52,
  };

  const drawnSlotPositions = [
    { x: width / 2, y: 120 }, // Position für erste Karte
    { x: width / 2, y: 120 }, // Position für zweite Karte
    { x: width / 2, y: 120 }, // Position für dritte Karte
  ];

  const [cardsDrawn, setCardsDrawn] = useState(false);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedCards, setSelectedCards] = useState<ISelectedAndShownCard[]>(
    []
  );
  const [showSummary, setShowSummary] = useState(false);
  const [currentRound, setCurrentRound] = useState(0);
  const [predeterminedCards, setPredeterminedCards] = useState<
    ISelectedAndShownCard[]
  >([]);
  const [showDrawnCard, setShowDrawnCard] = useState(false);
  const [drawnCardOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (sessionStarted) {
      (async () => {
        const cards = await getRandomDrawnCards(); // 3 cards
        setPredeterminedCards(cards);
        await saveDrawnCards(cards); // Hier aufrufen
      })();
    }
  }, [sessionStarted]);

  const handleAnimationComplete = () => {
    setCardsDrawn(true);
  };

  const handleCardSelect = (selectedCard: ISelectedAndShownCard) => {
    setSelectedCard(selectedCard.name);
    setSelectedCards((prev) => [...prev, selectedCard]);
  };

  // Korrigiere die handleDismissExplanation-Funktion
  const handleDismissExplanation = () => {
    // Setze showDrawnCard zurück, damit der DrawnCardsDisplay ausgeblendet wird
    setShowDrawnCard(false);

    // Kurze Verzögerung für weichen Übergang
    setTimeout(() => {
      setSelectedCard(null);
      setCurrentRound((prev) => prev + 1);

      // Zurücksetzen der drawnCardOpacity für den nächsten Fade-In
      drawnCardOpacity.setValue(0);
    }, 300);
  };

  const handleDismissSummary = () => {
    setShowSummary(false);
    setSessionStarted(false);
    setSelectedCards([]);
    setCurrentRound(0);
  };

  const handleStartSession = () => {
    setSessionStarted(true);
  };

  const handleCardPositioned = () => {
    // DrawnCardsDisplay mit Fade-in einblenden
    setShowDrawnCard(true);
    Animated.timing(drawnCardOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <View className="flex-1 relative bg-gray-900">
      {!sessionStarted ? (
        <Pressable
          className="absolute self-center bg-orange-600/90 px-4 py-4 rounded-lg z-50"
          style={{ bottom: height * 0.05 }}
          onPress={handleStartSession}
        >
          <Text className="text-white text-base font-bold">Start</Text>
        </Pressable>
      ) : (
        <>
          {currentRound < 3 ? (
            <View className="flex-1 items-center justify-center">
              <CardStackView
                onAnimationComplete={handleAnimationComplete}
                onCardSelect={handleCardSelect}
                sessionStarted={sessionStarted}
                cardDimensions={cardDimensions}
                drawnSlotPositions={drawnSlotPositions}
                currentRound={currentRound}
                predeterminedCards={predeterminedCards} // Pass drawn cards here
                onCardPositioned={handleCardPositioned}
              />
            </View>
          ) : null}

          {showDrawnCard && (
            <Animated.View
              style={{
                position: "absolute",
                width: "100%",
                height: "100%",
                opacity: drawnCardOpacity,
              }}
            >
              <DrawnCardsDisplay
                selectedCards={selectedCards}
                onDismiss={handleDismissExplanation} // Nutze die korrigierte Funktion
                currentRound={currentRound}
              />
            </Animated.View>
          )}

          {currentRound === 3 ? (
            <View className="absolute inset-0 z-50">
              <SummaryView
                cards={selectedCards}
                onDismiss={handleDismissSummary}
              />
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}
