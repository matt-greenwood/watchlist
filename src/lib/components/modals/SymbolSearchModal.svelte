<script lang="ts">
  import Modal from './Modal.svelte';

  interface Props {
    show: boolean;
    watchlistName: string;
    onClose: () => void;
  }

  let { show, watchlistName, onClose }: Props = $props();
  let searchQuery = $state('');

  const handleClose = () => {
    searchQuery = '';
    onClose();
  };

  $effect(() => {
    if (show) {
      searchQuery = '';
    }
  });
</script>

<Modal {show} onClose={handleClose}>
  <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
    <div class="sm:flex sm:items-start">
      <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
        <h3 class="text-base font-semibold leading-6 text-gray-900" id="modal-title">
          Add Symbol to {watchlistName}
        </h3>
        <div class="mt-4">
          <label for="symbol-search" class="block text-sm font-medium leading-6 text-gray-900">
            Search for a symbol
          </label>
          <div class="mt-2">
            <input
              id="symbol-search"
              type="text"
              placeholder="Type a symbol (e.g., AAPL, TSLA)"
              class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
              bind:value={searchQuery}
            />
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
    <button
      type="button"
      class="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 sm:ml-3 sm:w-auto disabled:opacity-50 disabled:cursor-not-allowed"
      disabled
    >
      Add Symbol
    </button>
    <button
      type="button"
      class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
      onclick={handleClose}
    >
      Cancel
    </button>
  </div>
</Modal>