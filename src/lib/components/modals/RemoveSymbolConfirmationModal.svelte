<script lang="ts">
  import ConfirmationModal from './ConfirmationModal.svelte';

  interface Props {
    show: boolean;
    symbol: string;
    watchlistName: string;
    onConfirm: () => void;
    onCancel: () => void;
    isRemoving?: boolean;
  }

  let { show, symbol, watchlistName, onConfirm, onCancel, isRemoving = false }: Props = $props();
</script>

<ConfirmationModal
  {show}
  title="Remove Symbol"
  message={`Are you sure you want to remove "<strong>${symbol}</strong>" from "<strong>${watchlistName}</strong>"?`}
  confirmText="Remove"
  confirmingText="Removing..."
  {onConfirm}
  {onCancel}
  isConfirming={isRemoving}
/>