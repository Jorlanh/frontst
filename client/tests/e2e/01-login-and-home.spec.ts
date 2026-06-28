/**
 * 01-login-and-home.spec.ts
 * --------------------------
 * Verifies:
 * - Login flow works end-to-end
 * - Home screen renders with expected sections
 * - Starting a practice and cancelling returns to home without a stuck overlay
 *
 * Uses E2E_MODE=1 on the server so no real OpenAI calls are made.
 */

import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('Login e Home', () => {
  test('login como premium → home carrega sem erro', async ({ page }) => {
    await loginAs(page, 'premium');

    // Core home elements visible
    await expect(page.getByText('Gerador Infinito')).toBeVisible();

    // No error messages
    await expect(page.getByText(/erro ao carregar/i)).not.toBeVisible();
    await expect(page.getByText(/não foi possível/i)).not.toBeVisible();
  });

  test('iniciar prática → questão aparece → cancelar → home sem overlay preso', async ({ page }) => {
    await loginAs(page, 'premium');

    // Start a practice session (click any subject area button)
    const subjectBtn = page.getByRole('button').filter({ hasText: /exatas/i }).first();
    await subjectBtn.click();

    // Question loads
    await expect(page.getByText(/questão\s*1/i)).toBeVisible({ timeout: 15_000 });

    // Cancel practice
    const cancelBtn = page.getByRole('button', { name: /cancelar/i });
    await cancelBtn.click();

    // Back to home — no stuck loading overlay
    await expect(page.getByText('Gerador Infinito')).toBeVisible({ timeout: 5_000 });
    await expect(page.getByText(/preparando/i)).not.toBeVisible();
    await expect(page.getByText(/carregando/i)).not.toBeVisible();
  });

  test('home exibe áreas de conhecimento corretas', async ({ page }) => {
    await loginAs(page, 'premium');

    // ENEM knowledge areas should be listed
    await expect(page.getByText(/exatas/i).first()).toBeVisible();
    await expect(page.getByText(/linguagens/i).first()).toBeVisible();
  });
});
