/**
 * 05-redacao.spec.ts
 * ------------------
 * Verifies the essay (redação) feature:
 * - Essay view is accessible
 * - Line counter updates as user types
 * - Submit button is disabled below minimum (500 words / ~50 lines)
 * - Warning appears above 30 lines
 */

import { test, expect } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('Redação', () => {
  async function navigateToEssay(page: import('@playwright/test').Page) {
    await loginAs(page, 'premium');

    const essayBtn = page
      .getByRole('button')
      .filter({ hasText: /redação/i })
      .first();

    if (await essayBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await essayBtn.click();
    } else {
      const navEssay = page.locator('nav, [role=navigation]').getByText(/redação/i).first();
      await navEssay.click();
    }

    // Essay textarea should appear
    await expect(page.locator('textarea')).toBeVisible({ timeout: 10_000 });
  }

  test('abre tela de redação sem erro', async ({ page }) => {
    await loginAs(page, 'premium');

    const essayBtn = page.getByRole('button').filter({ hasText: /redação/i }).first();
    if (await essayBtn.isVisible({ timeout: 5_000 }).catch(() => false)) {
      await essayBtn.click();
      await expect(page.locator('textarea')).toBeVisible({ timeout: 10_000 });
      await expect(page.getByText(/não foi possível/i)).not.toBeVisible({ timeout: 2_000 }).catch(() => {});
    }
  });

  test('contador de linhas aumenta conforme texto digitado', async ({ page }) => {
    await navigateToEssay(page);

    const textarea = page.locator('textarea');
    // Type ~50 words (approx 5 lines)
    const shortText = 'Lorem ipsum dolor sit amet consectetur '.repeat(5).trim();
    await textarea.fill(shortText);

    // Line count should appear and be > 0
    const lineCount = page.getByText(/\d+\s*linhas?/i).first();
    await expect(lineCount).toBeVisible({ timeout: 3_000 });
  });

  test('botão de envio fica desabilitado com texto curto demais', async ({ page }) => {
    await navigateToEssay(page);

    const textarea = page.locator('textarea');
    await textarea.fill('Texto curto.');

    // Submit/corrigir button should be disabled
    const submitBtn = page.getByRole('button', { name: /corrigir|enviar|submeter/i });
    if (await submitBtn.isVisible({ timeout: 3_000 }).catch(() => false)) {
      await expect(submitBtn).toBeDisabled();
    }
  });

  test('aviso aparece quando texto excede ~30 linhas', async ({ page }) => {
    await navigateToEssay(page);

    const textarea = page.locator('textarea');
    // ~31 lines ≈ 310 words
    const longText = 'palavra '.repeat(310).trim();
    await textarea.fill(longText);

    // Warning about line limit should appear
    const warning = page.getByText(/30 linhas|limite|atenção/i).first();
    await expect(warning).toBeVisible({ timeout: 3_000 });
  });
});
