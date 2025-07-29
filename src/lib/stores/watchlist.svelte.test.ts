import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { watchlistStore } from './watchlist.svelte.ts';

// Mock the auth store
const mockAuth = {
  isAuthenticated: true,
  authenticatedFetch: vi.fn()
};

vi.mock('./auth.svelte.ts', () => ({
  auth: mockAuth
}));

vi.mock('$env/static/public', () => ({
  PUBLIC_TASTYTRADE_API_URL: 'https://api.test.com'
}));

describe('WatchlistStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    watchlistStore.watchlists = [];
    watchlistStore.isLoading = false;
    watchlistStore.error = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should start with empty state', () => {
      expect(watchlistStore.watchlists).toEqual([]);
      expect(watchlistStore.isLoading).toBe(false);
      expect(watchlistStore.error).toBe(null);
    });
  });

  describe('fetchWatchlists', () => {
    it('should successfully fetch and transform watchlists', async () => {
      const mockApiResponse = {
        data: {
          items: [
            {
              name: 'My First Watchlist',
              'watchlist-entries': [
                {
                  symbol: 'AAPL',
                  'instrument-type': 'Equity'
                },
                {
                  symbol: 'GOOGL', 
                  'instrument-type': 'Equity'
                }
              ]
            },
            {
              name: 'Tech Stocks',
              'watchlist-entries': [
                {
                  symbol: 'MSFT',
                  'instrument-type': 'Equity'
                }
              ]
            }
          ]
        }
      };

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      };
      mockAuth.authenticatedFetch.mockResolvedValue(mockResponse);

      await watchlistStore.fetchWatchlists();

      expect(mockAuth.authenticatedFetch).toHaveBeenCalledWith('https://api.test.com/watchlists');
      expect(watchlistStore.isLoading).toBe(false);
      expect(watchlistStore.error).toBe(null);
      expect(watchlistStore.watchlists).toEqual([
        {
          name: 'My First Watchlist',
          watchlistEntries: [
            { symbol: 'AAPL', instrumentType: 'Equity' },
            { symbol: 'GOOGL', instrumentType: 'Equity' }
          ]
        },
        {
          name: 'Tech Stocks',
          watchlistEntries: [
            { symbol: 'MSFT', instrumentType: 'Equity' }
          ]
        }
      ]);
    });

    it('should handle empty watchlists response', async () => {
      const mockApiResponse = {
        data: {
          items: []
        }
      };

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      };
      mockAuth.authenticatedFetch.mockResolvedValue(mockResponse);

      await watchlistStore.fetchWatchlists();

      expect(watchlistStore.watchlists).toEqual([]);
      expect(watchlistStore.isLoading).toBe(false);
      expect(watchlistStore.error).toBe(null);
    });

    it('should handle missing data in response', async () => {
      const mockApiResponse = {};

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      };
      mockAuth.authenticatedFetch.mockResolvedValue(mockResponse);

      await watchlistStore.fetchWatchlists();

      expect(watchlistStore.watchlists).toEqual([]);
      expect(watchlistStore.error).toBe(null);
    });

    it('should set loading state during fetch', async () => {
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });

      mockAuth.authenticatedFetch.mockReturnValue(mockPromise);

      const fetchPromise = watchlistStore.fetchWatchlists();

      expect(watchlistStore.isLoading).toBe(true);

      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({ data: { items: [] } })
      });

      await fetchPromise;

      expect(watchlistStore.isLoading).toBe(false);
    });

    it('should handle API errors', async () => {
      const mockResponse = {
        ok: false,
        status: 500
      };
      mockAuth.authenticatedFetch.mockResolvedValue(mockResponse);

      await watchlistStore.fetchWatchlists();

      expect(watchlistStore.error).toBe('Failed to fetch watchlists: 500');
      expect(watchlistStore.watchlists).toEqual([]);
      expect(watchlistStore.isLoading).toBe(false);
    });

    it('should handle network errors', async () => {
      mockAuth.authenticatedFetch.mockRejectedValue(new Error('Network error'));

      await watchlistStore.fetchWatchlists();

      expect(watchlistStore.error).toBe('Network error');
      expect(watchlistStore.watchlists).toEqual([]);
      expect(watchlistStore.isLoading).toBe(false);
    });

    it('should not fetch when user is not authenticated', async () => {
      mockAuth.isAuthenticated = false;

      await watchlistStore.fetchWatchlists();

      expect(mockAuth.authenticatedFetch).not.toHaveBeenCalled();
      expect(watchlistStore.error).toBe('Not authenticated');
      expect(watchlistStore.isLoading).toBe(false);
    });

    it('should handle watchlists with no entries', async () => {
      const mockApiResponse = {
        data: {
          items: [
            {
              name: 'Empty Watchlist',
              'watchlist-entries': []
            },
            {
              name: 'Another Empty',
              // Missing watchlist-entries entirely
            }
          ]
        }
      };

      const mockResponse = {
        ok: true,
        json: () => Promise.resolve(mockApiResponse)
      };
      mockAuth.authenticatedFetch.mockResolvedValue(mockResponse);

      await watchlistStore.fetchWatchlists();

      expect(watchlistStore.watchlists).toEqual([
        {
          name: 'Empty Watchlist',
          watchlistEntries: []
        },
        {
          name: 'Another Empty',
          watchlistEntries: []
        }
      ]);
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      watchlistStore.error = 'Some error';

      watchlistStore.clearError();

      expect(watchlistStore.error).toBe(null);
    });
  });
});