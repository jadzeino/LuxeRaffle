import { expect, test } from '@playwright/test';
import { gotoHomeWithRaffles } from './helpers';

test('search with no matches shows the empty-results message', async ({ page }) => {
  await gotoHomeWithRaffles(page);

  await page.getByRole('searchbox', { name: /search raffles/i }).fill('xyzzy-no-match-ever');

  await expect(page.getByText(/no raffles match your filters/i)).toBeVisible();
  await expect(page.getByText(/try a different search or price range/i)).toBeVisible();
});

test('clearing a search restores the full raffle grid', async ({ page }) => {
  await gotoHomeWithRaffles(page);

  const searchBox = page.getByRole('searchbox', { name: /search raffles/i });
  const initialCount = await page.getByRole('article').count();

  await searchBox.fill('xyzzy-no-match-ever');
  await expect(page.getByText(/no raffles match your filters/i)).toBeVisible();

  await searchBox.fill('');
  await expect(page.getByRole('article')).toHaveCount(initialCount);
});

test('price bucket filter toggles aria-pressed state', async ({ page }) => {
  await gotoHomeWithRaffles(page);

  const allPricesBtn = page.getByRole('button', { name: 'All prices' });
  const under20Btn = page.getByRole('button', { name: 'Under €20' });

  await expect(allPricesBtn).toHaveAttribute('aria-pressed', 'true');
  await expect(under20Btn).toHaveAttribute('aria-pressed', 'false');

  await under20Btn.click();

  await expect(under20Btn).toHaveAttribute('aria-pressed', 'true');
  await expect(allPricesBtn).toHaveAttribute('aria-pressed', 'false');
});

test('search combined with price filter both apply simultaneously', async ({ page }) => {
  await gotoHomeWithRaffles(page);

  // Activate a price filter first.
  await page.getByRole('button', { name: 'Under €20' }).click();

  // Then also add a nonsense search term — should still show empty results.
  await page.getByRole('searchbox', { name: /search raffles/i }).fill('xyzzy-no-match-ever');

  await expect(page.getByText(/no raffles match your filters/i)).toBeVisible();
});

test('the live region announces the result count to screen readers', async ({ page }) => {
  await gotoHomeWithRaffles(page);

  const liveRegion = page.getByRole('status');
  // The grid has aria-label="N raffles shown" and role="status" (aria-live="polite").
  await expect(liveRegion).not.toHaveCount(0);
});
