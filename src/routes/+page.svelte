<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { auth } from '$lib/stores/auth.svelte.ts';

  onMount(() => {
    if (auth.isAuthenticated) {
      goto('/watchlists');
    } else {
      goto('/login');
    }
  });
</script>

<main class="min-h-screen bg-gray-50 flex items-center justify-center">
  <div class="text-center">
    <h1 class="text-2xl font-semibold text-gray-900">Loading...</h1>
  </div>
</main>
