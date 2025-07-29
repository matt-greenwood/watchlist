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


  test.skip('should display empty state when no watchlists exist', async ({ page }) => {
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

  test.skip('should display list of watchlists', async ({ page }) => {
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




});