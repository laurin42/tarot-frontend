import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDailyCard } from '../useDailyCard'; 
import { tarotApi } from '@/services/apiService';
import { bugsnagService } from '@/services/bugsnag';
import { ISelectedAndShownCard } from '@/constants/tarotCards';

// --- Mocks ---
jest.mock('@/services/apiService'); 
jest.mock('@/services/bugsnag', () => ({
  bugsnagService: { notify: jest.fn(), leaveBreadcrumb: jest.fn() },
}));

// Type assertions for mocks
const MockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;
const MockTarotApi = tarotApi as jest.Mocked<typeof tarotApi>;
const MockBugsnagService = bugsnagService as jest.Mocked<typeof bugsnagService>;

// --- Mock Data ---
const mockStoredCard: ISelectedAndShownCard = {
    id: 'stored-card',
    name: 'Stored Card',
    image: 1,
    explanation: 'Stored explanation.',
    isSelected: true, 
    showFront: true,
    onNextCard: jest.fn(),
};

const mockApiCard: ISelectedAndShownCard = {
    id: 'api-card',
    name: 'API Card',
    image: 2,
    explanation: 'API explanation.',
    isSelected: false,
    showFront: false,
    onNextCard: jest.fn(),
};

const todayString = new Date().toDateString();
const yesterdayString = new Date(Date.now() - 86400000).toDateString();

describe('useDailyCard Hook', () => {

  beforeEach(() => {
    jest.clearAllMocks();
    // Ensure AsyncStorage mock is clean using its mock methods
    // Assuming the mock from @react-native-async-storage/async-storage/jest/async-storage-mock is used
    MockAsyncStorage.clear(); 
  });

  // --- Test Initial State & useEffect ---

  it('should initialize with default values and check storage', async () => {
    MockAsyncStorage.getItem.mockResolvedValue(null); 
    const { result } = renderHook(() => useDailyCard());

    expect(result.current.card).toBeNull();
    expect(result.current.explanation).toBe('');
    expect(result.current.loading).toBe(true); 
    expect(result.current.error).toBeNull();
    expect(result.current.isDrawn).toBe(false);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(MockAsyncStorage.getItem).toHaveBeenCalledWith('dailyCardData');
    expect(result.current.card).toBeNull();
    expect(result.current.isDrawn).toBe(false);
    expect(result.current.loading).toBe(false);
  });

  it('should load card from storage if valid for today', async () => {
    const storedData = JSON.stringify({
        date: todayString,
        card: mockStoredCard,
        explanation: mockStoredCard.explanation,
    });
    MockAsyncStorage.getItem.mockResolvedValue(storedData);
    const { result } = renderHook(() => useDailyCard());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(MockAsyncStorage.getItem).toHaveBeenCalledWith('dailyCardData');

    const { onNextCard, ...expectedCardFromStorage } = mockStoredCard;
    expect(result.current.card).toEqual(expectedCardFromStorage);

    expect(result.current.explanation).toBe(mockStoredCard.explanation);
    expect(result.current.isDrawn).toBe(true);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

   it('should remove card from storage if date is not today', async () => {
      const storedData = JSON.stringify({
          date: yesterdayString, 
          card: mockStoredCard,
          explanation: mockStoredCard.explanation,
      });
      MockAsyncStorage.getItem.mockResolvedValue(storedData);
      const { result } = renderHook(() => useDailyCard());

      expect(result.current.loading).toBe(true);

      await waitFor(() => expect(result.current.loading).toBe(false));

      expect(MockAsyncStorage.getItem).toHaveBeenCalledWith('dailyCardData');
      expect(MockAsyncStorage.removeItem).toHaveBeenCalledWith('dailyCardData');
      expect(result.current.card).toBeNull(); 
      expect(result.current.isDrawn).toBe(false);
      expect(result.current.loading).toBe(false);
   });

   it('should handle errors during storage loading', async () => {
       const storageError = new Error("Failed to read storage");
       MockAsyncStorage.getItem.mockRejectedValue(storageError);
       const { result } = renderHook(() => useDailyCard());

       expect(result.current.loading).toBe(true);

       await waitFor(() => expect(result.current.loading).toBe(false));

       expect(MockAsyncStorage.getItem).toHaveBeenCalledWith('dailyCardData');
       expect(result.current.card).toBeNull();
       expect(result.current.isDrawn).toBe(false);
       expect(result.current.loading).toBe(false);
       expect(result.current.error).toBeNull(); 
       expect(MockBugsnagService.notify).toHaveBeenCalledWith(expect.any(Error));
   });


  // --- Test drawDailyCard ---

  it('drawDailyCard should fetch, update state, and save successfully', async () => {
    MockTarotApi.fetchRandomCard.mockResolvedValue(mockApiCard);
    const { result } = renderHook(() => useDailyCard());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.isDrawn).toBe(false);

    await act(async () => {
      await result.current.drawDailyCard();
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.isDrawn).toBe(true);
    expect(result.current.card).toEqual(mockApiCard);
    expect(result.current.explanation).toBe(mockApiCard.explanation);

    expect(MockTarotApi.fetchRandomCard).toHaveBeenCalledTimes(1);
    const expectedStoredData = JSON.stringify({
        date: todayString,
        card: mockApiCard,
        explanation: mockApiCard.explanation,
    });
    expect(MockAsyncStorage.setItem).toHaveBeenCalledWith('dailyCardData', expectedStoredData);
  });

  it('drawDailyCard should handle API fetch error', async () => {
      const apiError = new Error("API Failed");
      MockTarotApi.fetchRandomCard.mockRejectedValue(apiError);
      const { result } = renderHook(() => useDailyCard());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.drawDailyCard();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('Fehler beim Ziehen der Karte: API Failed');
      expect(result.current.isDrawn).toBe(false);
      expect(result.current.card).toBeNull();
      expect(result.current.explanation).toBe('');
      expect(MockAsyncStorage.setItem).not.toHaveBeenCalled(); 
      expect(MockBugsnagService.notify).toHaveBeenCalledWith(apiError);
  });

  it('drawDailyCard should handle AsyncStorage setItem error', async () => {
      MockTarotApi.fetchRandomCard.mockResolvedValue(mockApiCard);
      const storageError = new Error("Cannot write to storage");
      MockAsyncStorage.setItem.mockRejectedValue(storageError);
      const { result } = renderHook(() => useDailyCard());

      await waitFor(() => expect(result.current.loading).toBe(false));

      await act(async () => {
        await result.current.drawDailyCard();
      });

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toContain('Fehler beim Ziehen der Karte: Cannot write to storage');
      expect(result.current.isDrawn).toBe(false); 
      expect(result.current.card).toBeNull();
      expect(result.current.explanation).toBe('');
      expect(MockAsyncStorage.setItem).toHaveBeenCalledTimes(1);
      expect(MockBugsnagService.notify).toHaveBeenCalledWith(storageError);
  });

});
