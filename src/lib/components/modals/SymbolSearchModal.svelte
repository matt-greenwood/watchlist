<script lang="ts">
  import Modal from './Modal.svelte';
  import SymbolSearchAutocomplete from '$lib/components/SymbolSearchAutocomplete.svelte';
  import { watchlistStore } from '$lib/stores/watchlist.svelte.ts';

  interface Props {
    show: boolean;
    watchlistName: string;
    onClose: () => void;
  }

  let { show, watchlistName, onClose }: Props = $props();
  let selectedSymbol = $state<string>('');
  let isAdding = $state(false);

  const handleSymbolSelect = (symbol: string) => {
    selectedSymbol = symbol;
  };

  const handleClose = () => {
    selectedSymbol = '';
    watchlistStore.clearError();
    onClose();
  };

  const handleAddSymbol = async () => {
    if (!selectedSymbol) return;
    
    isAdding = true;
    const success = await watchlistStore.addSymbolToWatchlist(watchlistName, selectedSymbol);
    
    if (success) {
      selectedSymbol = '';
      onClose();
    }
    
    isAdding = false;
  };
</script>

<Modal {show} onClose={handleClose}>
  <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
    <div class="sm:flex sm:items-start">
      <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
        <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
          Add Symbol to {watchlistName}
        </h3>
        <div class="mt-4">
          <SymbolSearchAutocomplete onSymbolSelect={handleSymbolSelect} onSubmit={handleAddSymbol} />
          
          {#if selectedSymbol}
            <div class="mt-3 p-3 bg-blue-50 rounded-lg">
              <p class="text-sm">
                Selected: <span class="font-medium">{selectedSymbol}</span>
              </p>
            </div>
          {/if}
          
          {#if watchlistStore.error}
            <div class="mt-3 p-3 bg-red-50 rounded-lg">
              <p class="text-sm text-red-600">
                {watchlistStore.error}
              </p>
            </div>
          {/if}
        </div>
      </div>
    </div>
  </div>
  
  <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
    <button
      type="button"
      onclick={handleAddSymbol}
      class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
      disabled={!selectedSymbol || isAdding}
    >
      {#if isAdding}
        Adding...
      {:else}
        Add Symbol
      {/if}
    </button>
    <button
      type="button"
      class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
      onclick={handleClose}
      disabled={isAdding}
    >
      Cancel
    </button>
  </div>
</Modal>