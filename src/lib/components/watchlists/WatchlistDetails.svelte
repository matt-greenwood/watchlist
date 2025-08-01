<script lang="ts">
  import { onMount } from 'svelte';
  import { watchlistStore } from '$lib/stores/watchlist.svelte';
  import { goto } from '$app/navigation';
  import DeleteWatchlistConfirmationModal from '$lib/components/modals/DeleteWatchlistConfirmationModal.svelte';
  import RemoveSymbolConfirmationModal from '$lib/components/modals/RemoveSymbolConfirmationModal.svelte';
  import SymbolSearchModal from '$lib/components/modals/SymbolSearchModal.svelte';
  import MarketDataTable from './MarketDataTable.svelte';

  interface Props {
    watchlistName: string;
  }

  let { watchlistName }: Props = $props();
  let showDeleteModal = $state(false);
  let showAddSymbolModal = $state(false);
  let showRemoveSymbolModal = $state(false);
  let symbolToRemove = $state('');
  
  // Fetch watchlists on mount to ensure data is available
  onMount(() => {
    if (watchlistStore.watchlists.length === 0) {
      watchlistStore.fetchWatchlists();
    }
  });
  
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

  // Get symbols list for the table
  const symbols = $derived(currentWatchlist?.watchlistEntries?.map(entry => entry.symbol) || []);
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
    
    {#if symbols.length > 0}
      <MarketDataTable {symbols} onRemove={handleRemoveSymbolClick} />
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