import { tarotCards, ISelectedAndShownCard } from "@/constants/tarotCards";
import { tarotApi } from "@/services/apiService";


export async function getRandomLocalCardsWithExplanations(): Promise<ISelectedAndShownCard[]> {
  const shuffledCards = [...tarotCards].sort(() => Math.random() - 0.5);
  const drawnCards = shuffledCards.slice(0, 3);

  const cardsWithExplanations = await Promise.all(
    drawnCards.map(async (card) => {
      const explanation = await tarotApi.fetchCardExplanation(card.name);
      return {
        ...card,
        showFront: false,
        isSelected: false,
        explanation,
        onNextCard: () => {},
      };
    })
  );

  return cardsWithExplanations;
}
