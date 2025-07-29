import { PUBLIC_TASTYTRADE_API_URL } from '$env/static/public';
import { auth } from './auth.svelte.ts';
import type { Watchlist } from '$lib/types/Watchlist.ts';

class WatchlistStore {
  watchlists = $state<Watchlist[]>([]);
  isLoading = $state(false);
  error = $state<string | null>(null);

  async fetchWatchlists() {
    if (!auth.isAuthenticated) {
      this.error = 'Not authenticated';
      return;
    }

    this.isLoading = true;
    this.error = null;

    try {
      const response = await auth.authenticatedFetch(`${PUBLIC_TASTYTRADE_API_URL}/watchlists`);

      if (!response.ok) {
        throw new Error(`Failed to fetch watchlists: ${response.status}`);
      }

      const data = await response.json();
      
      // Transform API response from kebab-case to camelCase
      const rawWatchlists = data.data?.items || [];
      this.watchlists = rawWatchlists.map((watchlist: any) => ({
        name: watchlist.name,
        watchlistEntries: watchlist['watchlist-entries']?.map((entry: any) => ({
          symbol: entry.symbol,
          instrumentType: entry['instrument-type']
        })) || []
      }));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch watchlists';
      this.error = errorMessage;
      console.error('Error fetching watchlists:', err);
    } finally {
      this.isLoading = false;
    }
  }

  clearError() {
    this.error = null;
  }
}

export const watchlistStore = new WatchlistStore();