import { test, expect } from '@playwright/test';

test.describe('Dashboard - Watchlists', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
  });

  async function loginUser(page: any) {
    await page.goto('/login');
    
    await page.route('**/sessions', async (route: any) => {
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
    
    await expect(page).toHaveURL('/dashboard');
  }

  test('should show loading state while fetching watchlists', async ({ page }) => {
    await loginUser(page);
    
    // Mock a slow watchlists API response
    await page.route('**/watchlists', async (route) => {
      await new Promise(resolve => setTimeout(resolve, 1000));
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { items: [] }
        })
      });
    });
    
    // Should show loading state
    await expect(page.getByText('Loading watchlists...')).toBeVisible();
    
    // Wait for loading to complete
    await expect(page.getByText('Loading watchlists...')).not.toBeVisible({ timeout: 2000 });
  });

  test('should display empty state when no watchlists exist', async ({ page }) => {
    await loginUser(page);
    
    // Mock empty watchlists response
    await page.route('**/watchlists', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { items: [] }
        })
      });
    });
    
    // Should show empty state
    await expect(page.getByText('No watchlists')).toBeVisible();
    await expect(page.getByText('Get started by creating your first watchlist.')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create watchlist' })).toBeVisible();
  });

  test('should display list of watchlists', async ({ page }) => {
    await loginUser(page);
    
    // Mock watchlists response with data
    await page.route('**/watchlists', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: {
            items: [
              {
                name: 'Tech Stocks',
                'watchlist-entries': [
                  { symbol: 'AAPL', 'instrument-type': 'Equity' },
                  { symbol: 'GOOGL', 'instrument-type': 'Equity' },
                  { symbol: 'MSFT', 'instrument-type': 'Equity' }
                ]
              },
              {
                name: 'My Favorites',
                'watchlist-entries': [
                  { symbol: 'TSLA', 'instrument-type': 'Equity' }
                ]
              },
              {
                name: 'Empty List',
                'watchlist-entries': []
              }
            ]
          }
        })
      });
    });
    
    // Should display watchlist names
    await expect(page.getByText('Tech Stocks')).toBeVisible();
    await expect(page.getByText('My Favorites')).toBeVisible();
    await expect(page.getByText('Empty List')).toBeVisible();
    
    // Should display symbol counts
    await expect(page.getByText('3 symbols')).toBeVisible();
    await expect(page.getByText('1 symbol')).toBeVisible();
    await expect(page.getByText('0 symbols')).toBeVisible();
    
    // Should have View buttons
    const viewButtons = page.getByRole('button', { name: 'View' });
    await expect(viewButtons).toHaveCount(3);
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await loginUser(page);
    
    // Mock failed watchlists response
    await page.route('**/watchlists', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Internal server error'
        })
      });
    });
    
    // Should show error message
    await expect(page.getByText('Error loading watchlists')).toBeVisible();
    await expect(page.getByText('Failed to fetch watchlists: 500')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });

  test('should retry fetching watchlists when error occurs', async ({ page }) => {
    await loginUser(page);
    
    let attemptCount = 0;
    
    // Mock failed first request, successful second request
    await page.route('**/watchlists', async (route) => {
      attemptCount++;
      
      if (attemptCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Server error' })
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: {
              items: [
                {
                  name: 'Retry Success',
                  'watchlist-entries': [
                    { symbol: 'AAPL', 'instrument-type': 'Equity' }
                  ]
                }
              ]
            }
          })
        });
      }
    });
    
    // Should show error first
    await expect(page.getByText('Error loading watchlists')).toBeVisible();
    
    // Click retry button
    await page.getByRole('button', { name: 'Try again' }).click();
    
    // Should show successful data
    await expect(page.getByText('Error loading watchlists')).not.toBeVisible();
    await expect(page.getByText('Retry Success')).toBeVisible();
    await expect(page.getByText('1 symbol')).toBeVisible();
  });

  test('should handle authentication errors during fetch', async ({ page }) => {
    await loginUser(page);
    
    // Mock 401 unauthorized response
    await page.route('**/watchlists', async (route) => {
      await route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({
          error: 'Unauthorized'
        })
      });
    });
    
    // Should redirect to login page due to 401 handling in auth store
    await expect(page).toHaveURL('/login');
    await expect(page.getByText('Your session has expired. Please log in again.')).toBeVisible();
  });

  test('should display correct page header and navigation', async ({ page }) => {
    await loginUser(page);
    
    await page.route('**/watchlists', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: { items: [] }
        })
      });
    });
    
    // Should show correct header
    await expect(page.getByRole('heading', { name: 'Watchlists' })).toBeVisible();
    await expect(page.getByText('Your Watchlists')).toBeVisible();
    await expect(page.getByText('Manage and view your investment watchlists')).toBeVisible();
    
    // Should have sign out button
    await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible();
  });
});