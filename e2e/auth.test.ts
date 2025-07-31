import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  test('should redirect unauthenticated user to login', async ({ page }) => {
    await page.goto('/watchlists');
    
    // Should redirect to login page
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'tastytrade Watchlist' })).toBeVisible();
  });

  test('should show login form elements', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByRole('heading', { name: 'tastytrade Watchlist' })).toBeVisible();
    await expect(page.getByText('Sign in to your sandbox account')).toBeVisible();
    await expect(page.getByLabel('Username')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
  });


  test('should show loading state during login', async ({ page }) => {
    await page.goto('/login');
    
    // Mock a slow API response
    await page.route('**/sessions', async route => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { 'session-token': 'test-token-123' }
        })
      });
    });
    
    await page.getByLabel('Username').fill('testuser');
    await page.getByLabel('Password').fill('testpass');
    
    // Start login process
    const submitPromise = page.getByRole('button', { name: 'Sign in' }).click();
    
    // Check loading state
    await expect(page.getByRole('button', { name: 'Signing in...' })).toBeVisible();
    await expect(page.getByRole('button')).toBeDisabled();
    
    await submitPromise;
  });

  test('should handle login failure', async ({ page }) => {
    await page.goto('/login');
    
    // Mock failed login response
    await page.route('**/sessions', async route => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: { message: 'Invalid credentials' }
        })
      });
    });
    
    await page.getByLabel('Username').fill('wronguser');
    await page.getByLabel('Password').fill('wrongpass');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    await expect(page.getByText('Invalid credentials')).toBeVisible();
    await expect(page).toHaveURL('/login');
  });

  test('should complete successful login flow', async ({ page }) => {
    await page.goto('/login');
    
    // Mock successful login response
    await page.route('**/sessions', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { 'session-token': 'test-token-123' }
          })
        });
      } else {
        await route.continue();
      }
    });
    
    await page.getByLabel('Username').fill('testuser');
    await page.getByLabel('Password').fill('testpass');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    // Mock watchlists API for watchlists
    await page.route('**/watchlists', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { items: [] } })
      });
    });
    
    // Should redirect to watchlists
    await expect(page).toHaveURL('/watchlists');
    await expect(page.getByRole('heading', { name: 'Watchlists', level: 1 })).toBeVisible();
    await expect(page.getByText('Your Watchlists')).toBeVisible();
  });

  test('should display watchlists content after login', async ({ page }) => {
    // Set up authenticated state
    await page.goto('/login');
    await page.route('**/sessions', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { 'session-token': 'test-token-123456789' }
          })
        });
      }
    });
    
    await page.route('**/watchlists', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { items: [] } })
      });
    });
    
    await page.getByLabel('Username').fill('testuser');
    await page.getByLabel('Password').fill('testpass');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    await expect(page).toHaveURL('/watchlists');
    await expect(page.getByText('Your Watchlists')).toBeVisible();
    await expect(page.getByText('Manage and view your investment watchlists')).toBeVisible();
  });

  test.skip('should complete logout flow', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.route('**/sessions', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { 'session-token': 'test-token-123' }
          })
        });
      } else if (route.request().method() === 'DELETE') {
        await route.fulfill({ status: 200 });
      }
    });
    
    await page.getByLabel('Username').fill('testuser');
    await page.getByLabel('Password').fill('testpass');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    await expect(page).toHaveURL('/watchlists');
    
    // Now logout
    await page.getByRole('button', { name: 'Sign out' }).click();
    
    // Should redirect to login
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'tastytrade Watchlist' })).toBeVisible();
  });

  test('should persist session across page reloads', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.route('**/sessions', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { 'session-token': 'persistent-token-123' }
          })
        });
      }
    });
    
    await page.getByLabel('Username').fill('testuser');
    await page.getByLabel('Password').fill('testpass');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    await expect(page).toHaveURL('/watchlists');
    
    // Reload the page
    await page.reload();
    
    // Should still be on watchlists (token persisted)
    // Mock watchlists for watchlists  
    await page.route('**/watchlists', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { items: [] } })
      });
    });
    
    await expect(page).toHaveURL('/watchlists');
    await expect(page.getByRole('heading', { name: 'Watchlists', level: 1 })).toBeVisible();
  });

  test('should redirect authenticated user away from login page', async ({ page }) => {
    // First login
    await page.goto('/login');
    await page.route('**/sessions', async route => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: { 'session-token': 'test-token-123' }
          })
        });
      }
    });
    
    await page.getByLabel('Username').fill('testuser');
    await page.getByLabel('Password').fill('testpass');
    await page.getByRole('button', { name: 'Sign in' }).click();
    
    await expect(page).toHaveURL('/watchlists');
    
    // Try to go back to login page
    await page.goto('/login');
    
    // Should redirect back to watchlists
    await expect(page).toHaveURL('/watchlists');
  });

});