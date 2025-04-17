// hooks/useDailyCard.ts
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ISelectedAndShownCard } from '@/constants/tarotCards';
import { tarotApi } from '@/services/apiService'; // Importiere tarotApi
import { bugsnagService } from '@/services/bugsnag'; // Import Bugsnag für Fehler-Reporting

// Definiere den Rückgabetyp des Hooks
export interface UseDailyCardResult {
  card: ISelectedAndShownCard | null;
  explanation: string;
  loading: boolean;
  error: string | null;
  isDrawn: boolean;
  drawDailyCard: () => Promise<void>;
}

const DAILY_CARD_STORAGE_KEY = 'dailyCardData';

export const useDailyCard = (): UseDailyCardResult => {
  const [card, setCard] = useState<ISelectedAndShownCard | null>(null);
  const [explanation, setExplanation] = useState('');
  const [loading, setLoading] = useState(false); // Startet nicht im Ladezustand
  const [error, setError] = useState<string | null>(null);
  const [isDrawn, setIsDrawn] = useState(false);

  // Prüfe beim Start, ob bereits eine Karte für heute gespeichert ist
  useEffect(() => {
    let isMounted = true; // Flag, um State-Updates nach Unmount zu verhindern
    setLoading(true); // Setze Loading auf true, während wir prüfen
    setError(null); // Fehler zurücksetzen

    const checkStoredCard = async () => {
      try {
        const storedData = await AsyncStorage.getItem(DAILY_CARD_STORAGE_KEY);
        if (storedData && isMounted) {
          const parsedData = JSON.parse(storedData);
          const today = new Date().toDateString();

          if (parsedData.date === today && parsedData.card) {
            setCard(parsedData.card);
            setExplanation(parsedData.explanation ?? ''); // Nutze gespeicherte Erklärung
            setIsDrawn(true);
          } else {
             // Falls Datum nicht stimmt oder Daten ungültig, ggf. löschen
             await AsyncStorage.removeItem(DAILY_CARD_STORAGE_KEY);
          }
        }
      } catch (err) {
        console.error('Error loading daily card from storage:', err);
        bugsnagService.notify(new Error('Failed to load daily card from storage'));
        if (isMounted) {
          // Optional: Setze einen Fehler, wenn das Laden fehlschlägt
          // setError("Konnte gespeicherte Karte nicht laden.");
        }
      } finally {
         if (isMounted) {
            setLoading(false); // Ladezustand beenden, egal ob Karte gefunden wurde oder nicht
         }
      }
    };

    checkStoredCard();

    return () => {
      isMounted = false; // Cleanup-Funktion für den Effekt
    };
  }, []); // Läuft nur einmal beim Mounten

  // Funktion zum Ziehen einer neuen Tageskarte
  const drawDailyCard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Zufällige Karte vom API holen
      const randomCard = await tarotApi.fetchRandomCard(); // Verwendet die API-Funktion
      if (!randomCard) {
         throw new Error("Keine Karte vom Server erhalten.");
      }

      // Erklärung ist bereits in randomCard enthalten (gemäß apiService.ts)
      const fetchedExplanation = randomCard.explanation ?? "Keine Erklärung verfügbar.";

      // 2. Zustand aktualisieren
      setCard(randomCard);
      setExplanation(fetchedExplanation);
      setIsDrawn(true);

      // 3. Im AsyncStorage speichern
      const today = new Date().toDateString();
      const dataToStore = JSON.stringify({
        date: today,
        card: randomCard, // Speichere das ganze Objekt
        explanation: fetchedExplanation,
      });
      await AsyncStorage.setItem(DAILY_CARD_STORAGE_KEY, dataToStore);

    } catch (err) {
      console.error('Error drawing/fetching daily card:', err);
      bugsnagService.notify(err instanceof Error ? err : new Error(String(err)));
      const errorMessage = err instanceof Error ? err.message : 'Ein unbekannter Fehler ist aufgetreten.';
      setError(`Fehler beim Ziehen der Karte: ${errorMessage}`);
      setIsDrawn(false); // Stelle sicher, dass isDrawn false ist bei Fehler
      setCard(null); // Karte zurücksetzen bei Fehler
      setExplanation('');
    } finally {
      setLoading(false);
    }
  }, []); // Keine Abhängigkeiten, da alle verwendeten Funktionen stabil sind

  return {
    card,
    explanation,
    loading,
    error,
    isDrawn,
    drawDailyCard,
  };
}; 