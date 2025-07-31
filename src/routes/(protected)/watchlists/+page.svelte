<script lang="ts">
  import { onMount } from 'svelte';
  import { watchlistStore } from '$lib/stores/watchlist.svelte.ts';
	import type { Watchlist } from '$lib/types/Watchlist';
	import { goto } from '$app/navigation';

  onMount(() => {
    watchlistStore.fetchWatchlists();
  });

  const handleViewWatchlist = (watchlist: Watchlist) => {
    goto(`/watchlists/${watchlist.name}`);
  };
</script>

<div class="space-y-6">
  <div>
    <h2 class="text-lg font-medium text-gray-900">Your Watchlists</h2>
    <p class="mt-1 text-sm text-gray-600">
      Manage and view your investment watchlists
    </p>
  </div>

  {#if watchlistStore.isLoading}
    <div class="flex items-center justify-center py-12">
      <div class="flex items-center space-x-2">
        <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        <span class="text-sm text-gray-600">Loading watchlists...</span>
      </div>
    </div>
  {:else if watchlistStore.error}
    <div class="rounded-md bg-red-50 p-4">
      <div class="flex">
        <div class="ml-3">
          <h3 class="text-sm font-medium text-red-800">Error loading watchlists</h3>
          <div class="mt-2 text-sm text-red-700">
            <p>{watchlistStore.error}</p>
          </div>
          <div class="mt-4">
            <button
              onclick={() => watchlistStore.fetchWatchlists()}
              class="text-sm font-medium text-red-800 hover:text-red-700"
            >
              Try again
            </button>
          </div>
        </div>
      </div>
    </div>
  {:else if watchlistStore.watchlists.length === 0}
    <div class="text-center py-12">
      <h3 class="mt-2 text-sm font-medium text-gray-900">No watchlists</h3>
      <p class="mt-1 text-sm text-gray-500">
        Get started by creating your first watchlist.
      </p>
    </div>
  {:else}
    <div class="bg-white shadow overflow-hidden sm:rounded-md">
      <ul role="list" class="divide-y divide-gray-200">
        {#each watchlistStore.watchlists as watchlist}
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
                    onclick={() => handleViewWatchlist(watchlist)}
                  >
                    View
                  </button>
                </div>
              </div>
            </div>
          </li>
        {/each}
      </ul>
    </div>
  {/if}
</div>
