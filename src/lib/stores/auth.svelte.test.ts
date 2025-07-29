import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { auth } from './auth.svelte.ts';

// Mock fetch globally
const mockFetch = vi.fn();
window.fetch = mockFetch;

// Mock localStorage (use existing localStorage but with vi.fn() methods)
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn()
};
Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true
});

// Mock SvelteKit modules
vi.mock('$app/environment', () => ({
  browser: true
}));

vi.mock('$app/navigation', () => ({
  goto: vi.fn()
}));

vi.mock('$env/static/public', () => ({
  PUBLIC_TASTYTRADE_API_URL: 'https://api.test.com'
}));

describe('AuthStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset auth state
    auth.token = null;
    auth.error = null;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should start with null token and not authenticated', () => {
      expect(auth.token).toBe(null);
      expect(auth.isAuthenticated).toBe(false);
      expect(auth.error).toBe(null);
      expect(auth.isLoading).toBe(false);
    });

  });

  describe('login', () => {
    it('should successfully login with valid credentials', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          data: { 'session-token': 'test-token-123' }
        })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      const token = await auth.login('testuser', 'testpass');
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: 'testuser',
          password: 'testpass'
        })
      });
      
      expect(token).toBe('test-token-123');
      expect(auth.token).toBe('test-token-123');
      expect(auth.isAuthenticated).toBe(true);
      expect(auth.error).toBe(null);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('sessionToken', 'test-token-123');
    });

    it('should handle login failure with error message', async () => {
      const mockResponse = {
        ok: false,
        json: () => Promise.resolve({
          error: { message: 'Invalid credentials' }
        })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      await expect(auth.login('wrong', 'credentials')).rejects.toThrow('Invalid credentials');
      
      expect(auth.token).toBe(null);
      expect(auth.isAuthenticated).toBe(false);
      expect(auth.error).toBe('Invalid credentials');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));
      
      await expect(auth.login('user', 'pass')).rejects.toThrow('Network error');
      
      expect(auth.token).toBe(null);
      expect(auth.error).toBe('Network error');
    });

    it('should trim whitespace from credentials', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          data: { 'session-token': 'test-token' }
        })
      };
      mockFetch.mockResolvedValue(mockResponse);
      
      await auth.login(' testuser ', ' testpass ');
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          login: 'testuser',
          password: 'testpass'
        })
      });
    });

    it('should set loading state during login', async () => {
      let resolvePromise: (value: any) => void;
      const mockPromise = new Promise(resolve => {
        resolvePromise = resolve;
      });
      
      mockFetch.mockReturnValue(mockPromise);
      
      const loginPromise = auth.login('user', 'pass');
      
      expect(auth.isLoading).toBe(true);
      
      resolvePromise!({
        ok: true,
        json: () => Promise.resolve({
          data: { 'session-token': 'test-token' }
        })
      });
      
      await loginPromise;
      
      expect(auth.isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    beforeEach(() => {
      auth.token = 'existing-token';
    });

    it('should successfully logout and clear session', async () => {
      const mockResponse = { ok: true };
      mockFetch.mockResolvedValue(mockResponse);
      
      await auth.logout();
      
      expect(mockFetch).toHaveBeenCalledWith('https://api.test.com/sessions', {
        method: 'DELETE',
        headers: {
          'Authorization': 'existing-token',
          'Content-Type': 'application/json'
        }
      });
      
      expect(auth.token).toBe(null);
      expect(auth.isAuthenticated).toBe(false);
      expect(auth.error).toBe(null);
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('sessionToken');
    });

    it('should clear local session even if server logout fails', async () => {
      mockFetch.mockRejectedValue(new Error('Server error'));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      
      await auth.logout();
      
      expect(consoleSpy).toHaveBeenCalledWith('Failed to invalidate session on server:', expect.any(Error));
      expect(auth.token).toBe(null);
      expect(auth.isAuthenticated).toBe(false);
    });

    it('should not call server if no token exists', async () => {
      auth.token = null;
      
      await auth.logout();
      
      expect(mockFetch).not.toHaveBeenCalled();
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('sessionToken');
    });
  });

  describe('handleUnauthorized', () => {
    it('should clear session and set expired message', () => {
      auth.token = 'expired-token';
      
      auth.handleUnauthorized();
      
      expect(auth.token).toBe(null);
      expect(auth.isAuthenticated).toBe(false);
      expect(auth.error).toBe('Your session has expired. Please log in again.');
      expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('sessionToken');
    });
  });

  describe('authenticatedFetch', () => {
    beforeEach(() => {
      auth.token = 'valid-token';
    });

    it('should make authenticated request with token', async () => {
      const mockResponse = { ok: true, status: 200 };
      mockFetch.mockResolvedValue(mockResponse);
      
      const response = await auth.authenticatedFetch('/api/data');
      
      expect(mockFetch).toHaveBeenCalledWith('/api/data', {
        headers: {
          'Authorization': 'valid-token'
        }
      });
      expect(response).toBe(mockResponse);
    });

    it('should handle 401 responses by clearing session', async () => {
      const mockResponse = { ok: false, status: 401 };
      mockFetch.mockResolvedValue(mockResponse);
      
      await expect(auth.authenticatedFetch('/api/data')).rejects.toThrow('Authentication expired');
      
      expect(auth.token).toBe(null);
      expect(auth.error).toBe('Your session has expired. Please log in again.');
    });

    it('should throw error if no token available', async () => {
      auth.token = null;
      
      await expect(auth.authenticatedFetch('/api/data')).rejects.toThrow('No authentication token available');
    });

    it('should merge custom headers with auth header', async () => {
      const mockResponse = { ok: true, status: 200 };
      mockFetch.mockResolvedValue(mockResponse);
      
      await auth.authenticatedFetch('/api/data', {
        headers: {
          'Content-Type': 'application/json',
          'Custom-Header': 'value'
        }
      });
      
      expect(mockFetch).toHaveBeenCalledWith('/api/data', {
        headers: {
          'Content-Type': 'application/json',
          'Custom-Header': 'value',
          'Authorization': 'valid-token'
        }
      });
    });
  });

  describe('clearError', () => {
    it('should clear error message', () => {
      auth.error = 'Some error';
      
      auth.clearError();
      
      expect(auth.error).toBe(null);
    });
  });
});