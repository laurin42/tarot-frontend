import { storage } from "../utils/storage";
import { ISelectedAndShownCard } from "@/constants/tarotCards";
import { SummaryResponse, CardExplanationResponse, ReadingSummaryResponse, ApiErrorResponse } from "@/types/api";
import { bugsnagService } from "@/services/bugsnag";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

export async function fetchAndProcessTarotSummary(cards: ISelectedAndShownCard[]): Promise<FetchResult> {
  if (cards.length === 0) {
    return { summary: '', error: null }; // Return early for empty cards
  }
  try {
    const summaryText = await tarotApi.fetchSummary(cards);
    
    // Save the reading (fire and forget)
    if (summaryText) {
      tarotApi.saveSummaryReading(cards, summaryText).catch((saveErr) => {
        console.error('Failed to save summary reading:', saveErr);
        bugsnagService.notify(new Error('Failed to save summary reading'));
      });
    }
    return { summary: summaryText, error: null };

  } catch (err) {
    console.error('Summary fetch/process error:', err);
    const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
    bugsnagService.notify(err instanceof Error ? err : new Error(String(err)));
    return { summary: null, error: errorMessage }; // Return error message
  }
}

// Helper-Funktion zum Erstellen von Header mit Auth-Token
async function getAuthHeaders(): Promise<HeadersInit> {
  const token = await storage.getItem("userToken");
  const headers: HeadersInit = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  return headers;
}

// Helper-Funktion für authentifizierte API-Aufrufe
async function authFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({})) as ApiErrorResponse;
    throw new Error(errorData.error || `API error: ${response.status}`);
  }
  
  return await response.json() as T;
}

export const tarotApi = {
  async saveSingleDrawnCard(card: ISelectedAndShownCard, position: number): Promise<void> {
    try {
      const headers = await getAuthHeaders(); // Header holen
      const response = await fetch(`${API_BASE_URL}/tarot/drawn-card`, { // Direkter fetch
        method: "POST",
        headers: headers, // Verwende die vorbereiteten Header
        body: JSON.stringify({
          name: card.name,
          description: card.explanation ?? 'Keine Erklärung gespeichert',
          position: position,
        }),
      });

      if (!response.ok) {
          // Versuche, Fehlerdetails zu bekommen
          let errorMessage = `API error saving card: ${response.status}`;
          try {
              // Versuche, Fehlerdetails als Text oder JSON zu lesen
              const errorBody = await response.text();
              try {
                  const errorJson = JSON.parse(errorBody);
                  errorMessage = errorJson.error || errorMessage;
              } catch (parseError) {
                  console.debug('Failed to parse error body as JSON', parseError);
                  errorMessage = errorBody || errorMessage;
              }
          } catch (readError) {
            console.debug('Failed to read error body', readError);
          }
          console.error(`❌ Failed to save card via API service: ${card.name}`, errorMessage);
          bugsnagService.notify(new Error(errorMessage)); // Optional: Fehler melden
          throw new Error(errorMessage);
      }
      // Wenn response.ok, war der Request erfolgreich
      console.log(`✅ Card saved via API service: ${card.name}`);

    } catch (error) {
        // Fängt Netzwerkfehler oder oben geworfene Fehler
        const errorToThrow = error instanceof Error ? error : new Error(String(error));
        console.error(`❌ Failed to save card via API service (catch block): ${card.name}`, errorToThrow);
        bugsnagService.notify(errorToThrow); // Optional: Fehler melden
        throw errorToThrow;
    }
  },
  async fetchSummary(cards: ISelectedAndShownCard[]): Promise<string> {
    const data = await authFetch<SummaryResponse>(`${API_BASE_URL}/tarot/summary`, {
      method: "POST",
      body: JSON.stringify({ cards }),
    });
    
    return data.summary;
  },

  // Save a reading summary
  async saveSummaryReading(
    cards: ISelectedAndShownCard[],
    summary: string
  ): Promise<ReadingSummaryResponse | void> {
    const token = await storage.getItem("userToken");
    if (!token) return;

    const sessionId = `reading_${Date.now()}`;
    
    return await authFetch<ReadingSummaryResponse>(`${API_BASE_URL}/tarot/reading-summary`, {
      method: "POST",
      body: JSON.stringify({
        sessionId,
        summary,
        cardNames: cards.map((card) => card.name),
      }),
    });
  },
  
  // Fetch explanation for a specific card
  async fetchCardExplanation(cardName: string): Promise<string> {
    const formattedCardName = cardName.toLowerCase().replace(/ /g, "_");
    
    const data = await authFetch<CardExplanationResponse>(
      `${API_BASE_URL}/tarot/cards/${formattedCardName}`
    );
    
    return data.explanation || "Keine Erklärung verfügbar";
  },

  async fetchRandomCard(): Promise<ISelectedAndShownCard> {
    const data = await authFetch<ISelectedAndShownCard>(`${API_BASE_URL}/tarot/cards/random`);
    
    return {
      ...data,
      showFront: false,
      explanation: data.explanation,
      image: data.image,
      onNextCard: () => {},
    };
  },

};

interface FetchResult {
  summary: string | null;
  error: string | null;
}