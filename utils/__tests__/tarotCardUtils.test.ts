import AsyncStorage from '@react-native-async-storage/async-storage';
// Entferne den Import von tarotApi, da wir fetch mocken
// import { tarotApi } from '@/services/apiService';
import { saveDrawnCards } from '../tarotCardUtils';
import { ISelectedAndShownCard } from '../../constants/tarotCards';


// Mock die globale fetch Funktion
global.fetch = jest.fn();
const mockFetch = global.fetch as jest.Mock;

// Mock console.log, console.error UND console.warn
const mockConsoleLog = jest.spyOn(console, 'log').mockImplementation(() => {});
const mockConsoleWarn = jest.spyOn(console, 'warn').mockImplementation(() => {}); // Hinzugefügt
const mockConsoleError = jest.spyOn(console, 'error').mockImplementation(() => {});

// Typed mock für die API call ist nicht mehr nötig, mockFetch wird verwendet
// const mockSaveSingleDrawnCard = tarotApi.saveSingleDrawnCard as jest.Mock;

// Define mockAsyncGetItem here to access the globally mocked function
const mockAsyncGetItem = AsyncStorage.getItem as jest.Mock;

const mockCards: ISelectedAndShownCard[] = [
  { id: 'c1', name: 'Card One', image: 'img1', explanation: 'Expl 1', onNextCard: () => {}, showFront: true },
  { id: 'c2', name: 'Card Two', image: 'img2', explanation: 'Expl 2', onNextCard: () => {}, showFront: true },
  { id: 'c3', name: 'Card Three', image: 'img3', explanation: 'Expl 3', onNextCard: () => {}, showFront: true },
  {
    id: "1",
    name: 'The Fool',
    image: 'img1',
    onNextCard: jest.fn(),
    explanation: 'Explanation for The Fool',
  },
  {
    id: "2",
    name: 'The Magician',
    image: 'img2',
    onNextCard: jest.fn(),
    explanation: 'Explanation for The Magician',
  },
  {
    id: "3",
    name: 'The Queen',
    image: 'img3',
    onNextCard: jest.fn(),
    explanation: 'Explanation for The Queen',
  },
  {
    id: "4",
    name: 'The Jester',
    image: 'img4',
    onNextCard: jest.fn(),
    explanation: 'Explanation for The Jester',
  },
  {
    id: "5",
    name: 'The Cat',
    image: 'img5',
    onNextCard: jest.fn(),
    explanation: 'Explanation for The Cat',
  },
];

const mockToken = 'mock-user-token';

describe('saveDrawnCards', () => {
  beforeEach(() => {
    // Reset mocks before each test
    // mockSaveSingleDrawnCard.mockClear(); // Entfernen
    mockFetch.mockClear(); // Hinzufügen
    mockConsoleLog.mockClear();
    mockConsoleWarn.mockClear(); // Hinzufügen
    mockConsoleError.mockClear();
    // Clear the globally mocked AsyncStorage functions
    mockAsyncGetItem.mockClear();
    (AsyncStorage.setItem as jest.Mock).mockClear();
    (AsyncStorage.removeItem as jest.Mock).mockClear();
    (AsyncStorage.clear as jest.Mock).mockClear();

    // Standard-Mock für erfolgreichen Fetch (kann pro Test überschrieben werden)
    mockFetch.mockResolvedValue({
      ok: true,
      // json: async () => ({ success: true }), // Nicht benötigt für saveDrawnCards
      text: async () => 'Success',
    });
  });

  it('should not call API if token is not found', async () => {
    mockAsyncGetItem.mockResolvedValueOnce(null); // Simulate no token found

    await saveDrawnCards(mockCards);

    expect(mockAsyncGetItem).toHaveBeenCalledWith('userToken');
    expect(mockFetch).not.toHaveBeenCalled();
    expect(mockConsoleWarn).toHaveBeenCalledWith(
      'No user token found, skipping save to database'
    );
    expect(mockConsoleLog).not.toHaveBeenCalled(); 
  });

  it('should call fetch for each card if token exists', async () => {
    mockAsyncGetItem.mockResolvedValueOnce(mockToken); // Simulate token found

    await saveDrawnCards(mockCards);

    expect(mockAsyncGetItem).toHaveBeenCalledWith('userToken');
    // Erwarte fetch Aufrufe für jede Karte
    expect(mockFetch).toHaveBeenCalledTimes(mockCards.length);

    // Überprüfe den ersten Aufruf genauer (Beispiel)
    expect(mockFetch).toHaveBeenNthCalledWith(
      1,
      `${process.env.EXPO_PUBLIC_API_URL}/tarot/drawn-card`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          name: mockCards[0].name,
          description: mockCards[0].explanation,
          position: 0, // Index der Karte
        }),
      }
    );
     // Überprüfe den zweiten Aufruf genauer (Beispiel)
    expect(mockFetch).toHaveBeenNthCalledWith(
      2,
      `${process.env.EXPO_PUBLIC_API_URL}/tarot/drawn-card`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${mockToken}`,
        },
        body: JSON.stringify({
          name: mockCards[1].name,
          description: mockCards[1].explanation,
          position: 1, // Index der Karte
        }),
      }
    );
    // ... weitere Prüfungen für andere Karten bei Bedarf ...

    expect(mockConsoleError).not.toHaveBeenCalled();
    // Überprüfe die Erfolgs-Logs
    expect(mockConsoleLog).toHaveBeenCalledWith(`✅ Card saved to user history: ${mockCards[0].name}`);
    expect(mockConsoleLog).toHaveBeenCalledWith(`✅ Card saved to user history: ${mockCards[1].name}`);
    // ...
    expect(mockConsoleLog).toHaveBeenCalledWith('✅ All drawn cards saved to database');
  });

  it('should log an error if fetch fails for a card', async () => {
    const apiErrorText = 'Internal Server Error';
    mockAsyncGetItem.mockResolvedValueOnce(mockToken); // Simulate token found

    // Simuliere einen fehlgeschlagenen fetch für den zweiten Aufruf
    mockFetch
      .mockResolvedValueOnce({ ok: true, text: async () => 'OK' }) // First call succeeds
      .mockResolvedValueOnce({ ok: false, status: 500, text: async () => apiErrorText });
      mockFetch.mockResolvedValue({ ok: true, text: async () => 'OK' });


    await saveDrawnCards(mockCards);

    expect(mockAsyncGetItem).toHaveBeenCalledWith('userToken');
    expect(mockFetch).toHaveBeenCalledTimes(mockCards.length);

    expect(mockConsoleError).toHaveBeenCalledTimes(1);
    expect(mockConsoleError).toHaveBeenCalledWith(
      `❌ Failed to save card: ${mockCards[1].name}`, // 
      apiErrorText
    );

    expect(mockConsoleLog).not.toHaveBeenCalledWith(
      `✅ Card saved to user history: ${mockCards[1].name}`
    );

    expect(mockConsoleLog).toHaveBeenCalledWith(
      `✅ Card saved to user history: ${mockCards[0].name}`
    );

     expect(mockConsoleLog).toHaveBeenCalledWith(
        `✅ Card saved to user history: ${mockCards[2].name}`
      );

    expect(mockConsoleLog).toHaveBeenCalledWith('✅ All drawn cards saved to database');
  });

  it('should handle empty card array gracefully', async () => {
    mockAsyncGetItem.mockResolvedValueOnce(mockToken); // Simulate token found

    await saveDrawnCards([]);

    expect(mockAsyncGetItem).toHaveBeenCalledWith('userToken');
    expect(mockFetch).not.toHaveBeenCalled(); 
    expect(mockConsoleWarn).not.toHaveBeenCalled();
    expect(mockConsoleError).not.toHaveBeenCalled();
    expect(mockConsoleLog).toHaveBeenCalledWith('✅ All drawn cards saved to database');
  });

  it('should log an error if checking token fails', async () => {
    const storageError = new Error('AsyncStorage Error');
    mockAsyncGetItem.mockRejectedValueOnce(storageError); // 
    await expect(saveDrawnCards(mockCards)).rejects.toThrow(storageError);

    expect(mockAsyncGetItem).toHaveBeenCalledWith('userToken');
    expect(mockFetch).not.toHaveBeenCalled();
    // Überprüfe, ob der Fehler korrekt geloggt wurde
    expect(mockConsoleError).toHaveBeenCalledWith(
      'Failed to save drawn cards:', 
      storageError
    );
  });
});