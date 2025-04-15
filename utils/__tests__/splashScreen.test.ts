import * as SplashScreen from 'expo-splash-screen';
import { bugsnagService } from '../../services/bugsnag'; 
import { initializeSplashScreen } from '../splashScreen';

// Mock expo-splash-screen
jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
}));

// Mock bugsnagService
jest.mock('../../services/bugsnag', () => ({ // Pfad ggf. anpassen
  bugsnagService: {
    notify: jest.fn(),
  },
}));

// Typed Mocks
const mockPreventAutoHideAsync = SplashScreen.preventAutoHideAsync as jest.Mock;
const mockBugsnagNotify = bugsnagService.notify as jest.Mock;

describe('initializeSplashScreen', () => {
  beforeEach(() => {
    // Reset mocks before each test
    mockPreventAutoHideAsync.mockClear();
    mockBugsnagNotify.mockClear();
  });

  it('should call SplashScreen.preventAutoHideAsync on success', () => {
    mockPreventAutoHideAsync.mockResolvedValueOnce(undefined); 

    initializeSplashScreen();

    expect(mockPreventAutoHideAsync).toHaveBeenCalledTimes(1);
    expect(mockBugsnagNotify).not.toHaveBeenCalled();
  });

  it('should call bugsnagService.notify if preventAutoHideAsync rejects', async () => {
    const rejectionError = new Error('Async hide prevention failed');
    mockPreventAutoHideAsync.mockRejectedValueOnce(rejectionError);

    initializeSplashScreen();

    await new Promise(process.nextTick);

    expect(mockPreventAutoHideAsync).toHaveBeenCalledTimes(1);
    expect(mockBugsnagNotify).toHaveBeenCalledTimes(1);
    expect(mockBugsnagNotify).toHaveBeenCalledWith(rejectionError);
  });


  it('should call bugsnagService.notify if preventAutoHideAsync throws synchronously', () => {
    const syncError = new Error('Sync preventAutoHideAsync failed');
    mockPreventAutoHideAsync.mockImplementationOnce(() => { 
      throw syncError;
    });

    initializeSplashScreen();

    expect(mockPreventAutoHideAsync).toHaveBeenCalledTimes(1);
    expect(mockBugsnagNotify).toHaveBeenCalledTimes(1);
    expect(mockBugsnagNotify).toHaveBeenCalledWith(syncError); 
  });
});
