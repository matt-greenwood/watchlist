<script lang="ts">
  import { auth } from '$lib/stores/auth.svelte.ts';
  
  let username = $state('');
  let password = $state('');
  
  async function handleSubmit(event: Event) {
    event.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      auth.error = 'Please enter both username and password';
      return;
    }
    
    auth.clearError();
    
    try {
      await auth.login(username, password);
    } catch (err) {
      // Error is already handled in the auth store
    }
  }
</script>

<div class="flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
  <div class="w-full max-w-md space-y-8">
    <div class="text-center">
      <h1 class="text-3xl font-bold tracking-tight text-gray-900">
        tastytrade Watchlist
      </h1>
      <p class="mt-2 text-sm text-gray-600">
        Sign in to your sandbox account
      </p>
    </div>
    
    <form class="mt-8 space-y-6" onsubmit={handleSubmit}>
      <div class="space-y-4">
        <div>
          <label for="username" class="block text-sm font-medium text-gray-700">
            Username
          </label>
          <input
            id="username"
            name="username"
            type="text"
            autocomplete="username"
            required
            class="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            bind:value={username}
            disabled={auth.isLoading}
            aria-describedby={auth.error ? 'error-message' : undefined}
          />
        </div>
        
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autocomplete="current-password"
            required
            class="mt-1 block w-full rounded-md border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            bind:value={password}
            disabled={auth.isLoading}
            aria-describedby={auth.error ? 'error-message' : undefined}
          />
        </div>
      </div>
      
      {#if auth.error}
        <div 
          id="error-message"
          class="rounded-md bg-red-50 p-4 text-sm text-red-700"
          role="alert"
          aria-live="polite"
        >
          {auth.error}
        </div>
      {/if}
      
      <button
        type="submit"
        class="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={auth.isLoading}
        aria-describedby="login-button-description"
      >
        {#if auth.isLoading}
          <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Signing in...
        {:else}
          Sign in
        {/if}
      </button>
      
      <div id="login-button-description" class="sr-only">
        Sign in to access your watchlists and manage your portfolio
      </div>
    </form>
  </div>
</div>