<script lang="ts">
  import { onMount } from 'svelte';
  import { auth } from '$lib/stores/auth.svelte.ts';
  import { watchlistStore } from '$lib/stores/watchlist.svelte.ts';

  onMount(() => {
    watchlistStore.fetchWatchlists();
  });
</script>

<div class="min-h-screen bg-gray-50">
  <header class="bg-white shadow-sm">
    <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">Watchlists</h1>
        <button
          onclick={() => auth.logout()}
          class="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
        >
          Sign out
        </button>
      </div>
    </div>
  </header>
  
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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
          <div class="mt-6">
            <button
              type="button"
              class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              <svg class="-ml-0.5 mr-1.5 h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
              </svg>
              Create watchlist
            </button>
          </div>
        </div>
      {:else}
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul role="list" class="divide-y divide-gray-200">
            {#each watchlistStore.watchlists as watchlist}
              <li>
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <div class="flex items-center">
                      <div class="flex-shrink-0">
                        <div class="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <svg class="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9 12h3.75M9 15h3.75M9 18h3.75m3-6h3m-6 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div class="ml-4">
                        <div class="text-sm font-medium text-gray-900">{watchlist.name}</div>
                        <div class="text-sm text-gray-500">
                          {watchlist.watchlistEntries.length} symbol{watchlist.watchlistEntries.length !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2">
                      <button
                        type="button"
                        class="text-sm font-medium text-blue-600 hover:text-blue-500"
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
  </main>
</div>