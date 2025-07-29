import type { WatchlistEntry } from './WatchlistEntry.ts';

export interface Watchlist {
  name: string;
  watchlistEntries: WatchlistEntry[];
}