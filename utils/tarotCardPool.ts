import { tarotCards, ISelectedAndShownCard } from "@/constants/tarotcards";
import DynamicTarotCard from "@/components/DynamicTarotCard";
import { tarotApi } from "@/services/apiService";
import { storage } from "./storage";
import { bugsnagService } from "@/services/bugsnag";

export async function getRandomDrawnCards(): Promise<ISelectedAndShownCard[]> {
  const shuffledCards = [...tarotCards].sort(() => Math.random() - 0.5);
  const drawnCards = shuffledCards.slice(0, 3);
  const explanations: { [key: string]: string } = {};

  // --- VORÜBERGEHEND AUSKOMMENTIERT ZUM TESTEN ---
  /*
  // Fetch explanations for each card
  await Promise.all(
    drawnCards.map(async (card) => {
      try {
        const explanation = await tarotApi.fetchCardExplanation(card.name);
        explanations[card.name] = explanation;
      } catch (error) {
        console.error(`Failed to get explanation for ${card.name}:`, error);
        bugsnagService.notify(
          error instanceof Error 
            ? error 
            : new Error(`Failed to load card explanation for ${card.name}: ${String(error)}`)
        );
        explanations[card.name] = "Erklärung konnte nicht geladen werden";
      }
    })
  );
  */
  // --- ENDE AUSKOMMENTIERTER BLOCK ---

  // Add optimization for card images
  const optimizedCards = await Promise.all(
    drawnCards.map(async (card) => {
      return card;
    })
  );

  return optimizedCards.map((card) => ({
    ...card,
    showFront: false,
    isSelected: false,
    explanation: explanations[card.name],
    image: card.image,
    onNextCard: () => {},
  }));
}

export async function getRandomDrawnCard(): Promise<ISelectedAndShownCard> {
  try {
    // Get authentication token if available
    const token = await storage.getItem("userToken");

    // Add authentication header if token exists
    const headers: HeadersInit = {};
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${
        process.env.EXPO_PUBLIC_API_URL
      }/tarot/cards/random`,
      { headers }
    );

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    const drawnCard = await response.json();

    return {
      ...drawnCard,
      showFront: false,
      explanation: drawnCard.explanation,
      image: drawnCard.image,
      onNextCard: () => {},
    };
  } catch (error) {
    console.error("Error fetching random card:", error);
    throw error;
  }
}
