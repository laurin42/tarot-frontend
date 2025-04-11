import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useTarotSummary } from '../useTarotSummary';
import { fetchAndProcessTarotSummary } from '@/services/apiService';
import { ISelectedAndShownCard } from '@/constants/tarotcards';
import { bugsnagService } from '@/services/bugsnag';

// --- Mock ONLY the service module containing the helper ---
jest.mock('@/services/apiService', () => ({
  fetchAndProcessTarotSummary: jest.fn(), // Mock ONLY the helper function
}));

// --- Mock the bugsnag service ---
jest.mock('@/services/bugsnag', () => ({
  bugsnagService: {
    notify: jest.fn(),
    leaveBreadcrumb: jest.fn(),
    // Add other methods if your hook uses them
  },
}));

// --- Mock Data ---
const mockCard1: ISelectedAndShownCard = {
  id: 'card-1',
  name: 'The Fool',
  image: 1,
  showFront: true,
  isSelected: true,
  onNextCard: jest.fn(),
};
const mockCard2: ISelectedAndShownCard = {
  id: 'card-2',
  name: 'Ace of Wands',
  image: 2,
  showFront: true,
  isSelected: true,
  onNextCard: jest.fn(),
};
const mockCards1 = [mockCard1];
const mockCards2 = [mockCard1, mockCard2];

// Define initialCards here for broader scope
const initialCards = [mockCard1];

// --- Test Suite for the HOOK ---
describe('useTarotSummary Hook', () => {
  // Get a typed reference to the correctly mocked helper from the service module
  const mockedFetchHelper = fetchAndProcessTarotSummary as jest.MockedFunction<typeof fetchAndProcessTarotSummary>;
  const mockedBugsnagNotify = bugsnagService.notify as jest.Mock;
  let originalConsoleError: typeof console.error;

  beforeEach(() => {
    mockedFetchHelper.mockClear();
    mockedBugsnagNotify.mockClear();
    originalConsoleError = console.error;
    console.error = jest.fn();
    // Wichtig: Im beforeEach KEINE default mock implementation mehr,
    // da wir sie spezifisch pro Test setzen wollen.
  });

  afterEach(() => {
    console.error = originalConsoleError;
  });

  it('should be loading initially and fetch summary successfully', async () => {
    const mockResult = { summary: 'Successful Summary', error: null };
    mockedFetchHelper.mockResolvedValue(mockResult);

    const { result } = renderHook(() => useTarotSummary(mockCards1));
    expect(result.current.loading).toBe(true);

    // Wait specifically for loading to become false
    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 3000 });

    // Assert final state AFTER loading is false
    expect(result.current.summary).toBe(mockResult.summary);
    expect(result.current.error).toBe(mockResult.error);
    expect(mockedFetchHelper).toHaveBeenCalledTimes(1);
    expect(mockedFetchHelper).toHaveBeenCalledWith(mockCards1);
    expect(mockedBugsnagNotify).not.toHaveBeenCalled();
  });

  it('should handle helper function resolving with an error', async () => {
    const mockResultError = { summary: null, error: 'API Error Message' };
    mockedFetchHelper.mockResolvedValue(mockResultError);

    const { result } = renderHook(() => useTarotSummary(mockCards2));
    expect(result.current.loading).toBe(true);

    // Wait specifically for loading to become false
    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 3000 });

    // Assert final state AFTER loading is false
    expect(result.current.summary).toBe(mockResultError.summary);
    expect(result.current.error).toBe(mockResultError.error);
    expect(mockedFetchHelper).toHaveBeenCalledTimes(1);
    expect(mockedFetchHelper).toHaveBeenCalledWith(mockCards2);
    expect(mockedBugsnagNotify).not.toHaveBeenCalled();
  });

   it('should handle helper function rejecting (unexpected error)', async () => {
    const unexpectedError = new Error('Network failed or something');
    const mockPromise = Promise.reject(unexpectedError);
    mockedFetchHelper.mockReturnValue(mockPromise);

    const { result } = renderHook(() => useTarotSummary(mockCards1));
    expect(result.current.loading).toBe(true);

    // Wait specifically for loading to become false (even on rejection)
    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 3000 });

    // Assert final state AFTER loading is false
    expect(result.current.summary).toBeNull();
    expect(result.current.error).toBe('An unexpected error occurred during processing.');
    expect(mockedFetchHelper).toHaveBeenCalledTimes(1);
    expect(mockedFetchHelper).toHaveBeenCalledWith(mockCards1);
    // Check console.error and bugsnag calls from the hook's catch block
    expect(console.error).toHaveBeenCalledWith('Unexpected error in fetchAndProcessTarotSummary promise:', unexpectedError);
    expect(mockedBugsnagNotify).toHaveBeenCalledTimes(1);
    expect(mockedBugsnagNotify).toHaveBeenCalledWith(new Error('Unexpected error in fetchAndProcessTarotSummary promise'));
  });

  it('should handle empty card array correctly (still calls fetch)', async () => {
     const mockResultEmpty = { summary: '', error: null };
     mockedFetchHelper.mockResolvedValue(mockResultEmpty);

     const { result } = renderHook(() => useTarotSummary([]));
     expect(result.current.loading).toBe(true);

     // Wait specifically for loading to become false
     await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 3000 });

     // Assert final state AFTER loading is false
     expect(result.current.summary).toBe(mockResultEmpty.summary);
     expect(result.current.error).toBe(mockResultEmpty.error);
     expect(mockedFetchHelper).toHaveBeenCalledTimes(1);
     expect(mockedFetchHelper).toHaveBeenCalledWith([]);
     expect(mockedBugsnagNotify).not.toHaveBeenCalled();
   });


  it('should re-call helper when drawnCards array changes', async () => {
    const mockResult1 = { summary: 'Summary 1', error: null };
    const mockResult2 = { summary: 'Summary 2', error: null };

    // Mock first call
    const mockPromise1 = Promise.resolve(mockResult1);
    mockedFetchHelper.mockReturnValueOnce(mockPromise1);

    const { result, rerender } = renderHook(({ cards }) => useTarotSummary(cards), {
      initialProps: { cards: initialCards },
    });
    expect(result.current.loading).toBe(true); // Initial render

    // Wait for first call to complete (loading becomes false)
    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 3000 });

    // Assert after first call
    expect(result.current.summary).toBe(mockResult1.summary);
    expect(mockedFetchHelper).toHaveBeenCalledTimes(1);

    // Mock second call
    mockedFetchHelper.mockClear();
    const mockPromise2 = Promise.resolve(mockResult2);
    mockedFetchHelper.mockReturnValue(mockPromise2); // Return promise for second call
    const newCards = [...initialCards, mockCard2];

    // Rerender - this triggers the effect
    act(() => {
        rerender({ cards: newCards });
    });
    // Immediately after rerender, effect runs, sets loading true
    expect(result.current.loading).toBe(true);
    // The mock should have been called by now
    expect(mockedFetchHelper).toHaveBeenCalledTimes(1);
    expect(mockedFetchHelper).toHaveBeenCalledWith(newCards);

    // Wait for the second call to complete (loading becomes false again)
    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 3000 });

    // Assert final state after second call
    expect(result.current.summary).toBe(mockResult2.summary);
    expect(result.current.error).toBe(mockResult2.error);
    expect(mockedBugsnagNotify).not.toHaveBeenCalled();
  });

  it('should not fetch if cards array reference is the same but content changed (potential issue)', async () => {
    const mockResultInitial = { summary: 'Initial', error: null };
    const mockPromiseInitial = Promise.resolve(mockResultInitial);
    mockedFetchHelper.mockReturnValueOnce(mockPromiseInitial);

    const mutableCards = [...initialCards];
    const { result, rerender } = renderHook(
      ({ cards }) => useTarotSummary(cards),
      { initialProps: { cards: mutableCards } }
    );

    // Wait for initial load
    await waitFor(() => expect(result.current.loading).toBe(false), { timeout: 3000 });

    expect(result.current.summary).toBe('Initial');
    expect(mockedFetchHelper).toHaveBeenCalledTimes(1);

    mockedFetchHelper.mockClear();

    act(() => {
        mutableCards.push({ id: 'card-new', name: 'New Card', image: 99, showFront: true, isSelected: true, onNextCard: jest.fn() });
        rerender({ cards: mutableCards });
    });

    // Use a minimal timer flush wrapped in act to ensure React processes the rerender,
    // but don't wait for promises that shouldn't exist.
    await act(async () => { await new Promise(setImmediate); });

    // Assert that no new fetch happened and state is unchanged
    expect(mockedFetchHelper).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false); // Should still be false
    expect(result.current.summary).toBe('Initial');
  });

});

// --- TODO: Add separate describe block for fetchAndProcessTarotSummary helper ---
// describe('fetchAndProcessTarotSummary Helper', () => {
//   // Mock tarotApi and bugsnagService here
//   // Mock dependencies of the helper function (e.g., the actual tarotApi call)
//   it('should call tarotApi.fetchSummary and return summary', ...);
//   it('should handle fetch error and return error message', ...);
//   it('should call saveSummaryReading if summary is present', ...);
//   it('should not call saveSummaryReading if summary is empty', ...);
//   it('should return empty summary for empty card array', ...);
// }); 