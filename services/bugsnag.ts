import type { Event, Config } from '@bugsnag/expo';
import { Platform } from 'react-native';
// Importiere die gemeinsamen Typen
import type { BugsnagService, BugsnagMetadata } from '../types/bugsnag.types';

// Hilfsfunktion zum sicheren Konvertieren der Metadaten für Bugsnag
const prepareBugsnagMetadata = (metadata: BugsnagMetadata | undefined): Record<string, any> => {
  if (metadata === undefined) {
    return {};
  }
  
  if (typeof metadata !== 'object' || metadata === null) {
    return { value: metadata };
  }
  
  // Rekursive Konvertierung von unknown zu any für Bugsnag-Kompatibilität
  return Object.entries(metadata).reduce((result, [key, value]) => {
    result[key] = value;
    return result;
  }, {} as Record<string, any>);
};

// Factory-Funktion, die den Service *erstellt*, aber nicht sofort startet
const createBugsnagServiceInternal = (): BugsnagService & { init: () => Promise<void> } => {
  let bugsnagStarted = false;
  let internalBugsnagModule: { default: { start: (config: Config) => void; notify: (...args: any[]) => any; leaveBreadcrumb: (...args: any[]) => any; setUser: (...args: any[]) => any; } } | null = null;

  const init = async (): Promise<void> => {
    if (bugsnagStarted) {
      console.log("Bugsnag already started.");
      return;
    }

    if (Platform.OS === 'ios' || Platform.OS === 'android') {
      try {
        console.log("Dynamically importing Bugsnag for native platform...");
        const BugsnagModule = await import('@bugsnag/expo');
        internalBugsnagModule = BugsnagModule as any;

        if (internalBugsnagModule && internalBugsnagModule.default) {
          console.log("Initializing Bugsnag...");
          const bugsnagConfig: Config = {
            apiKey: process.env.EXPO_PUBLIC_BUGSNAG_API_KEY || '',
            releaseStage: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
            enabledReleaseStages: ['production', 'staging', 'development'],
            appVersion: process.env.EXPO_PUBLIC_APP_VERSION,
            maxBreadcrumbs: 50,
          };
          internalBugsnagModule.default.start(bugsnagConfig);
          bugsnagStarted = true;
          console.log("Bugsnag initialized successfully.");
        } else {
          throw new Error("Bugsnag module loaded incorrectly.");
        }
      } catch (error: unknown) {
        console.error(
          'Failed to load or initialize Bugsnag:',
          error instanceof Error ? error.message : String(error)
        );
        bugsnagStarted = false;
        internalBugsnagModule = null;
      }
    } else {
      console.log("Bugsnag import and initialization skipped for non-native platform:", Platform.OS);
      bugsnagStarted = false;
      internalBugsnagModule = null;
    }
  };

  // Fallback-Implementierung (wird verwendet, wenn init fehlschlägt oder nie aufgerufen wird)
  const fallbackNotify = (error: Error | string): void => {
      console.error('[Bugsnag fallback]', error instanceof Error ? error.stack : error);
  };
  const fallbackLeaveBreadcrumb = (message: string, metadata?: BugsnagMetadata): void => {
      console.log('[Bugsnag fallback] Breadcrumb:', message, metadata);
  };
  const fallbackSetUser = (id?: string, name?: string, email?: string): void => {
      console.log('[Bugsnag fallback] setUser:', { id, name, email });
  };


  return {
    init,
    notify: (error: Error | string, metadata?: BugsnagMetadata): unknown => {
      if (!internalBugsnagModule?.default) return fallbackNotify(error);
      const errorObj = typeof error === 'string' ? new Error(error) : error;
      return internalBugsnagModule.default.notify(errorObj, (event: Event) => {
        if (metadata) {
          const preparedMetadata = prepareBugsnagMetadata(metadata);
          Object.entries(preparedMetadata).forEach(([section, data]) => {
            event.addMetadata(section, data);
          });
        }
        return true;
      });
    },
    leaveBreadcrumb: (message: string, metadata?: BugsnagMetadata): void => {
      if (!internalBugsnagModule?.default) return fallbackLeaveBreadcrumb(message, metadata);
      internalBugsnagModule.default.leaveBreadcrumb(message, prepareBugsnagMetadata(metadata));
    },
    setUser: (id?: string, name?: string, email?: string): void => {
      if (!internalBugsnagModule?.default) return fallbackSetUser(id, name, email);
      internalBugsnagModule.default.setUser(id, name, email);
    },
    isStarted: (): boolean => bugsnagStarted
  };
};

/**
 * Typsicherer Bugsnag-Service für die gesamte Anwendung.
 * WICHTIG: `await bugsnagService.init()` muss im App-Einstiegspunkt aufgerufen werden!
 */
export const bugsnagService = createBugsnagServiceInternal();