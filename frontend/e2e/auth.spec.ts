import { test, expect } from '@playwright/test';

/**
 * E2E Tests - Authentication Flow with Clerk
 */

test.describe('Authentication', () => {
    test('should display sign in button when not authenticated', async ({ page }) => {
        await page.goto('/');

        // Look for sign in button
        const signInButton = page.getByRole('button', { name: /iniciar sesión|sign in/i });
        await expect(signInButton).toBeVisible();
    });

    test('should open Clerk sign in modal', async ({ page }) => {
        await page.goto('/');

        // Click sign in button
        const signInButton = page.getByRole('button', { name: /iniciar sesión|sign in/i });
        await signInButton.click();

        // Wait for Clerk modal to appear
        await page.waitForSelector('[data-clerk-modal]', { timeout: 5000 });

        // Verify modal is visible
        const modal = page.locator('[data-clerk-modal]');
        await expect(modal).toBeVisible();
    });

    test('should show validation error for invalid email', async ({ page }) => {
        await page.goto('/');

        // Open sign in modal
        const signInButton = page.getByRole('button', { name: /iniciar sesión|sign in/i });
        await signInButton.click();

        // Wait for email input
        const emailInput = page.locator('input[type="email"], input[name="email"]').first();
        await emailInput.waitFor({ state: 'visible', timeout: 5000 });

        // Enter invalid email
        await emailInput.fill('invalid-email');

        // Try to submit
        const submitButton = page.getByRole('button', { name: /continuar|continue/i });
        await submitButton.click();

        // Check for error message
        const errorMessage = page.locator('[role="alert"], .error, [class*="error"]').first();
        await expect(errorMessage).toBeVisible({ timeout: 3000 });
    });

    test('should redirect to dashboard after successful login', async ({ page, context }) => {
        // Note: This test requires valid test credentials
        // In real scenarios, use test user credentials or mock Clerk

        test.skip(true, 'Requires valid Clerk test credentials');

        await page.goto('/');

        // Click sign in
        await page.getByRole('button', { name: /iniciar sesión/i }).click();

        // Fill credentials (use test env variables)
        const emailInput = page.locator('input[type="email"]').first();
        await emailInput.fill(process.env.TEST_USER_EMAIL || 'test@example.com');

        const passwordInput = page.locator('input[type="password"]').first();
        await passwordInput.fill(process.env.TEST_USER_PASSWORD || 'testpassword');

        // Submit
        await page.getByRole('button', { name: /continuar|continue/i }).click();

        // Wait for redirect
        await page.waitForURL(/\/dashboard/, { timeout: 10000 });

        // Verify dashboard loaded
        await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
    });

    test('should logout successfully', async ({ page }) => {
        test.skip(true, 'Requires authenticated session');

        // Assume user is already logged in
        await page.goto('/dashboard');

        // Find and click logout button
        const logoutButton = page.getByRole('button', { name: /cerrar sesión|logout/i });
        await logoutButton.click();

        // Verify redirected to home
        await expect(page).toHaveURL('/');

        // Verify sign in button is visible again
        const signInButton = page.getByRole('button', { name: /iniciar sesión/i });
        await expect(signInButton).toBeVisible();
    });
});

test.describe('User Profile', () => {
    test.beforeEach(async ({ page }) => {
        // Skip if not authenticated
        test.skip(true, 'Requires authenticated session');
    });

    test('should display user profile', async ({ page }) => {
        await page.goto('/dashboard');

        // Click on user menu
        const userMenu = page.getByRole('button', { name: /perfil|profile/i });
        await userMenu.click();

        // Verify profile info is visible
        const profileSection = page.locator('[data-testid="user-profile"]');
        await expect(profileSection).toBeVisible();
    });

    test('should update user preferences', async ({ page }) => {
        await page.goto('/dashboard');

        // Navigate to settings
        await page.getByRole('link', { name: /configuración|settings/i }).click();

        // Toggle a preference
        const notificationToggle = page.getByRole('switch', { name: /notificaciones/i });
        await notificationToggle.click();

        // Save changes
        await page.getByRole('button', { name: /guardar/i }).click();

        // Verify success message
        const successMessage = page.getByText(/guardado|saved/i);
        await expect(successMessage).toBeVisible({ timeout: 3000 });
    });
});
