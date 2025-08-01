<script lang="ts">
  import type { PageData } from './$types';
  import WatchlistDetails from '$lib/components/watchlists/WatchlistDetails.svelte';
  
  export let data: PageData;
</script>

<WatchlistDetails watchlistName={data.watchlistName} />