import { useState, useCallback, useMemo } from 'react';
import { Dimensions } from 'react-native';
import { ISelectedAndShownCard } from '@/constants/tarotCards';
import { getRandomLocalCardsWithExplanations } from '@/services/localTarotPool';

// Helper (kann auch hier oder global definiert werden)
const getSafeDimensions = () => {
  try {
    if (Dimensions && typeof Dimensions.get === 'function') {
      return Dimensions.get('window');
    }
  } catch (error) {
    console.warn("[useCardSessionManagement] Dimensions API failed:", error);
  }
  // Fallback für Tests oder ungewöhnliche Umgebungen
  return { width: 400, height: 800 };
};

export function useCardSessionManagement() {
  const [sessionStarted, setSessionStarted] = useState(false);
  const [drawnCards, setDrawnCards] = useState<ISelectedAndShownCard[]>([]);
  const [currentRound, setCurrentRound] = useState(0);
  const [predeterminedCards, setPredeterminedCards] = useState<ISelectedAndShownCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Berechnung der Kartendimensionen ---
  const { width: windowWidth } = getSafeDimensions(); // Sicherstellen, dass wir die Breite haben
  const cardDimensions = useMemo(() => {
    const baseCardWidth = windowWidth > 400 ? 230 : 160;
    return {
      width: baseCardWidth,
      height: baseCardWidth * 1.6,
      // spacing kann hier bleiben oder entfernt werden, je nachdem wo es gebraucht wird
      // spacing: baseCardWidth * 0.52,
    };
  }, [windowWidth]); // Abhängigkeit von der Fensterbreite

  const startSession = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const cards = await getRandomLocalCardsWithExplanations();
      if (!cards || cards.length === 0) {
        throw new Error("Keine Karten zum Anzeigen gefunden.");
      }
      setPredeterminedCards(cards);
      setDrawnCards([]); // Gezogene Karten zurücksetzen
      setCurrentRound(0); // Runde zurücksetzen
      setSessionStarted(true); // Erst starten, wenn Karten geladen sind
    } catch (err: any) {
      console.error("[startSession] Failed to get/set cards:", err);
      setError(err.message || "Fehler beim Laden der Karten.");
      setSessionStarted(false); // Nicht starten bei Fehler
    } finally {
      setLoading(false);
    }
  }, []);

  const selectCard = useCallback((card: ISelectedAndShownCard) => {
    if (currentRound < 3 && sessionStarted) {
      setDrawnCards((prev) => [...prev, { ...card, isSelected: true }]);
      setCurrentRound((prev) => prev + 1);
      console.log("[selectCard] Card Selected:", card.name, "New Round:", currentRound + 1);
    }
  }, [currentRound, sessionStarted]);

  const dismissSummary = useCallback(() => {
    setSessionStarted(false);
    setDrawnCards([]);
    setCurrentRound(0);
    setPredeterminedCards([]);
    setError(null);
    setLoading(false);
  }, []);

  return {
    sessionStarted,
    drawnCards,
    currentRound,
    predeterminedCards,
    loading,
    error,
    cardDimensions,
    startSession,
    selectCard,
    dismissSummary,
  };
}
