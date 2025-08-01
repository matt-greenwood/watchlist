<script lang="ts">
  import type { Watchlist } from '$lib/types/Watchlist';
  import { goto } from '$app/navigation';
  import { watchlistStore } from '$lib/stores/watchlist.svelte';
  import DeleteConfirmationModal from '$lib/components/modals/DeleteConfirmationModal.svelte';

  interface Props {
    watchlist: Watchlist;
  }

  let { watchlist }: Props = $props();
  let showDeleteModal = $state(false);

  const handleViewWatchlist = () => {
    goto(`/watchlists/${watchlist.name}`);
  };

  const handleDeleteClick = () => {
    showDeleteModal = true;
  };

  const handleDeleteConfirm = async () => {
    const success = await watchlistStore.deleteWatchlist(watchlist.name);
    if (success) {
      showDeleteModal = false;
    }
  };

  const handleDeleteCancel = () => {
    showDeleteModal = false;
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
      <div class="flex items-center space-x-5">
        <button
          type="button"
          class="text-sm font-medium text-blue-600 hover:text-blue-500 cursor-pointer"
          onclick={handleViewWatchlist}
        >
          View
        </button>
        <button
          type="button"
          class="text-sm font-medium text-red-600 hover:text-red-500 cursor-pointer"
          onclick={handleDeleteClick}
        >
          Delete
        </button>
      </div>
    </div>
  </div>
</li>

<DeleteConfirmationModal
  show={showDeleteModal}
  watchlistName={watchlist.name}
  onConfirm={handleDeleteConfirm}
  onCancel={handleDeleteCancel}
  isDeleting={watchlistStore.isDeleting}
/>