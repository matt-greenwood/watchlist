<script lang="ts">
  import type { Watchlist } from '$lib/types/Watchlist';
  import { goto } from '$app/navigation';

  export let watchlist: Watchlist;

  const handleViewWatchlist = () => {
    goto(`/watchlists/${watchlist.name}`);
  };
</script>

<li>
  <div class="px-4 py-4 sm:px-6">
    <div class="flex items-center justify-between">
      <div>
        <div class="text-sm font-medium text-gray-900">{watchlist.name}</div>
        <div class="text-sm text-gray-500">
          {watchlist.watchlistEntries.length} symbol{watchlist.watchlistEntries.length !== 1 ? 's' : ''}
        </div>
      </div>
      <div class="flex items-center space-x-2">
        <button
          type="button"
          class="text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
          onclick={handleViewWatchlist}
        >
          View
        </button>
      </div>
    </div>
  </div>
</li>