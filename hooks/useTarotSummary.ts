import { useState, useEffect } from 'react';
import { ISelectedAndShownCard } from "@/constants/tarotcards";
import { bugsnagService } from "@/services/bugsnag"; 
import { fetchAndProcessTarotSummary } from '@/services/apiService';

// --- Helper Function for Fetching and Processing --- 
interface FetchResult {
  summary: string | null;
  error: string | null;
}

// --- The Hook --- 
export function useTarotSummary(cards: ISelectedAndShownCard[]) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates on unmounted component

    // Reset error/summary before starting fetch
    setError(null);
    setSummary(null);
    // Ensure loading is true before fetch starts (important if effect re-runs)
    setLoading(true);

    // Wrap the call in Promise.resolve to handle both sync/async returns
    Promise.resolve(fetchAndProcessTarotSummary(cards))
      .then(result => {
        // Only update state if the component is still mounted
        if (isMounted) {
            setSummary(result.summary);
            setError(result.error);
            setLoading(false); // Set loading false on success
        }
      })
      .catch(err => {
        if (isMounted) {
            console.error('Unexpected error in fetchAndProcessTarotSummary promise:', err);
            setError('An unexpected error occurred during processing.');
            setSummary(null); // Ensure summary is null on error
            setLoading(false); // Set loading false on error
            // Consider whether bugsnag notify should also be conditional
            bugsnagService.notify(new Error('Unexpected error in fetchAndProcessTarotSummary promise'));
        }
      });

    // Cleanup function to set isMounted to false when the component unmounts
    // or when the effect re-runs before the promise settles.
    return () => {
        isMounted = false;
    };

  }, [cards]); // Dependency array

  return { summary, loading, error };
}