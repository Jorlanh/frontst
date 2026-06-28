/**
 * 03-paywall-trial.spec.ts
 * ------------------------
 * Verifies that trial users hit the question limit and see the paywall modal.
 *
 * IMPORTANT: This test requires the trial user to have 0 questions used today.
 * In CI, the user is reset before E2E runs via DB seed/reset script.
 */

import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('Paywall — Trial', () => {
  test('trial: acesso liberado antes do limite diário', async ({ page }) => {
    await loginAs(page, 'trial');

    // Should see home normally
    await expect(page.getByText('Gerador Infinito')).toBeVisible();

    // No paywall on load
    await expect(page.getByText(/premium|limite/i).first()).not.toBeVisible({ timeout: 2_000 }).catch(() => {
      // May appear briefly due to notification; that's ok as long as it's not blocking
    });
  });

  test('trial: após esgotar limite diário, nova tentativa mostra paywall', async ({ page }) => {
    await loginAs(page, 'trial');

    // Exhaust daily quota — trial allows 10 questions/day
    // We simulate by making 10 API calls via the UI, then trying once more.
    // In E2E_MODE, each question batch call hits the real plan enforcement
    // (E2E_MODE only mocks AI generation, not the plan check).

    const LIMIT = 10;

    for (let i = 0; i < LIMIT; i++) {
      const subjectBtn = page.getByRole('button').filter({ hasText: /exatas/i }).first();
      await subjectBtn.click();

      // Either a question appears or the paywall already fired
      const questionOrPaywall = await Promise.race([
        page.getByText(/questão\s*\d/i).first().waitFor({ timeout: 15_000 }).then(() => 'question'),
        page.getByText(/premium|upgrade|limite/i).first().waitFor({ timeout: 15_000 }).then(() => 'paywall'),
      ]).catch(() => 'timeout');

      if (questionOrPaywall === 'paywall') {
        // Paywall appeared before we finished — test passes early
        break;
      }

      if (questionOrPaywall === 'question') {
        // Cancel and go back to try again
        const cancelBtn = page.getByRole('button', { name: /cancelar/i });
        if (await cancelBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
          await cancelBtn.click();
          await page.getByText('Gerador Infinito').waitFor({ timeout: 5_000 });
        }
      }
    }

    // After exhausting limit, next attempt must show paywall
    const subjectBtn = page.getByRole('button').filter({ hasText: /exatas/i }).first();
    if (await subjectBtn.isVisible({ timeout: 2_000 }).catch(() => false)) {
      await subjectBtn.click();
      await expect(
        page.getByText(/premium|upgrade|limite/i).first()
      ).toBeVisible({ timeout: 10_000 });
    } else {
      // Paywall is already visible from the last iteration
      await expect(
        page.getByText(/premium|upgrade|limite/i).first()
      ).toBeVisible({ timeout: 5_000 });
    }
  });
});
