import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import {
  View,
  Pressable,
  Text,
  Dimensions,
  Animated,
  StyleSheet,
} from "react-native";
import CardStackView from "@/components/CardStack";
import DrawnCardsDisplay from "@/components/DrawnCardsDisplay";
import { getRandomDrawnCards } from "@/utils/tarotCardPool";
import { ISelectedAndShownCard } from "@/constants/tarotCards";
import SummaryView from "@/components/SummaryView";
import { gameStyles, layoutStyles } from "@/styles/styles";
import { GestureHandlerRootView } from "react-native-gesture-handler";

// Helper to safely get dimensions, providing defaults for tests
const getSafeDimensions = () => {
  try {
    if (Dimensions && typeof Dimensions.get === "function") {
      return Dimensions.get("window");
    }
  } catch (error) {
    console.warn("[ThreeCardsScreen] Dimensions API failed:", error);
  }
  return { width: 400, height: 800 }; // Default values for tests
};

export default function Index() {
  // Use the safe getter
  const { width, height } = getSafeDimensions();

  const cardDimensions = useMemo(() => {
    const baseCardWidth = width > 400 ? 230 : 160;
    return {
      width: baseCardWidth,
      height: baseCardWidth * 1.6,
      spacing: baseCardWidth * 0.52,
    };
  }, [width]);

  const drawnSlotPositions = useMemo(
    () => [
      { x: width / 2, y: 120 },
      { x: width / 2, y: 120 },
      { x: width / 2, y: 120 },
    ],
    [width]
  );

  const [sessionStarted, setSessionStarted] = useState(false);
  const [drawnCards, setDrawnCards] = useState<ISelectedAndShownCard[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [predeterminedCards, setPredeterminedCards] = useState<
    ISelectedAndShownCard[]
  >([]);
  const [showDrawnCard, setShowDrawnCard] = useState(false);
  const drawnCardOpacity = useRef(new Animated.Value(0)).current;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Memoize the filtered cards passed to DrawnCardsDisplay
  const selectedDrawnCards = useMemo(() => {
    return drawnCards.filter((c) => c.isSelected);
  }, [drawnCards]); // Recalculate only when drawnCards changes

  const handleStartSession = useCallback(() => {
    console.log("Start button clicked, calling handleStartSession");
    setSessionStarted(true);
    setLoading(true);
    setError(null);
    getRandomDrawnCards()
      .then((cards) => {
        console.log("[handleStartSession] Received cards:", cards);
        if (!cards || cards.length === 0) {
          console.warn(
            "[handleStartSession] No cards received or empty array!"
          );
          setError("Keine Karten zum Anzeigen gefunden.");
          setLoading(false);
          setSessionStarted(false);
          return;
        }
        console.log(
          "[handleStartSession] Setting predeterminedCards and loading=false"
        );
        setPredeterminedCards(cards);
        setLoading(false);
      })
      .catch((err) => {
        console.error(
          "[handleStartSession] Failed to get predetermined cards:",
          err
        );
        setError("Fehler beim Laden der Karten.");
        setLoading(false);
        setSessionStarted(false);
      });
  }, [setSessionStarted, setLoading, setError, setPredeterminedCards]);

  const handleAnimationComplete = useCallback(() => {
    console.log("CardStack Animation Complete");
  }, []);

  const handleCardSelect = useCallback(
    (card: ISelectedAndShownCard) => {
      if (currentRound < 3) {
        const updatedDrawnCards = [
          ...drawnCards,
          { ...card, isSelected: true },
        ];
        setDrawnCards(updatedDrawnCards);
        setCurrentRound((prev) => prev + 1);
        console.log("Card Selected:", card.name, "Round:", currentRound + 1);
      }
    },
    [currentRound, drawnCards, setDrawnCards, setCurrentRound]
  );

  const handleCardPositioned = useCallback(() => {
    setShowDrawnCard(true);
    Animated.timing(drawnCardOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
    console.log("A card has been positioned, showing DrawnCardsDisplay");
  }, [setShowDrawnCard]);

  const handleDismissExplanation = () => {
    setShowDrawnCard(false);
    setTimeout(() => {
      drawnCardOpacity.setValue(0);
    }, 300);
  };

  const handleDismissSummary = () => {
    setSessionStarted(false);
    setDrawnCards([]);
    setCurrentRound(0);
    setError(null);
  };

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
        <Pressable
          onPress={handleDismissSummary}
          style={{
            backgroundColor: "#4F46E5",
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "white", fontSize: 16 }}>Erneut versuchen</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[gameStyles.bgGray900, { flex: 1 }]}>
      {!sessionStarted ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <Pressable
            style={gameStyles.startButton}
            onPress={handleStartSession}
          >
            <Text style={gameStyles.startButtonText}>Start</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {currentRound < 3 && !showDrawnCard ? (
            <>
              <View style={{ flex: 1 }}>
                <CardStackView
                  onCardSelect={handleCardSelect}
                  sessionStarted={sessionStarted}
                  cardDimensions={cardDimensions}
                  drawnSlotPositions={drawnSlotPositions}
                  currentRound={currentRound}
                  predeterminedCards={predeterminedCards}
                  onCardPositioned={handleCardPositioned}
                />
              </View>
            </>
          ) : null}

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

          {currentRound === 3 ? (
            <SummaryView cards={drawnCards} onDismiss={handleDismissSummary} />
          ) : null}
        </>
      )}
    </View>
  );
}
