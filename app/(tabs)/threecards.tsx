import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { View, Pressable, Text, Dimensions, Animated } from "react-native";
import CardStackView from "@/components/CardStack";
import DrawnCardsDisplay from "@/components/DrawnCardsDisplay";
import { getRandomDrawnCards } from "@/utils/tarotCardPool";
import { ISelectedAndShownCard } from "@/constants/tarotcards";
import SummaryView from "@/components/SummaryView";
import { gameStyles, layoutStyles } from "@/styles/styles";

export default function Index() {
  const { width, height } = Dimensions.get("window");

  const cardDimensions = useMemo(() => {
    const baseCardWidth = width > 400 ? 150 : 100;
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
    setSessionStarted(true);
    setLoading(true);
    setError(null);
    getRandomDrawnCards()
      .then((cards) => {
        setPredeterminedCards(cards);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to get predetermined cards:", err);
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
      setCurrentRound((prev) => prev + 1);
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
    <View style={gameStyles.bgGray900}>
      {!sessionStarted ? (
        <Pressable
          style={[
            gameStyles.startButton,
            { alignSelf: "center", marginTop: 50 },
          ]}
          onPress={handleStartSession}
        >
          <Text style={gameStyles.startButtonText}>Start</Text>
        </Pressable>
      ) : (
        <>
          {currentRound < 3 && !showDrawnCard ? (
            <View style={layoutStyles.flexCenter}>
              <CardStackView
                onAnimationComplete={handleAnimationComplete}
                onCardSelect={handleCardSelect}
                sessionStarted={sessionStarted}
                cardDimensions={cardDimensions}
                drawnSlotPositions={drawnSlotPositions}
                currentRound={currentRound}
                predeterminedCards={predeterminedCards}
                onCardPositioned={handleCardPositioned}
              />
            </View>
          ) : null}

          {showDrawnCard && currentRound < 3 && (
            <Animated.View style={{ opacity: drawnCardOpacity }}>
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
