import { test, expect } from '@playwright/test';

test.describe('Route Guards', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test.describe('Unauthenticated Access', () => {
    test('should redirect / to /login when not authenticated', async ({ page }) => {
      await page.goto('/');
      
      await expect(page).toHaveURL('/login');
      await expect(page.getByRole('heading', { name: 'tastytrade Watchlist' })).toBeVisible();
    });

    test('should redirect /dashboard to /login when not authenticated', async ({ page }) => {
      await page.goto('/dashboard');
      
      await expect(page).toHaveURL('/login');
      await expect(page.getByRole('heading', { name: 'tastytrade Watchlist' })).toBeVisible();
    });

    test('should allow direct access to /login when not authenticated', async ({ page }) => {
      await page.goto('/login');
      
      await expect(page).toHaveURL('/login');
      await expect(page.getByRole('heading', { name: 'tastytrade Watchlist' })).toBeVisible();
    });
  });

  test.describe('Authenticated Access', () => {
    test.beforeEach(async ({ page }) => {
      // Set up authenticated state by logging in first
      await page.goto('/login');
      
      await page.route('**/sessions', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: { 'session-token': 'authenticated-token-123' }
            })
          });
        } else if (route.request().method() === 'DELETE') {
          await route.fulfill({ status: 200 });
        }
      });
      
      await page.getByLabel('Username').fill('testuser');
      await page.getByLabel('Password').fill('testpass');
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      await expect(page).toHaveURL('/dashboard');
    });

    test('should redirect / to /dashboard when authenticated', async ({ page }) => {
      await page.goto('/');
      
      await expect(page).toHaveURL('/dashboard');
      // Mock watchlists API
      await page.route('**/watchlists', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { items: [] } })
        });
      });
      
      await expect(page.getByRole('heading', { name: 'Watchlists', level: 1 })).toBeVisible();
    });

    test('should allow direct access to /dashboard when authenticated', async ({ page }) => {
      await page.goto('/dashboard');
      
      await expect(page).toHaveURL('/dashboard');
      // Mock watchlists API
      await page.route('**/watchlists', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { items: [] } })
        });
      });
      
      await expect(page.getByRole('heading', { name: 'Watchlists', level: 1 })).toBeVisible();
    });

    test('should redirect /login to /dashboard when authenticated', async ({ page }) => {
      await page.goto('/login');
      
      await expect(page).toHaveURL('/dashboard');
      // Mock watchlists API
      await page.route('**/watchlists', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { items: [] } })
        });
      });
      
      await expect(page.getByRole('heading', { name: 'Watchlists', level: 1 })).toBeVisible();
    });
  });

  test.describe('Navigation Behavior', () => {
    test('should handle browser back/forward buttons correctly', async ({ page }) => {
      // Start at login
      await page.goto('/login');
      await expect(page).toHaveURL('/login');
      
      // Login
      await page.route('**/sessions', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: { 'session-token': 'nav-test-token' }
            })
          });
        } else if (route.request().method() === 'DELETE') {
          await route.fulfill({ status: 200 });
        }
      });
      
      await page.getByLabel('Username').fill('testuser');
      await page.getByLabel('Password').fill('testpass');
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      await expect(page).toHaveURL('/dashboard');
      
      // Go to root
      await page.goto('/');
      await expect(page).toHaveURL('/dashboard'); // Should redirect to dashboard
      
      // Use browser back button
      await page.goBack();
      await expect(page).toHaveURL('/dashboard'); // Should stay on dashboard
      
      // Logout
      await page.getByRole('button', { name: 'Sign out' }).click();
      await expect(page).toHaveURL('/login');
      
      // Try to use browser back button
      await page.goBack();
      await expect(page).toHaveURL('/login'); // Should redirect back to login
    });

    test('should handle deep links correctly', async ({ page }) => {
      // Try to access dashboard directly without auth
      await page.goto('/dashboard?param=test');
      
      await expect(page).toHaveURL('/login');
      
      // Login
      await page.route('**/sessions', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: { 'session-token': 'deep-link-token' }
            })
          });
        }
      });
      
      await page.getByLabel('Username').fill('testuser');
      await page.getByLabel('Password').fill('testpass');
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      // Should go to dashboard (note: query params may not be preserved in this simple implementation)
      await expect(page).toHaveURL('/dashboard');
    });
  });

  test.describe('Session Persistence', () => {
    test('should maintain authentication across page reloads', async ({ page }) => {
      // Login first
      await page.goto('/login');
      
      await page.route('**/sessions', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: { 'session-token': 'persistent-session-token' }
            })
          });
        }
      });
      
      await page.getByLabel('Username').fill('testuser');
      await page.getByLabel('Password').fill('testpass');
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      await expect(page).toHaveURL('/dashboard');
      
      // Reload page
      await page.reload();
      
      // Should still be authenticated
      await expect(page).toHaveURL('/dashboard');
      // Mock watchlists API
      await page.route('**/watchlists', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { items: [] } })
        });
      });
      
      await expect(page.getByRole('heading', { name: 'Watchlists', level: 1 })).toBeVisible();
      
      // Try to access login page
      await page.goto('/login');
      
      // Should redirect to dashboard
      await expect(page).toHaveURL('/dashboard');
    });

    test('should handle session cleared manually', async ({ page }) => {
      // Login first
      await page.goto('/login');
      
      await page.route('**/sessions', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: { 'session-token': 'manual-clear-token' }
            })
          });
        }
      });
      
      await page.getByLabel('Username').fill('testuser');
      await page.getByLabel('Password').fill('testpass');
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      await expect(page).toHaveURL('/dashboard');
      
      // Manually clear session from localStorage (simulating expired token cleanup)
      await page.evaluate(() => localStorage.removeItem('sessionToken'));
      
      // Try to access dashboard
      await page.goto('/dashboard');
      
      // Should redirect to login
      await expect(page).toHaveURL('/login');
    });
  });

  test.describe('Invalid Routes', () => {
    test('should handle non-existent routes when not authenticated', async ({ page }) => {
      await page.goto('/non-existent-route');
      
      // SvelteKit should show 404, but let's verify the auth flow isn't broken
      // The exact behavior depends on your SvelteKit error page setup
      const response = await page.request.get('/non-existent-route');
      expect(response.status()).toBe(404);
    });

    test('should handle non-existent routes when authenticated', async ({ page }) => {
      // Login first
      await page.goto('/login');
      
      await page.route('**/sessions', async route => {
        if (route.request().method() === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              data: { 'session-token': 'invalid-route-token' }
            })
          });
        }
      });
      
      await page.getByLabel('Username').fill('testuser');
      await page.getByLabel('Password').fill('testpass');
      await page.getByRole('button', { name: 'Sign in' }).click();
      
      await expect(page).toHaveURL('/dashboard');
      
      // Now try invalid route
      await page.goto('/non-existent-route');
      
      const response = await page.request.get('/non-existent-route');
      expect(response.status()).toBe(404);
    });
  });
});