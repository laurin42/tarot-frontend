import { useState, useEffect } from 'react';
import { ISelectedAndShownCard } from "@/constants/tarotcards";
import { tarotApi } from "../services/apiService";
import { bugsnagService } from "@/services/bugsnag"; 

export function useTarotSummary(cards: ISelectedAndShownCard[]) {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const summaryText = await tarotApi.fetchSummary(cards);
        setSummary(summaryText);

        // Save the complete reading with summary
        if (summaryText) {
          await tarotApi.saveSummaryReading(cards, summaryText);
        }
      } catch (err) {
        console.error("Summary fetch error:", err);
        const errorMessage = err instanceof Error ? err.message : "Ein Fehler ist aufgetreten";
        setError(errorMessage);
        bugsnagService.notify(
          err instanceof Error ? err : new Error(`Summary fetch error: ${String(err)}`)
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [cards]);

  return { summary, loading, error };
}