import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Homepage and Navigation
 */

test.describe('Homepage', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('should load homepage successfully', async ({ page }) => {
        // Verify page title
        await expect(page).toHaveTitle(/Alto Carwash/i);

        // Verify main heading exists
        const heading = page.getByRole('heading', { level: 1 });
        await expect(heading).toBeVisible();
    });

    test('should display search bar', async ({ page }) => {
        // Find search input
        const searchInput = page.getByPlaceholder(/buscar/i);
        await expect(searchInput).toBeVisible();
        await expect(searchInput).toBeEnabled();
    });

    test('should navigate to map page', async ({ page }) => {
        // Click on map link/button
        await page.getByRole('link', { name: /mapa/i }).click();

        // Verify URL changed
        await expect(page).toHaveURL(/\/map/);

        // Verify map container exists
        const mapContainer = page.locator('[id*="map"], [class*="map"]').first();
        await expect(mapContainer).toBeVisible({ timeout: 10000 });
    });

    test('should navigate to comparison page', async ({ page }) => {
        // Click on comparison link
        await page.getByRole('link', { name: /comparar/i }).click();

        // Verify URL
        await expect(page).toHaveURL(/\/compare/);
    });

    test('should be responsive on mobile', async ({ page, viewport }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 });

        // Verify mobile menu exists
        const mobileMenuButton = page.getByLabel(/menu/i);
        await expect(mobileMenuButton).toBeVisible();
    });
});

test.describe('Search Functionality', () => {
    test('should perform search', async ({ page }) => {
        await page.goto('/');

        // Type in search box
        const searchInput = page.getByPlaceholder(/buscar/i);
        await searchInput.fill('lavado premium');

        // Submit search
        await searchInput.press('Enter');

        // Wait for results
        await page.waitForLoadState('networkidle');

        // Verify results appear
        const results = page.locator('[data-testid*="search-result"], [class*="search-result"]');
        await expect(results.first()).toBeVisible({ timeout: 5000 });
    });

    test('should filter search results', async ({ page }) => {
        await page.goto('/');

        // Perform search
        const searchInput = page.getByPlaceholder(/buscar/i);
        await searchInput.fill('lavado');
        await searchInput.press('Enter');

        await page.waitForLoadState('networkidle');

        // Apply filter (example: price range)
        const priceFilter = page.locator('[data-testid="price-filter"]').first();
        if (await priceFilter.isVisible()) {
            await priceFilter.click();
        }
    });
});
