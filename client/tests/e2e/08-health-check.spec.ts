/**
 * 08-health-check.spec.ts
 * -----------------------
 * Smoke test: verifies the backend health endpoint is reachable
 * and the frontend loads without JS errors.
 */

import { test, expect } from '@playwright/test';

test.describe('Smoke — Health', () => {
  test('GET /api/health returns ok', async ({ request }) => {
    const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';
    // Derive backend URL from frontend — backend runs on port 4000
    const backendUrl = baseUrl.replace(':5173', ':4000');

    const res = await request.get(`${backendUrl}/api/health`);
    expect(res.status()).toBe(200);

    const body = await res.json();
    expect(body.status).toBe('ok');
  });

  test('frontend home page loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');

    // Wait for the page to settle
    await page.waitForLoadState('networkidle').catch(() => {});

    // Filter out non-critical / known 3rd-party errors
    const criticalErrors = errors.filter(
      e => !e.includes('ResizeObserver') && !e.includes('Non-Error promise')
    );

    expect(criticalErrors).toHaveLength(0);
  });

  test('e2eMode flag is set in CI', async ({ request }) => {
    const isCI = !!process.env.CI;
    if (!isCI) return; // only assert in CI

    const baseUrl = process.env.E2E_BASE_URL || 'http://localhost:5173';
    const backendUrl = baseUrl.replace(':5173', ':4000');

    const res = await request.get(`${backendUrl}/api/health`);
    const body = await res.json();
    expect(body.e2eMode).toBe(true);
  });
});
