/**
 * 02-simulado-completo.spec.ts
 * ----------------------------
 * Verifies that a full 180-question simulado can be completed and reaches
 * the results screen without errors.
 *
 * Uses E2E_MODE=1 so questions are stub responses (fast + free).
 */

import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('Simulado Completo', () => {
  test.setTimeout(120_000); // Full mock takes longer

  test('simulado completo: 180 questões → tela de resultado', async ({ page }) => {
    await loginAs(page, 'premium');

    // Navigate to mock exam — look for "Simulado" or "Completo" button
    const simuladoBtn = page
      .getByRole('button')
      .filter({ hasText: /simulado/i })
      .first();
    await simuladoBtn.click();

    // Expect a "Completo" or "180" option to appear
    const fullBtn = page
      .getByRole('button')
      .filter({ hasText: /completo|180/i })
      .first();
    if (await fullBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await fullBtn.click();
    }

    // First question should load
    await expect(page.getByText(/questão\s*1/i)).toBeVisible({ timeout: 20_000 });

    // Answer all 180 questions by always picking first option
    for (let i = 0; i < 180; i++) {
      // Pick first option button
      const opts = page.locator('button').filter({ hasText: /^[A-E][\s\).]|Alternativa/ });
      const firstOpt = opts.first();
      if (await firstOpt.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await firstOpt.click();
      }

      // Click next/finish
      const nextBtn = page
        .getByRole('button')
        .filter({ hasText: /próxima|finalizar|concluir/i })
        .first();
      if (await nextBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
        await nextBtn.click();
      }

      // Short wait to avoid race condition between renders
      await page.waitForTimeout(50);

      // If results screen appears early, we're done
      const resultsVisible = await page
        .getByText(/resultado|acertos/i)
        .first()
        .isVisible({ timeout: 1_000 })
        .catch(() => false);
      if (resultsVisible) break;
    }

    // Results screen must appear
    await expect(
      page.getByText(/resultado|acertos|nota/i).first()
    ).toBeVisible({ timeout: 15_000 });

    // No error toast
    await expect(page.getByText(/não foi possível carregar/i)).not.toBeVisible();
  });
});
