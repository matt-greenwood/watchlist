<script lang="ts">
  interface Props {
    show: boolean;
    onClose: () => void;
    children: any;
  }

  let { show, onClose, children }: Props = $props();
  let modalElement = $state<HTMLDivElement>();

  $effect(() => {
    if (show && modalElement) {
      // Focus the first input element when modal opens
      setTimeout(() => {
        const firstInput = modalElement?.querySelector('input') as HTMLInputElement;
        firstInput?.focus();
      }, 100);
    }
  });

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (modalElement && e.key === 'Tab') {
      const focusableElements = modalElement.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  }
</script>

{#if show}
  <div 
    class="fixed inset-0 z-50 overflow-y-auto" 
    onkeydown={handleKeydown}
    role="dialog" 
    aria-modal="true"
    tabindex="-1"
  >
    <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
      <div 
        class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
        onclick={onClose}
        aria-hidden="true"
      ></div>
      
      <div bind:this={modalElement} class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
        {@render children()}
      </div>
    </div>
  </div>
{/if}