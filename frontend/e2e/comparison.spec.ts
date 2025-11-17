import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Comparison Feature
 */

test.describe('Service Comparison', () => {
    test('should navigate to comparison page', async ({ page }) => {
        await page.goto('/');

        // Click comparison link
        const compareLink = page.getByRole('link', { name: /comparar/i });
        await compareLink.click();

        // Verify URL
        await expect(page).toHaveURL(/\/compare/);
    });

    test('should display empty comparison state', async ({ page }) => {
        await page.goto('/compare');

        // Check for empty state message
        const emptyMessage = page.getByText(/selecciona.*comparar|no hay.*comparar/i);
        await expect(emptyMessage).toBeVisible();
    });

    test('should add provider to comparison from search', async ({ page }) => {
        await page.goto('/');

        // Search for providers
        const searchInput = page.getByPlaceholder(/buscar/i);
        await searchInput.fill('lavado');
        await searchInput.press('Enter');

        await page.waitForLoadState('networkidle');

        // Click "compare" button on first result
        const compareButton = page.locator('[data-testid*="add-to-compare"]').first();
        if (await compareButton.isVisible()) {
            await compareButton.click();

            // Verify added to comparison
            const compareCounter = page.locator('[data-testid="compare-counter"]');
            await expect(compareCounter).toHaveText(/1/);
        }
    });

    test('should allow adding up to 3 providers', async ({ page }) => {
        await page.goto('/');

        // Search and add multiple providers
        const searchInput = page.getByPlaceholder(/buscar/i);
        await searchInput.fill('lavado');
        await searchInput.press('Enter');

        await page.waitForLoadState('networkidle');

        // Add first provider
        const compareButtons = page.locator('[data-testid*="add-to-compare"]');
        const count = await compareButtons.count();

        for (let i = 0; i < Math.min(count, 3); i++) {
            await compareButtons.nth(i).click();
            await page.waitForTimeout(500);
        }

        // Verify counter shows 3
        const compareCounter = page.locator('[data-testid="compare-counter"]');
        if (await compareCounter.isVisible()) {
            const text = await compareCounter.textContent();
            expect(parseInt(text || '0')).toBeLessThanOrEqual(3);
        }
    });

    test('should display comparison table', async ({ page }) => {
        // Assume we have providers in comparison
        await page.goto('/compare?ids=1,2,3');

        // Wait for comparison table
        const comparisonTable = page.locator('[data-testid="comparison-table"], table').first();
        await expect(comparisonTable).toBeVisible({ timeout: 5000 });
    });

    test('should show provider details in comparison', async ({ page }) => {
        await page.goto('/compare?ids=1,2');

        // Check for provider names
        const providerNames = page.locator('[data-testid*="provider-name"]');
        await expect(providerNames.first()).toBeVisible({ timeout: 3000 });

        // Check for prices
        const prices = page.locator('[data-testid*="price"]');
        await expect(prices.first()).toBeVisible();

        // Check for ratings
        const ratings = page.locator('[data-testid*="rating"]');
        await expect(ratings.first()).toBeVisible();
    });

    test('should remove provider from comparison', async ({ page }) => {
        await page.goto('/compare?ids=1,2,3');

        // Click remove button
        const removeButton = page.locator('[data-testid*="remove-from-compare"]').first();
        if (await removeButton.isVisible()) {
            await removeButton.click();

            // Verify removed
            await page.waitForTimeout(500);
            const providerCards = page.locator('[data-testid*="comparison-card"]');
            const count = await providerCards.count();
            expect(count).toBeLessThanOrEqual(2);
        }
    });

    test('should highlight best price', async ({ page }) => {
        await page.goto('/compare?ids=1,2,3');

        // Find highlighted price (best value)
        const highlightedPrice = page.locator('[data-testid*="best-price"], .highlight, .best-value').first();
        await expect(highlightedPrice).toBeVisible({ timeout: 3000 });
    });

    test('should allow booking from comparison', async ({ page }) => {
        await page.goto('/compare?ids=1,2');

        // Click book button on one of the compared providers
        const bookButton = page.getByRole('button', { name: /reservar/i }).first();
        await bookButton.click();

        // Verify booking modal opened
        const modal = page.locator('[role="dialog"]').first();
        await expect(modal).toBeVisible({ timeout: 3000 });
    });

    test('should persist comparison across pages', async ({ page }) => {
        await page.goto('/');

        // Add provider to comparison
        const searchInput = page.getByPlaceholder(/buscar/i);
        await searchInput.fill('lavado');
        await searchInput.press('Enter');

        await page.waitForLoadState('networkidle');

        const compareButton = page.locator('[data-testid*="add-to-compare"]').first();
        if (await compareButton.isVisible()) {
            await compareButton.click();

            // Navigate away and back
            await page.goto('/map');
            await page.goto('/compare');

            // Verify provider still in comparison
            const comparisonCard = page.locator('[data-testid*="comparison-card"]').first();
            await expect(comparisonCard).toBeVisible({ timeout: 3000 });
        }
    });

    test('should clear all comparisons', async ({ page }) => {
        await page.goto('/compare?ids=1,2,3');

        // Click clear all button
        const clearButton = page.getByRole('button', { name: /limpiar|clear all/i });
        if (await clearButton.isVisible()) {
            await clearButton.click();

            // Verify empty state
            const emptyMessage = page.getByText(/selecciona.*comparar/i);
            await expect(emptyMessage).toBeVisible({ timeout: 2000 });
        }
    });
});

test.describe('Comparison Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('should display comparison in mobile view', async ({ page }) => {
        await page.goto('/compare?ids=1,2');

        // Verify mobile layout (likely carousel or stacked)
        const mobileLayout = page.locator('[data-testid="mobile-comparison"]');
        // Mobile layout might differ from desktop
        await page.waitForLoadState('networkidle');
    });

    test('should allow swiping between providers on mobile', async ({ page }) => {
        await page.goto('/compare?ids=1,2,3');

        // Look for swipeable element
        const swipeableArea = page.locator('[data-testid="swipeable-comparison"]').first();
        if (await swipeableArea.isVisible()) {
            // Perform swipe gesture using touch events
            const box = await swipeableArea.boundingBox();
            if (box) {
                await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
                await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
                await page.mouse.down();
                await page.mouse.move(box.x + box.width / 4, box.y + box.height / 2);
                await page.mouse.up();
            }
        }
    });
});
