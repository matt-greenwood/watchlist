<script lang="ts">
  import { watchlistStore } from '$lib/stores/watchlist.svelte';
  import { goto } from '$app/navigation';
  import DeleteWatchlistConfirmationModal from '$lib/components/modals/DeleteWatchlistConfirmationModal.svelte';
  import RemoveSymbolConfirmationModal from '$lib/components/modals/RemoveSymbolConfirmationModal.svelte';
  import SymbolSearchModal from '$lib/components/modals/SymbolSearchModal.svelte';
  import type { MarketData } from '$lib/types/MarketData';

  interface Props {
    watchlistName: string;
  }

  let { watchlistName }: Props = $props();
  let showDeleteModal = $state(false);
  let showAddSymbolModal = $state(false);
  let showRemoveSymbolModal = $state(false);
  let symbolToRemove = $state('');
  let marketDataMap = $state(new Map<string, MarketData>());
  
  // Get the current watchlist data
  const currentWatchlist = $derived(watchlistStore.watchlists.find(w => w.name === watchlistName));

  const handleAddSymbolClick = () => {
    showAddSymbolModal = true;
  };

  const handleAddSymbolClose = () => {
    showAddSymbolModal = false;
  };

  const handleDeleteClick = () => {
    showDeleteModal = true;
  };

  const handleDeleteConfirm = async () => {
    const success = await watchlistStore.deleteWatchlist(watchlistName);
    if (success) {
      showDeleteModal = false;
      goto('/watchlists');
    }
  };

  const handleDeleteCancel = () => {
    showDeleteModal = false;
  };

  const handleRemoveSymbolClick = (symbol: string) => {
    symbolToRemove = symbol;
    showRemoveSymbolModal = true;
  };

  const handleRemoveSymbolConfirm = async () => {
    const success = await watchlistStore.removeSymbolFromWatchlist(watchlistName, symbolToRemove);
    if (success) {
      showRemoveSymbolModal = false;
      symbolToRemove = '';
    }
  };

  const handleRemoveSymbolCancel = () => {
    showRemoveSymbolModal = false;
    symbolToRemove = '';
  };

  const loadMarketData = async () => {
    if (!currentWatchlist?.watchlistEntries) return;
    
    const newMarketDataMap = new Map<string, MarketData>();
    
    for (const entry of currentWatchlist.watchlistEntries) {
      const marketData = await watchlistStore.fetchMarketData(entry.symbol);
      if (marketData) {
        newMarketDataMap.set(entry.symbol, marketData);
      }
    }
    
    marketDataMap = newMarketDataMap;
  };

  $effect(() => {
    if (currentWatchlist?.watchlistEntries) {
      loadMarketData();
    }
  });
</script>

<div class="bg-white shadow">
  <div class="px-4 py-5 sm:px-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium leading-6 text-gray-900">{watchlistName}</h3>
      </div>
      <div class="flex gap-3">
        <button
          type="button"
          class="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          onclick={handleAddSymbolClick}
        >
          Add Symbol
        </button>
        <button
          type="button"
          class="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
          onclick={handleDeleteClick}
        >
          Delete Watchlist
        </button>
      </div>
    </div>
  </div>
</div>

<!-- Symbols Table -->
<div class="mt-6 bg-white shadow">
  <div class="px-4 py-5 sm:p-6">
    <h4 class="text-base font-medium text-gray-900 mb-4">Symbols</h4>
    
    {#if currentWatchlist?.watchlistEntries && currentWatchlist.watchlistEntries.length > 0}
      <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
        <table class="min-w-full divide-y divide-gray-300">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock Symbol
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Bid Price
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Ask Price
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Price
              </th>
              <th scope="col" class="relative px-6 py-3">
                <span class="sr-only">Remove</span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            {#each currentWatchlist.watchlistEntries as entry}
              {@const marketData = marketDataMap.get(entry.symbol)}
              <tr>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {entry.symbol}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {marketData?.bidPrice ?? 'Loading...'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {marketData?.askPrice ?? 'Loading...'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {marketData?.lastPrice ?? 'Loading...'}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    type="button"
                    class="text-red-600 hover:text-red-900 cursor-pointer"
                    onclick={() => handleRemoveSymbolClick(entry.symbol)}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {:else}
      <div class="text-center py-8">
        <p class="text-gray-500 text-sm">No symbols in this watchlist yet.</p>
        <p class="text-gray-400 text-xs mt-1">Click "Add Symbol" to get started.</p>
      </div>
    {/if}
  </div>
</div>

<DeleteWatchlistConfirmationModal
  show={showDeleteModal}
  {watchlistName}
  onConfirm={handleDeleteConfirm}
  onCancel={handleDeleteCancel}
  isDeleting={watchlistStore.isDeleting}
/>

<RemoveSymbolConfirmationModal
  show={showRemoveSymbolModal}
  symbol={symbolToRemove}
  {watchlistName}
  onConfirm={handleRemoveSymbolConfirm}
  onCancel={handleRemoveSymbolCancel}
/>

<SymbolSearchModal
  show={showAddSymbolModal}
  {watchlistName}
  onClose={handleAddSymbolClose}
/>