import { storage } from "../utils/storage";
import { ISelectedAndShownCard } from "@/constants/tarotcards";
import { SummaryResponse, CardExplanationResponse, ReadingSummaryResponse, ApiErrorResponse } from "@/types/api";

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || "http://192.168.178.67:8000";

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
  // Fetch summary for a set of cards
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
  }
};