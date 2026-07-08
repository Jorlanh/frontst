import { Page, expect } from '@playwright/test';

// ─── Test user credentials ─────────────────────────────────────────────────────
// These users must exist in the test/staging DB before E2E runs.
// In CI, they're created by the seed script (node prisma/seed.js creates them
// if E2E_SEED_USERS=1 is set).

const USERS = {
  premium: {
    email: process.env.E2E_PREMIUM_EMAIL || 'e2e.premium@studr.test',
    password: process.env.E2E_PASSWORD    || 'E2eTest@2026',
  },
  trial: {
    email: process.env.E2E_TRIAL_EMAIL   || 'e2e.trial@studr.test',
    password: process.env.E2E_PASSWORD   || 'E2eTest@2026',
  },
};

// ─── loginAs ─────────────────────────────────────────────────────────────────

export async function loginAs(page: Page, userType: keyof typeof USERS) {
  const user = USERS[userType];
  await page.goto('/');

  // If already on the app (session persisted), skip login
  const homeVisible = await page.getByText('Gerador Infinito').isVisible().catch(() => false);
  if (homeVisible) return;

  // Look for "Entrar" button on landing page
  const loginBtn = page.getByRole('button', { name: /entrar/i }).first();
  if (await loginBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
    await loginBtn.click();
  }

  await page.getByPlaceholder(/e-mail/i).fill(user.email);
  await page.getByPlaceholder(/senha/i).fill(user.password);
  await page.getByRole('button', { name: /entrar/i }).last().click();

  await expect(page.getByText('Gerador Infinito')).toBeVisible({ timeout: 10_000 });
}

// ─── answerCurrentQuestion ────────────────────────────────────────────────────

export async function answerCurrentQuestion(page: Page) {
  // Click the first answer option (usually A)
  const optionA = page.locator('[data-testid="option-0"], button').filter({ hasText: /^A[\s\)]|Alternativa A/ }).first();
  if (await optionA.isVisible({ timeout: 3000 }).catch(() => false)) {
    await optionA.click();
  } else {
    // Fallback: click first available answer button
    await page.locator('button').filter({ hasText: /^[A-E][\s\).]/ }).first().click();
  }
}
