<script lang="ts">
	import { auth } from '$lib/stores/auth.svelte.js';
</script>

<div class="min-h-screen bg-gray-50">
	<header class="bg-white shadow-sm">
		<div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
			<div class="flex items-center justify-between">
				<h1 class="text-2xl font-bold text-gray-900">Watchlists</h1>
				<button
					onclick={() => auth.logout()}
					class="rounded-md bg-gray-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-gray-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-600"
				>
					Sign out
				</button>
			</div>
		</div>
	</header>
	
	<main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="text-center">
			<h2 class="text-lg font-medium text-gray-900">Welcome to your dashboard!</h2>
			{#if auth.token}
				<p class="mt-2 text-sm text-gray-600">
					Session token: {auth.token.substring(0, 20)}...
				</p>
			{/if}
		</div>
	</main>
</div>