import { browser } from '$app/environment';
import { goto } from '$app/navigation';
import { PUBLIC_TASTYTRADE_API_URL } from '$env/static/public';

class AuthStore {
  token = $state<string | null>(null);
  isAuthenticated = $derived(this.token !== null);
  isLoading = $state(false);
  error = $state<string | null>(null);

  constructor() {
    // Hydrate from localStorage on client side only
    if (browser) {
      const storedToken = localStorage.getItem('sessionToken');
      if (storedToken) {
        this.token = storedToken;
      }
    }
  }

  async login(username: string, password: string) {
    this.isLoading = true;
    this.error = null;

    try {
      const response = await fetch(`${PUBLIC_TASTYTRADE_API_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          login: username.trim(),
          password: password.trim()
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Authentication failed');
      }

      const data = await response.json();
      const sessionToken = data.data['session-token'];

      if (!sessionToken) {
        throw new Error('No session token received');
      }

      this.token = sessionToken;
      if (browser) {
        localStorage.setItem('sessionToken', sessionToken);
        goto('/dashboard');
      }

      return sessionToken;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed. Please try again.';
      this.error = errorMessage;
      throw new Error(errorMessage);
    } finally {
      this.isLoading = false;
    }
  }

  async logout() {
    // If we have a token, try to invalidate it on the server
    if (this.token) {
      try {
        await fetch(`${PUBLIC_TASTYTRADE_API_URL}/sessions`, {
          method: 'DELETE',
          headers: {
            'Authorization': this.token,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        // Log error but continue with local logout
        console.warn('Failed to invalidate session on server:', err);
      }
    }

    // Clear local session data
    this.token = null;
    this.error = null;
    if (browser) {
      localStorage.removeItem('sessionToken');
      goto('/login');
    }
  }

  clearError() {
    this.error = null;
  }

  // Handle 401 responses by clearing the session
  handleUnauthorized() {
    this.token = null;
    this.error = 'Your session has expired. Please log in again.';
    if (browser) {
      localStorage.removeItem('sessionToken');
      goto('/login');
    }
  }

  // Wrapper for API calls that handles 401 responses
  async authenticatedFetch(url: string, options: RequestInit = {}) {
    if (!this.token) {
      throw new Error('No authentication token available');
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': this.token
      }
    });

    if (response.status === 401) {
      this.handleUnauthorized();
      throw new Error('Authentication expired');
    }

    return response;
  }
}

export const auth = new AuthStore();