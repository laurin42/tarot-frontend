import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useCardSessionManagement } from '../useCardSessionManagement';
import { getRandomLocalCardsWithExplanations } from '@/services/localTarotPool';
import { ISelectedAndShownCard } from '@/constants/tarotCards';

// Mock den Service
jest.mock('@/services/localTarotPool', () => ({
  getRandomLocalCardsWithExplanations: jest.fn(),
}));

// Helper für Mock-Daten
const mockCard1: ISelectedAndShownCard = { id: '1', name: 'Card 1', image: 'img1.png', explanation: 'Expl 1', onNextCard: jest.fn() };
const mockCard2: ISelectedAndShownCard = { id: '2', name: 'Card 2', image: 'img2.png', explanation: 'Expl 2', onNextCard: jest.fn() };
const mockCard3: ISelectedAndShownCard = { id: '3', name: 'Card 3', image: 'img3.png', explanation: 'Expl 3', onNextCard: jest.fn()};
const mockPredeterminedCards = [mockCard1, mockCard2, mockCard3];

// Typ-Alias für den Mock, um einfacher darauf zugreifen zu können
const mockGetRandomCards = getRandomLocalCardsWithExplanations as jest.Mock;

describe('useCardSessionManagement', () => {
  // Reset mocks before each test
  beforeEach(() => {
    mockGetRandomCards.mockClear();
    // Standardmäßig erfolgreich, kann in Tests überschrieben werden
    mockGetRandomCards.mockResolvedValue([...mockPredeterminedCards]);
  });

  // --- Test 1: Initialer Zustand ---
  it('should return the initial state correctly', () => {
    const { result } = renderHook(() => useCardSessionManagement());

    expect(result.current.sessionStarted).toBe(false);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.drawnCards).toEqual([]);
    expect(result.current.currentRound).toBe(0);
    expect(result.current.predeterminedCards).toEqual([]);
    // Prüfe, ob cardDimensions einen sinnvollen Standard hat (Werte können variieren)
    expect(result.current.cardDimensions).toEqual({
        width: expect.any(Number),
        height: expect.any(Number),
    });
    expect(result.current.cardDimensions.width).toBeGreaterThan(0);
    expect(result.current.cardDimensions.height).toBeGreaterThan(0);

    // Prüfe, ob die Funktionen definiert sind
    expect(typeof result.current.startSession).toBe('function');
    expect(typeof result.current.selectCard).toBe('function');
    expect(typeof result.current.dismissSummary).toBe('function');
  });

  // --- Test 2: startSession (Erfolg) ---
  it('should start the session and load cards successfully', async () => {
    const { result } = renderHook(() => useCardSessionManagement());

    // Führe die Aktion aus, die State-Updates verursacht
    // act stellt sicher, dass alle Updates verarbeitet werden, bevor Assertions laufen
    await act(async () => {
      await result.current.startSession();
    });

    // Prüfe den finalen Zustand nach der asynchronen Operation
    expect(result.current.loading).toBe(false);
    expect(result.current.sessionStarted).toBe(true);
    expect(result.current.predeterminedCards).toEqual(mockPredeterminedCards);
    expect(result.current.drawnCards).toEqual([]); // Sollte zurückgesetzt sein
    expect(result.current.currentRound).toBe(0);  // Sollte zurückgesetzt sein
    expect(result.current.error).toBeNull();

    // Prüfe, ob der Service aufgerufen wurde
    expect(mockGetRandomCards).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when starting the session fails', async () => {
    const errorMessage = 'Service unavailable';
    mockGetRandomCards.mockRejectedValue(new Error(errorMessage));
    const { result } = renderHook(() => useCardSessionManagement());
    await act(async () => {
      await result.current.startSession();
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.sessionStarted).toBe(false);
    expect(result.current.error).toBe(errorMessage);
    expect(result.current.predeterminedCards).toEqual([]);
    expect(result.current.drawnCards).toEqual([]);
    expect(result.current.currentRound).toBe(0);
    expect(mockGetRandomCards).toHaveBeenCalledTimes(1);
  });

  it('should handle errors when no cards are returned', async () => {
    mockGetRandomCards.mockResolvedValue([]);
    const { result } = renderHook(() => useCardSessionManagement());
    await act(async () => {
      await result.current.startSession();
    });
    expect(result.current.loading).toBe(false);
    expect(result.current.sessionStarted).toBe(false);
    expect(result.current.error).toBe("Keine Karten zum Anzeigen gefunden.");
    expect(result.current.predeterminedCards).toEqual([]);
    expect(result.current.drawnCards).toEqual([]);
    expect(result.current.currentRound).toBe(0);
    expect(mockGetRandomCards).toHaveBeenCalledTimes(1);
  });

  // --- Test 5: selectCard ---
  it('should select cards correctly and update round count', async () => {
    const { result } = renderHook(() => useCardSessionManagement());

    // Session starten
    await act(async () => {
      await result.current.startSession();
    });

    // Runde 1
    act(() => {
      result.current.selectCard(mockCard1);
    });
    expect(result.current.drawnCards).toHaveLength(1);
    expect(result.current.drawnCards[0]).toEqual({ ...mockCard1, isSelected: true });
    expect(result.current.currentRound).toBe(1);

    // Runde 2
    act(() => {
      result.current.selectCard(mockCard2);
    });
    expect(result.current.drawnCards).toHaveLength(2);
    expect(result.current.drawnCards[1]).toEqual({ ...mockCard2, isSelected: true });
    expect(result.current.currentRound).toBe(2);

    // Runde 3
    act(() => {
      result.current.selectCard(mockCard3);
    });
    expect(result.current.drawnCards).toHaveLength(3);
    expect(result.current.drawnCards[2]).toEqual({ ...mockCard3, isSelected: true });
    expect(result.current.currentRound).toBe(3);
  });

  // --- Test 6: selectCard (Grenzen) ---
  it('should not select more than 3 cards', async () => {
     const { result } = renderHook(() => useCardSessionManagement());

    // Session starten
    await act(async () => {
      await result.current.startSession();
    });

    // 3 Karten auswählen
    act(() => { result.current.selectCard(mockCard1); });
    act(() => { result.current.selectCard(mockCard2); });
    act(() => { result.current.selectCard(mockCard3); });

    expect(result.current.drawnCards).toHaveLength(3);
    expect(result.current.currentRound).toBe(3);

    // Versuch, eine 4. Karte auszuwählen
    act(() => {
      result.current.selectCard(mockCard1); // Versuch mit einer anderen Karte
    });

    // Zustand sollte unverändert sein
    expect(result.current.drawnCards).toHaveLength(3);
    expect(result.current.currentRound).toBe(3);
  });

  it('should not select cards if session is not started', () => {
    const { result } = renderHook(() => useCardSessionManagement());

    // Sicherstellen, dass die Session nicht gestartet ist
    expect(result.current.sessionStarted).toBe(false);

    // Versuch, eine Karte auszuwählen
    act(() => {
      result.current.selectCard(mockCard1);
    });

    // Zustand sollte unverändert sein
    expect(result.current.drawnCards).toHaveLength(0);
    expect(result.current.currentRound).toBe(0);
  });

  // --- Test 7: dismissSummary ---
  it('should reset the state when summary is dismissed', async () => {
    const { result } = renderHook(() => useCardSessionManagement());

    // Session starten und Karten auswählen, um einen aktiven Zustand zu simulieren
    await act(async () => { await result.current.startSession(); });
    act(() => { result.current.selectCard(mockCard1); });
    act(() => { result.current.selectCard(mockCard2); });

    // Sicherstellen, dass der Zustand nicht initial ist
    expect(result.current.sessionStarted).toBe(true);
    expect(result.current.drawnCards).toHaveLength(2);
    expect(result.current.currentRound).toBe(2);
    expect(result.current.predeterminedCards).toEqual(mockPredeterminedCards);

    // Dismiss aufrufen
    act(() => {
      result.current.dismissSummary();
    });

    // Prüfen, ob alles auf den Initialzustand zurückgesetzt wurde
    expect(result.current.sessionStarted).toBe(false);
    expect(result.current.loading).toBe(false); // Sollte auch zurückgesetzt werden
    expect(result.current.error).toBeNull();
    expect(result.current.drawnCards).toEqual([]);
    expect(result.current.currentRound).toBe(0);
    expect(result.current.predeterminedCards).toEqual([]); // Sollte auch geleert werden
  });

});
