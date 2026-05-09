import { expect, type Page } from '@playwright/test';

export async function gotoHomeWithRaffles(page: Page) {
  const addButton = page
    .getByRole('button', { name: /add .* ticket to cart/i })
    .first();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    await page.goto('/');

    try {
      await expect(addButton).toBeVisible({ timeout: 10_000 });
      return;
    } catch (error) {
      if (attempt === 2) {
        throw error;
      }
    }
  }
}
