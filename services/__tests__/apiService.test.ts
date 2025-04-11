import { fetchAndProcessTarotSummary, tarotApi } from '../apiService'; // Import REAL function and REAL object
import { bugsnagService } from '@/services/bugsnag';
import { storage } from '@/utils/storage';
import { ISelectedAndShownCard } from '@/constants/tarotcards';

// --- Mock ONLY external dependencies ---
// REMOVED: jest.mock('../apiService', ...)

jest.mock('@/services/bugsnag', () => ({
  bugsnagService: {
    notify: jest.fn(),
    leaveBreadcrumb: jest.fn(),
  },
}));

jest.mock('@/utils/storage', () => ({
  storage: {
    getItem: jest.fn().mockResolvedValue('fake-token'),
    setItem: jest.fn().mockResolvedValue(undefined),
    removeItem: jest.fn().mockResolvedValue(undefined),
  },
}));

// --- Mock Data ---
const mockCard1: ISelectedAndShownCard = { id: 'card-1', name: 'The Fool', image: 1, showFront: true, isSelected: true, onNextCard: jest.fn() };
const mockCards = [mockCard1];
const mockSummaryText = 'This is the summary.';

describe('fetchAndProcessTarotSummary Helper', () => {
  // --- Spy on and mock methods of the REAL tarotApi object ---
  let fetchSummarySpy: jest.SpyInstance;
  let saveSummarySpy: jest.SpyInstance;

  const mockedBugsnagNotify = bugsnagService.notify as jest.Mock;
  const mockedStorageGetItem = storage.getItem as jest.MockedFunction<typeof storage.getItem>;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    // Reset external mocks
    mockedBugsnagNotify.mockClear();
    mockedStorageGetItem.mockClear();
    originalConsoleError = console.error; // Store original console.error
    console.error = jest.fn(); // Suppress console.error

    // --- Setup spies and mock implementations ---
    fetchSummarySpy = jest.spyOn(tarotApi, 'fetchSummary');
    saveSummarySpy = jest.spyOn(tarotApi, 'saveSummaryReading');

    // Default successful mocks (can be overridden in tests)
    fetchSummarySpy.mockResolvedValue(mockSummaryText);
    saveSummarySpy.mockResolvedValue(undefined);
  });

  afterEach(() => {
    // Restore original implementations and console.error
    fetchSummarySpy.mockRestore();
    saveSummarySpy.mockRestore();
    console.error = originalConsoleError; // Restore console.error
  });

  // --- Tests using the spies ---

  it('should return empty summary and null error for empty card array', async () => {
    const result = await fetchAndProcessTarotSummary([]);
    expect(result).toEqual({ summary: '', error: null });
    expect(fetchSummarySpy).not.toHaveBeenCalled(); // Use spy
    expect(saveSummarySpy).not.toHaveBeenCalled();   // Use spy
    expect(mockedBugsnagNotify).not.toHaveBeenCalled();
  });

  it('should call fetchSummary, saveSummary, and return summary on success', async () => {
    const result = await fetchAndProcessTarotSummary(mockCards);

    expect(result).toEqual({ summary: mockSummaryText, error: null });
    expect(fetchSummarySpy).toHaveBeenCalledTimes(1);
    expect(fetchSummarySpy).toHaveBeenCalledWith(mockCards);
    expect(saveSummarySpy).toHaveBeenCalledTimes(1);
    expect(saveSummarySpy).toHaveBeenCalledWith(mockCards, mockSummaryText);
    expect(mockedBugsnagNotify).not.toHaveBeenCalled();
    expect(console.error).not.toHaveBeenCalled();
  });

  it('should return summary even if saveSummaryReading fails (fire and forget)', async () => {
    const saveError = new Error('Failed to save');
    saveSummarySpy.mockRejectedValue(saveError); // Override spy mock

    const result = await fetchAndProcessTarotSummary(mockCards);

    expect(result).toEqual({ summary: mockSummaryText, error: null });
    expect(fetchSummarySpy).toHaveBeenCalledTimes(1);
    expect(saveSummarySpy).toHaveBeenCalledTimes(1);
    expect(console.error).toHaveBeenCalledWith('Failed to save summary reading:', saveError);
    expect(mockedBugsnagNotify).toHaveBeenCalledTimes(1);
    expect(mockedBugsnagNotify).toHaveBeenCalledWith(new Error('Failed to save summary reading'));
  });

  it('should return null summary and error message if fetchSummary fails', async () => {
    const fetchError = new Error('API is down');
    fetchSummarySpy.mockRejectedValue(fetchError); // Override spy mock

    const result = await fetchAndProcessTarotSummary(mockCards);

    expect(result).toEqual({ summary: null, error: 'API is down' });
    expect(fetchSummarySpy).toHaveBeenCalledTimes(1);
    expect(saveSummarySpy).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Summary fetch/process error:', fetchError);
    expect(mockedBugsnagNotify).toHaveBeenCalledTimes(1);
    expect(mockedBugsnagNotify).toHaveBeenCalledWith(fetchError);
  });

  // Test for non-Error rejection (important given the symptoms)
  it('should handle non-Error rejection from fetchSummary', async () => {
    const fetchErrorValue = 'Something weird happened';
    fetchSummarySpy.mockRejectedValue(fetchErrorValue); // Reject with a non-Error

    const result = await fetchAndProcessTarotSummary(mockCards);

    // Expect the fallback error message
    expect(result).toEqual({ summary: null, error: 'An unknown error occurred' });
    expect(fetchSummarySpy).toHaveBeenCalledTimes(1);
    expect(saveSummarySpy).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledWith('Summary fetch/process error:', fetchErrorValue);
    expect(mockedBugsnagNotify).toHaveBeenCalledTimes(1);
    // Bugsnag should be called with a new Error wrapping the string value
    expect(mockedBugsnagNotify).toHaveBeenCalledWith(new Error(String(fetchErrorValue)));
  });


  it('should not call saveSummaryReading if fetched summary is empty or null', async () => {
    fetchSummarySpy.mockResolvedValue(''); // Override spy mock

    const result = await fetchAndProcessTarotSummary(mockCards);

    expect(result).toEqual({ summary: '', error: null });
    expect(fetchSummarySpy).toHaveBeenCalledTimes(1);
    expect(saveSummarySpy).not.toHaveBeenCalled();
    expect(mockedBugsnagNotify).not.toHaveBeenCalled();

    // --- Test with null ---
    fetchSummarySpy.mockClear(); // Clear spy calls
    saveSummarySpy.mockClear();
    (console.error as jest.Mock).mockClear();

    fetchSummarySpy.mockResolvedValue(null as any); // Override again

    const resultNull = await fetchAndProcessTarotSummary(mockCards);

    expect(resultNull).toEqual({ summary: null, error: null });
    expect(fetchSummarySpy).toHaveBeenCalledTimes(1);
    expect(saveSummarySpy).not.toHaveBeenCalled();
    expect(mockedBugsnagNotify).not.toHaveBeenCalled();
  });

});
