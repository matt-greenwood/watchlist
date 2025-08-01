<script lang="ts">
  import { onMount } from 'svelte';
  import { watchlistStore } from '$lib/stores/watchlist.svelte.ts';
  import Watchlists from '$lib/components/watchlists/Watchlists.svelte';

  onMount(() => {
    watchlistStore.fetchWatchlists();
  });

  const handleRetry = () => {
    watchlistStore.fetchWatchlists();
  };
</script>

<Watchlists 
  watchlists={watchlistStore.watchlists}
  isLoading={watchlistStore.isLoading}
  error={watchlistStore.error}
  onRetry={handleRetry}
/>
