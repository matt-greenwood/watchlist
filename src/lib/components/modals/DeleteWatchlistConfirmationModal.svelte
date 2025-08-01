<script lang="ts">
  import ConfirmationModal from './ConfirmationModal.svelte';

  interface Props {
    show: boolean;
    watchlistName: string;
    onConfirm: () => void;
    onCancel: () => void;
    isDeleting?: boolean;
  }

  let { show, watchlistName, onConfirm, onCancel, isDeleting = false }: Props = $props();
</script>

<ConfirmationModal
  {show}
  title="Delete Watchlist"
  message={`Are you sure you want to delete "<strong>${watchlistName}</strong>"? This action cannot be undone.`}
  confirmText="Delete"
  confirmingText="Deleting..."
  {onConfirm}
  {onCancel}
  isConfirming={isDeleting}
/>