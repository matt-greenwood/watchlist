<script lang="ts">
	import LoginForm from '$lib/components/LoginForm.svelte';
	import WatchlistDashboard from '$lib/components/WatchlistDashboard.svelte';
	import { auth } from '$lib/stores/auth.svelte.js';
</script>

<main class="min-h-screen bg-gray-50">
	{#if auth.isAuthenticated}
		<WatchlistDashboard />
	{:else}
		<LoginForm />
	{/if}
</main>
