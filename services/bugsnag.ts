import Bugsnag, { Config } from '@bugsnag/js';
import type { Event } from '@bugsnag/js';
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

/**
 * Erstellt einen typsicheren Bugsnag-Service, der sowohl in Browser- als auch in
 * nicht-Browser-Umgebungen funktioniert, mit Fallbacks für Fehlerfälle
 */
const createBugsnagService = (): BugsnagService => {
  // Statusvariable für isStarted()-Methode
  let bugsnagStarted = false;
  
  // Prüfen, ob wir in einer Browser-Umgebung sind
  const isBrowser = typeof window !== 'undefined';
  
  if (!isBrowser) {
    // Mock-Implementierung für nicht-Browser-Umgebungen (z.B. SSR, Tests)
    return {
      notify: (error: Error | string): void => {
        console.error('[Bugsnag mock]', error);
      },
      leaveBreadcrumb: (message: string, metadata?: BugsnagMetadata): void => {
        console.log('[Bugsnag mock] Breadcrumb:', message, metadata);
      },
      setUser: (id?: string, name?: string, email?: string): void => {
        console.log('[Bugsnag mock] setUser:', { id, name, email });
      },
      isStarted: (): boolean => false
    };
  }
  
  // Browser-Implementierung mit vollständiger Fehlerbehandlung
  try {
    // ✅ Erweiterte Konfiguration mit Umgebungsvariablen
    const bugsnagConfig: Config = {
      apiKey: process.env.EXPO_PUBLIC_BUGSNAG_API_KEY || '',
      releaseStage: process.env.EXPO_PUBLIC_ENVIRONMENT || 'development',
      enabledReleaseStages: ['production', 'staging', 'development'],
      appVersion: process.env.EXPO_PUBLIC_APP_VERSION,
      // Sammle maximal 50 Breadcrumbs pro Fehler
      maxBreadcrumbs: 50
    };
    Bugsnag.start(bugsnagConfig);
    
    bugsnagStarted = true;
    
    return {
      notify: (error: Error | string, metadata?: BugsnagMetadata): unknown => {
        const errorObj = typeof error === 'string' ? new Error(error) : error;
        
        return Bugsnag.notify(errorObj, (event: Event) => {
          if (metadata) {
            const preparedMetadata = prepareBugsnagMetadata(metadata);
            
            // Bei Objekten können wir jetzt direkt die Metadaten hinzufügen
            Object.entries(preparedMetadata).forEach(([section, data]) => {
              event.addMetadata(section, data);
            });
          }
          return true;
        });
      },
      leaveBreadcrumb: (message: string, metadata?: BugsnagMetadata): void => {
        Bugsnag.leaveBreadcrumb(message, prepareBugsnagMetadata(metadata));
      },
      setUser: (id?: string, name?: string, email?: string): void => {
        Bugsnag.setUser(id, name, email);
      },
      isStarted: (): boolean => bugsnagStarted
    };
  } catch (error: unknown) {
    console.error(
      'Failed to initialize Bugsnag:',
      error instanceof Error ? error.message : String(error)
    );
    
    // Fallback-Implementierung bei Initialisierungsfehler
    return {
      notify: (error: Error | string): void => {
        console.error('[Bugsnag fallback]', error instanceof Error ? error.stack : error);
      },
      leaveBreadcrumb: (message: string, metadata?: BugsnagMetadata): void => {
        console.log('[Bugsnag fallback] Breadcrumb:', message, metadata);
      },
      setUser: (id?: string, name?: string, email?: string): void => {
        console.log('[Bugsnag fallback] setUser:', { id, name, email });
      },
      isStarted: (): boolean => false
    };
  }
};

/** 
 * Typsicherer Bugsnag-Service für die gesamte Anwendung
 * 
 * @example
 * // Fehler melden
 * bugsnagService.notify(new Error("Test-Fehler"), { 
 *   section: { key: "value" } 
 * });
 * 
 * // Breadcrumb setzen
 * bugsnagService.leaveBreadcrumb("User navigated to dashboard");
 */
export const bugsnagService = createBugsnagService();