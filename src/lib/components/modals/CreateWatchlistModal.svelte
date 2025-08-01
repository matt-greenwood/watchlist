<script lang="ts">
  import { watchlistStore } from '$lib/stores/watchlist.svelte.ts';
  import Modal from './Modal.svelte';

  interface Props {
    show: boolean;
    onClose: () => void;
  }

  let { show, onClose }: Props = $props();
  let newWatchlistName = $state('');

  async function handleCreateWatchlist() {
    const success = await watchlistStore.createWatchlist(newWatchlistName);
    if (success) {
      newWatchlistName = '';
      onClose();
    }
  }

  function handleClose() {
    newWatchlistName = '';
    onClose();
  }

  function handleSubmit(e: Event) {
    e.preventDefault();
    handleCreateWatchlist();
  }

  $effect(() => {
    if (show) {
      watchlistStore.clearError();
      newWatchlistName = '';
    }
  });
</script>

<Modal {show} onClose={handleClose}>
  <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
    <div class="sm:flex sm:items-start">
      <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
        <h3 class="text-base font-semibold leading-6 text-gray-900">Create New Watchlist</h3>
        <div class="mt-4">
          <form onsubmit={handleSubmit}>
            <label for="watchlist-name" class="block text-sm font-medium leading-6 text-gray-900">Name</label>
            <div class="mt-2">
              <input
                type="text"
                id="watchlist-name"
                bind:value={newWatchlistName}
                class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                placeholder="Enter watchlist name"
                required
              />
            </div>
            {#if watchlistStore.error}
              <div class="mt-2 text-sm text-red-600">
                {watchlistStore.error}
              </div>
            {/if}
          </form>
        </div>
      </div>
    </div>
  </div>
  <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
    <button
      type="button"
      onclick={handleCreateWatchlist}
      disabled={watchlistStore.isCreating || !newWatchlistName.trim()}
      class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {#if watchlistStore.isCreating}
        Creating...
      {:else}
        Create
      {/if}
    </button>
    <button
      type="button"
      onclick={handleClose}
      disabled={watchlistStore.isCreating}
      class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
    >
      Cancel
    </button>
  </div>
</Modal>