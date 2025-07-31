<script lang="ts">
  import { auth } from '$lib/stores/auth.svelte.ts';
  import CreateWatchlistModal from '$lib/components/modals/CreateWatchlistModal.svelte';

  let showCreateModal = $state(false);

	let { children } = $props();
</script>

<div class="min-h-screen bg-gray-50">
  <header class="bg-white shadow-sm">
    <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-gray-900">
          <a href="/watchlists" class="hover:text-blue-600 transition-colors">Watchlists</a>
        </h1>
        <div class="flex items-center space-x-3">
          <button
            type="button"
            onclick={() => showCreateModal = true}
            class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            Create watchlist
          </button>
          <button
            onclick={() => auth.logout()}
            class="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
          >
            Sign out
          </button>
        </div>
      </div>
    </div>
  </header>

  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    {@render children()}
  </main>
</div>

<CreateWatchlistModal show={showCreateModal} onClose={() => showCreateModal = false} />