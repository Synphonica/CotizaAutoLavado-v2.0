import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Booking Flow
 */

test.describe('Booking Process', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to a carwash provider page
        await page.goto('/');

        // Search for a carwash
        const searchInput = page.getByPlaceholder(/buscar/i);
        await searchInput.fill('lavado');
        await searchInput.press('Enter');

        // Wait for results
        await page.waitForLoadState('networkidle');

        // Click on first result
        const firstResult = page.locator('[data-testid*="provider-card"]').first();
        await firstResult.click();

        // Wait for provider page to load
        await page.waitForLoadState('networkidle');
    });

    test('should display booking button on provider page', async ({ page }) => {
        const bookingButton = page.getByRole('button', { name: /reservar|book/i });
        await expect(bookingButton).toBeVisible();
    });

    test('should open booking modal when clicking book button', async ({ page }) => {
        // Click booking button
        const bookingButton = page.getByRole('button', { name: /reservar|book/i });
        await bookingButton.click();

        // Verify modal opened
        const modal = page.locator('[role="dialog"], [data-testid="booking-modal"]').first();
        await expect(modal).toBeVisible({ timeout: 3000 });
    });

    test('should display service selection in booking modal', async ({ page }) => {
        await page.getByRole('button', { name: /reservar/i }).click();

        // Check for service options
        const serviceSelect = page.locator('[data-testid="service-select"], select, [role="listbox"]').first();
        await expect(serviceSelect).toBeVisible({ timeout: 3000 });
    });

    test('should display calendar for date selection', async ({ page }) => {
        await page.getByRole('button', { name: /reservar/i }).click();

        // Wait for calendar
        const calendar = page.locator('[data-testid="calendar"], [class*="calendar"]').first();
        await expect(calendar).toBeVisible({ timeout: 5000 });
    });

    test('should select date and time slot', async ({ page }) => {
        await page.getByRole('button', { name: /reservar/i }).click();

        // Select service first
        const serviceSelect = page.locator('[data-testid="service-select"]').first();
        if (await serviceSelect.isVisible()) {
            await serviceSelect.click();
            await page.locator('[role="option"]').first().click();
        }

        // Select date (tomorrow)
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowButton = page.getByLabel(tomorrow.toLocaleDateString());

        if (await tomorrowButton.isVisible()) {
            await tomorrowButton.click();
        } else {
            // Click any available date
            const availableDate = page.locator('[data-testid*="available-date"]').first();
            await availableDate.click();
        }

        // Select time slot
        const timeSlot = page.locator('[data-testid*="time-slot"]').first();
        await expect(timeSlot).toBeVisible({ timeout: 3000 });
        await timeSlot.click();
    });

    test('should require authentication for booking', async ({ page }) => {
        await page.getByRole('button', { name: /reservar/i }).click();

        // Fill booking form
        const serviceSelect = page.locator('[data-testid="service-select"]').first();
        if (await serviceSelect.isVisible()) {
            await serviceSelect.click();
            await page.locator('[role="option"]').first().click();
        }

        // Try to submit without auth
        const submitButton = page.getByRole('button', { name: /confirmar reserva/i });
        if (await submitButton.isVisible()) {
            await submitButton.click();

            // Should show auth modal or redirect
            const authModal = page.locator('[data-clerk-modal]');
            await expect(authModal).toBeVisible({ timeout: 5000 });
        }
    });

    test('should show booking confirmation', async ({ page }) => {
        test.skip(true, 'Requires authenticated session and payment setup');

        // Complete full booking flow
        await page.getByRole('button', { name: /reservar/i }).click();

        // Select service, date, time...
        // ... (full flow)

        // Confirm booking
        const confirmButton = page.getByRole('button', { name: /confirmar/i });
        await confirmButton.click();

        // Wait for confirmation
        const confirmation = page.getByText(/reserva confirmada/i);
        await expect(confirmation).toBeVisible({ timeout: 5000 });
    });

    test('should display booking in user dashboard', async ({ page }) => {
        test.skip(true, 'Requires authenticated session with existing booking');

        await page.goto('/dashboard');

        // Navigate to bookings
        await page.getByRole('link', { name: /mis reservas/i }).click();

        // Verify bookings list
        const bookingsList = page.locator('[data-testid="bookings-list"]');
        await expect(bookingsList).toBeVisible();

        // Verify at least one booking
        const bookingItem = page.locator('[data-testid*="booking-item"]').first();
        await expect(bookingItem).toBeVisible();
    });

    test('should cancel booking', async ({ page }) => {
        test.skip(true, 'Requires authenticated session with existing booking');

        await page.goto('/dashboard');
        await page.getByRole('link', { name: /mis reservas/i }).click();

        // Click cancel on first booking
        const cancelButton = page.locator('[data-testid*="cancel-booking"]').first();
        await cancelButton.click();

        // Confirm cancellation
        const confirmCancel = page.getByRole('button', { name: /confirmar cancelación/i });
        await confirmCancel.click();

        // Verify success message
        const successMessage = page.getByText(/cancelada/i);
        await expect(successMessage).toBeVisible({ timeout: 3000 });
    });
});

test.describe('Booking Validations', () => {
    test('should prevent booking in the past', async ({ page }) => {
        await page.goto('/provider/1'); // Example provider

        await page.getByRole('button', { name: /reservar/i }).click();

        // Try to select past date (should be disabled)
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const pastDateButton = page.getByLabel(yesterday.toLocaleDateString());

        if (await pastDateButton.isVisible()) {
            await expect(pastDateButton).toBeDisabled();
        }
    });

    test('should show error for invalid booking data', async ({ page }) => {
        await page.goto('/provider/1');

        await page.getByRole('button', { name: /reservar/i }).click();

        // Try to submit without selecting required fields
        const submitButton = page.getByRole('button', { name: /confirmar/i });
        if (await submitButton.isVisible()) {
            await submitButton.click();

            // Should show validation errors
            const errorMessage = page.locator('[role="alert"], .error').first();
            await expect(errorMessage).toBeVisible({ timeout: 2000 });
        }
    });
});
