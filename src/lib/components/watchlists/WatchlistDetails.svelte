<script lang="ts">
  import { watchlistStore } from '$lib/stores/watchlist.svelte';
  import { goto } from '$app/navigation';
  import DeleteConfirmationModal from '$lib/components/modals/DeleteConfirmationModal.svelte';

  interface Props {
    watchlistName: string;
  }

  let { watchlistName }: Props = $props();
  let showDeleteModal = $state(false);

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
</script>

<div class="bg-white shadow">
  <div class="px-4 py-5 sm:px-6">
    <div class="flex items-center justify-between">
      <div>
        <h3 class="text-lg font-medium leading-6 text-gray-900">{watchlistName}</h3>
      </div>
      <div>
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

<DeleteConfirmationModal
  show={showDeleteModal}
  {watchlistName}
  onConfirm={handleDeleteConfirm}
  onCancel={handleDeleteCancel}
  isDeleting={watchlistStore.isDeleting}
/>