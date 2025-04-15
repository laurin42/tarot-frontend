import { getRandomLocalCardsWithExplanations } from '../localTarotPool';
import { tarotApi } from '@/services/apiService';

//Mock Dependencies

jest.mock('@/constants/tarotcards', () => {
    const mockTarotCards = [
    { id: 'c1', name: 'Card One', image: 'img1' },
    { id: 'c2', name: 'Card Two', image: 'img2' },
    { id: 'c3', name: 'Card Three', image: 'img3' },
    { id: 'c4', name: 'Card Four', image: 'img4' },
    { id: 'c5', name: 'Card Five', image: 'img5' },
    ];
    return {
  __esModule: true,
  tarotCards: mockTarotCards,
    };
});

jest.mock('@/services/apiService', () => ({
  __esModule: true,
  tarotApi: {
    fetchCardExplanation: jest.fn(async (cardName: string) => {
        if (cardName === 'Card One') return 'Explanation for One';
        if (cardName === 'Card Two') return 'Explanation for Two';
        if (cardName === 'Card Three') return 'Explanation for Three';
        if (cardName === 'Card Four') return 'Explanation for Four';
        if (cardName === 'Card Five') return 'Explanation for Five';
        return 'Default explanation';
    }),
  },
}));


const mockFetchCardExplanation = tarotApi.fetchCardExplanation as jest.Mock;

describe('localTarotPool Service', () => {
  beforeEach(() => {
    mockFetchCardExplanation.mockClear();
    // Restore Math.random mocking if we implement shuffle testing
    // jest.spyOn(global.Math, 'random').mockRestore(); // Example
  });

  describe('getRandomLocalCardsWithExplanations', () => {
    it('should return exactly 3 cards', async () => {
      const result = await getRandomLocalCardsWithExplanations();
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(3);
    });

    it('should return cards that are a subset of the original mockTarotCards', async () => {
        const mockTarotCardsForTest = [
            { id: 'c1', name: 'Card One', image: 'img1' },
            { id: 'c2', name: 'Card Two', image: 'img2' },
            { id: 'c3', name: 'Card Three', image: 'img3' },
            { id: 'c4', name: 'Card Four', image: 'img4' },
            { id: 'c5', name: 'Card Five', image: 'img5' },
        ];
        const result = await getRandomLocalCardsWithExplanations();
        const resultIds = result.map(card => card.id);
        const mockIds = mockTarotCardsForTest.map(card => card.id);

        resultIds.forEach(id => {
            expect(mockIds).toContain(id);
        });

        expect(new Set(resultIds).size).toBe(3);
    });

    it('should call fetchCardExplanation for each of the 3 drawn cards', async () => {
      const result = await getRandomLocalCardsWithExplanations();
      const drawnCardNames = result.map(card => card.name);

      expect(mockFetchCardExplanation).toHaveBeenCalledTimes(3);

      drawnCardNames.forEach(name => {
          expect(mockFetchCardExplanation).toHaveBeenCalledWith(name);
      });
    });

    it('should map explanations correctly to the returned cards', async () => {
      const result = await getRandomLocalCardsWithExplanations();

      // Verify each card has the explanation corresponding to its name based on the mock
      for (const card of result) {
        let expectedExplanation = 'Default explanation';
        if (card.name === 'Card One') expectedExplanation = 'Explanation for One';
        else if (card.name === 'Card Two') expectedExplanation = 'Explanation for Two';
        else if (card.name === 'Card Three') expectedExplanation = 'Explanation for Three';
        else if (card.name === 'Card Four') expectedExplanation = 'Explanation for Four';
        else if (card.name === 'Card Five') expectedExplanation = 'Explanation for Five';

        expect(card.explanation).toBe(expectedExplanation);
      }
    });

    it('should add default properties (showFront, isSelected, onNextCard) to each card', async () => {
      const result = await getRandomLocalCardsWithExplanations();

      result.forEach(card => {
        expect(card.showFront).toBe(false);
        expect(card.isSelected).toBe(false);
        expect(card.onNextCard).toBeInstanceOf(Function);

        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('name');
        expect(card).toHaveProperty('image');
      });
    });

    it('should generally return cards in a different order on subsequent calls', async () => {
      const result1 = await getRandomLocalCardsWithExplanations();
      const result2 = await getRandomLocalCardsWithExplanations();
      const ids1 = result1.map(c => c.id);
      const ids2 = result2.map(c => c.id);
      // This is not guaranteed to fail even if shuffle works, but makes failure less likely
      expect(ids1).not.toEqual(ids2);
    });

    it('should propagate error if fetchCardExplanation fails', async () => {
        const testError = new Error('API fetch failed');
        mockFetchCardExplanation.mockRejectedValueOnce(testError); 

        await expect(getRandomLocalCardsWithExplanations()).rejects.toThrow('API fetch failed');

        expect(mockFetchCardExplanation).toHaveBeenCalled();
    });
  });
});
