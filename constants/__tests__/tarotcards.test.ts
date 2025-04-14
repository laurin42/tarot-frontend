import {
  getCardImageByName,
  tarotCards,
  CARD_BACK_IMAGES,
} from '../tarotCards';

describe('Tarot Cards Constants and Functions', () => {
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('getCardImageByName', () => {
    it('should return the correct image source for a known card name', () => {
      const knownCard = tarotCards.find(card => card.name === "Der Magier");
      expect(knownCard).toBeDefined();

      if (knownCard) {
        const result = getCardImageByName(knownCard.name);
        expect(result).toBeDefined();
        expect(result).toBeTruthy();
        expect(result).not.toEqual(CARD_BACK_IMAGES[0]);
      }
    });

    it('should return the fallback image for an unknown card name', () => {
      const unknownCardName = "Karte die es nicht gibt";
      const result = getCardImageByName(unknownCardName);

      expect(result).toBeDefined();
      expect(result).toEqual(CARD_BACK_IMAGES[0]);
    });

    it('should call console.warn for an unknown card name', () => {
        const unknownCardName = "Noch eine unbekannte Karte";
        getCardImageByName(unknownCardName);

        expect(consoleWarnSpy).toHaveBeenCalled();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
          `Keine Bildabbildung für Karte "${unknownCardName}" gefunden`
        );
    });

     it('should not call console.warn for a known card name', () => {
        const knownCardName = "Die Kaiserin"; 
        getCardImageByName(knownCardName);

        expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('tarotCards array', () => {
    it('should contain valid card objects', () => {
      expect(tarotCards).toBeInstanceOf(Array);
      expect(tarotCards.length).toBeGreaterThan(0);
    });

    it('should have a defined image property for every card', () => {
      tarotCards.forEach((card) => {
        expect(card).toHaveProperty('id');
        expect(card).toHaveProperty('name');
        expect(card).toHaveProperty('image');
        expect(card.image).toBeDefined();
        expect(card.image).toBeTruthy();
      });
    });
  });

  describe('cardImageMapping completeness (indirect check)', () => {
    it('should have a mapping for every card listed in tarotCards', () => {
      tarotCards.forEach((card) => {
        getCardImageByName(card.name);
      });

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

   describe('CARD_BACK_IMAGES array', () => {
      it('should contain defined image sources', () => {
          expect(CARD_BACK_IMAGES).toBeInstanceOf(Array);
          expect(CARD_BACK_IMAGES.length).toBeGreaterThan(0);
          CARD_BACK_IMAGES.forEach(backImage => {
              expect(backImage).toBeDefined();
              expect(backImage).toBeTruthy();
          });
      });
   });

});
