import Bugsnag, { Config } from '@bugsnag/expo';
import type { Event } from '@bugsnag/expo';
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
const createBugsnagServiceInternal = (): BugsnagService & { init: () => void } => {
  let bugsnagStarted = false;
  let internalBugsnagInstance: typeof Bugsnag | null = null;

  const init = () => {
    if (bugsnagStarted) {
        console.log("Bugsnag already started.");
        return;
    }
    try {
      console.log("Initializing Bugsnag...");
      const bugsnagConfig: Config = {
        apiKey: process.env.EXPO_PUBLIC_BUGSNAG_API_KEY || '',
        releaseStage: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
        enabledReleaseStages: ['production', 'staging', 'development'],
        appVersion: process.env.EXPO_PUBLIC_APP_VERSION,
        maxBreadcrumbs: 50,
        // autoTrackSessions: true // Kann hier oder später konfiguriert werden
      };
      Bugsnag.start(bugsnagConfig); // Start erfolgt jetzt hier!
      internalBugsnagInstance = Bugsnag; // Speichere die Instanz für spätere Aufrufe
      bugsnagStarted = true;
      console.log("Bugsnag initialized successfully.");
    } catch (error: unknown) {
      console.error(
        'Failed to initialize Bugsnag:',
        error instanceof Error ? error.message : String(error)
      );
      bugsnagStarted = false;
      internalBugsnagInstance = null;
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
    init, // Füge die init-Methode hinzu
    notify: (error: Error | string, metadata?: BugsnagMetadata): unknown => {
      if (!internalBugsnagInstance) return fallbackNotify(error);
      const errorObj = typeof error === 'string' ? new Error(error) : error;
      return internalBugsnagInstance.notify(errorObj, (event: Event) => {
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
      if (!internalBugsnagInstance) return fallbackLeaveBreadcrumb(message, metadata);
      internalBugsnagInstance.leaveBreadcrumb(message, prepareBugsnagMetadata(metadata));
    },
    setUser: (id?: string, name?: string, email?: string): void => {
      if (!internalBugsnagInstance) return fallbackSetUser(id, name, email);
      internalBugsnagInstance.setUser(id, name, email);
    },
    isStarted: (): boolean => bugsnagStarted
  };
};

/**
 * Typsicherer Bugsnag-Service für die gesamte Anwendung.
 * WICHTIG: `bugsnagService.init()` muss im App-Einstiegspunkt aufgerufen werden!
 */
export const bugsnagService = createBugsnagServiceInternal(); // Erstellt das Service-Objekt, startet aber nicht