import { PUBLIC_TASTYTRADE_API_URL } from '$env/static/public';
import { auth } from './auth.svelte.ts';
import type { Watchlist } from '$lib/types/Watchlist.ts';
import type { SymbolSearchResult } from '$lib/types/SymbolSearchResult.ts';

class WatchlistStore {
  watchlists = $state<Watchlist[]>([]);
  isLoading = $state(false);
  isCreating = $state(false);
  isDeleting = $state(false);
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

  async createWatchlist(name: string) {
    if (!auth.isAuthenticated) {
      this.error = 'Not authenticated';
      return false;
    }

    if (!name.trim()) {
      this.error = 'Watchlist name is required';
      return false;
    }

    this.isCreating = true;
    this.error = null;

    try {
      const response = await auth.authenticatedFetch(`${PUBLIC_TASTYTRADE_API_URL}/watchlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name.trim(),
          "watchlist-entries": []
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to create watchlist: ${response.status}`);
      }

      await this.fetchWatchlists();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create watchlist';
      this.error = errorMessage;
      console.error('Error creating watchlist:', err);
      return false;
    } finally {
      this.isCreating = false;
    }
  }

  async deleteWatchlist(name: string) {
    if (!auth.isAuthenticated) {
      this.error = 'Not authenticated';
      return false;
    }

    if (!name.trim()) {
      this.error = 'Watchlist name is required';
      return false;
    }

    this.isDeleting = true;
    this.error = null;

    try {
      const response = await auth.authenticatedFetch(`${PUBLIC_TASTYTRADE_API_URL}/watchlists/${encodeURIComponent(name.trim())}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `Failed to delete watchlist: ${response.status}`);
      }

      this.watchlists = this.watchlists.filter(w => w.name !== name);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete watchlist';
      this.error = errorMessage;
      console.error('Error deleting watchlist:', err);
      return false;
    } finally {
      this.isDeleting = false;
    }
  }

  async searchSymbols(query: string): Promise<SymbolSearchResult[]> {
    if (!query.trim() || query.length < 1) {
      return [];
    }

    if (!auth.isAuthenticated) {
      this.error = 'Not authenticated';
      return [];
    }

    try {
      const response = await auth.authenticatedFetch(
        `${PUBLIC_TASTYTRADE_API_URL}/symbols/search/${encodeURIComponent(query.trim())}`
      );

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      const rawResults = data.data?.items || [];
      
      // Transform API response 
      return rawResults.map((result: any) => ({
        symbol: result.symbol,
        description: result.description
      }));
    } catch (err) {
      console.error('Error searching symbols:', err);
      this.error = err instanceof Error ? err.message : 'Failed to search symbols';
      return [];
    }
  }

  clearError() {
    this.error = null;
  }
}

export const watchlistStore = new WatchlistStore();