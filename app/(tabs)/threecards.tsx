import React, { useState, useRef, useCallback, useMemo } from "react";
import {
  View,
  Pressable,
  Text,
  Dimensions,
  Animated,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import CardStackView from "@/components/CardStack";
import DrawnCardsDisplay from "@/components/DrawnCardsDisplay";
import SummaryView from "@/components/SummaryView";
import { gameStyles, layoutStyles } from "@/styles/styles";
import { CardStackProvider, useCardStack } from "@/context/CardStackContext";

// --- Component for the content ---
function ThreeCardsContent() {
  // --- Local UI State for card display/animation ---
  const [showDrawnCard, setShowDrawnCard] = useState(false);
  const drawnCardOpacity = useRef(new Animated.Value(0)).current;

  // --- Get state and functions from the Context ---
  const {
    sessionStarted,
    loading,
    error,
    drawnCards,
    currentRound,
    startSession,
    dismissSummary,
  } = useCardStack();

  const selectedDrawnCards = useMemo(() => {
    return drawnCards ? drawnCards.filter((c) => c.isSelected) : [];
  }, [drawnCards]);

  // Slot positions
  const { width: windowWidth } = Dimensions.get("window");
  const drawnSlotPositions = useMemo(
    () => [
      { x: windowWidth / 2, y: 120 },
      { x: windowWidth / 2, y: 120 },
      { x: windowWidth / 2, y: 120 },
    ],
    [windowWidth]
  );

  // --- Local callbacks for UI effects ---
  const handleCardPositioned = useCallback(() => {
    setShowDrawnCard(true);
    Animated.timing(drawnCardOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    console.log("A card has been positioned, showing DrawnCardsDisplay");
  }, [setShowDrawnCard, drawnCardOpacity]);

  const handleDismissExplanation = useCallback(() => {
    setShowDrawnCard(false);
    setTimeout(() => {
      drawnCardOpacity.setValue(0);
    }, 300);
  }, [setShowDrawnCard, drawnCardOpacity]);

  // --- Rendering based on Context-State ---
  if (loading) {
    return (
      <View style={[gameStyles.bgGray900, layoutStyles.flexCenter]}>
        <Text style={{ color: "white", fontSize: 18 }}>Lade Karten...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View
        style={[gameStyles.bgGray900, layoutStyles.flexCenter, { padding: 20 }]}
      >
        <Text
          style={{
            color: "red",
            fontSize: 16,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          {error}
        </Text>
        <TouchableOpacity
          onPress={dismissSummary}
          style={{
            backgroundColor: "#4F46E5",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Erneut versuchen</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[gameStyles.bgGray900, { flex: 1 }]}>
      {!sessionStarted ? (
        // --- Start view ---
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Pressable style={gameStyles.startButton} onPress={startSession}>
            <Text style={gameStyles.startButtonText}>Start</Text>
          </Pressable>
        </View>
      ) : (
        // --- View during the session ---
        <>
          {currentRound < 3 && !showDrawnCard && (
            <View style={{ flex: 1 }}>
              <CardStackView
                drawnSlotPositions={drawnSlotPositions}
                onCardPositioned={handleCardPositioned}
              />
            </View>
          )}
          {showDrawnCard && currentRound < 3 && (
            <Animated.View
              style={[StyleSheet.absoluteFill, { opacity: drawnCardOpacity }]}
              pointerEvents="box-none"
            >
              <DrawnCardsDisplay
                selectedCards={selectedDrawnCards}
                onDismiss={handleDismissExplanation}
                currentRound={currentRound}
              />
            </Animated.View>
          )}
          {currentRound === 3 && (
            <SummaryView cards={drawnCards} onDismiss={dismissSummary} />
          )}
        </>
      )}
    </View>
  );
}

// --- Main component with Provider ---
export default function Index() {
  return (
    <CardStackProvider>
      <ThreeCardsContent />
    </CardStackProvider>
  );
}
