import { expect, test } from '@playwright/test';
import { gotoHomeWithRaffles } from './helpers';

// Cart page streams CartLines after getRaffles resolves. The mock API adds
// 1–4 s of random latency and retries up to 3× (0/300/800 ms backoff), so
// worst-case load time is ~13 s. Give each cart test enough room on top of
// the homepage load and add-to-cart round trips.
test.setTimeout(60_000);

test('empty cart shows the garage-waiting state', async ({ page }) => {
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: /your garage is waiting/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /browse raffles/i })).toBeVisible();
});

test('add a ticket and verify the cart page shows the line item', async ({ page }) => {
  await gotoHomeWithRaffles(page);

  await page.getByRole('button', { name: /add .* ticket to cart/i }).first().click();
  await expect(page.getByLabel(/cart with 1 ticket/i)).toBeVisible();

  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: /review your entries/i })).toBeVisible();
  await expect(page.getByRole('listitem').first()).toBeVisible();
});

test('increase and decrease quantity via cart controls', async ({ page }) => {
  await gotoHomeWithRaffles(page);
  await page.getByRole('button', { name: /add .* ticket to cart/i }).first().click();
  // Wait for the server action to complete and set the cart cookie before navigating.
  await expect(page.getByLabel(/cart with 1 ticket/i)).toBeVisible();
  await page.goto('/cart');

  const increaseBtn = page.getByRole('button', { name: /increase quantity/i }).first();
  const decreaseBtn = page.getByRole('button', { name: /decrease quantity/i }).first();
  const quantityDisplay = page.locator('[aria-label="Item quantity"]').first();

  // CartLines streams in after getRaffles resolves (1–13 s with retries).
  await expect(quantityDisplay).toHaveText('1', { timeout: 15_000 });

  await increaseBtn.click();
  await expect(quantityDisplay).toHaveText('2', { timeout: 15_000 });

  await decreaseBtn.click();
  await expect(quantityDisplay).toHaveText('1', { timeout: 15_000 });

  // Decrease button is disabled at quantity 1 — cannot go below 1.
  await expect(decreaseBtn).toBeDisabled();
});

test('removing the only cart item shows the empty state', async ({ page }) => {
  await gotoHomeWithRaffles(page);
  await page.getByRole('button', { name: /add .* ticket to cart/i }).first().click();
  // Wait for the server action to complete and set the cart cookie before navigating.
  await expect(page.getByLabel(/cart with 1 ticket/i)).toBeVisible();
  await page.goto('/cart');

  const removeBtn = page.getByRole('button', { name: /remove .* from cart/i }).first();
  // Wait for CartLines to finish streaming before clicking.
  await expect(removeBtn).toBeVisible({ timeout: 15_000 });
  await removeBtn.click();

  await expect(page.getByRole('heading', { name: /your garage is waiting/i })).toBeVisible();
});

test('"in cart (N)" button state persists after router refresh', async ({ page }) => {
  await gotoHomeWithRaffles(page);

  await page.getByRole('button', { name: /add .* ticket to cart/i }).first().click();

  // After router.refresh() the server re-sends quantityInCart=1 and the
  // button aria-label switches to "<name> — 1 in cart, click to add more".
  await expect(
    page.getByRole('button', { name: /1 in cart, click to add more/i }).first(),
  ).toBeVisible();
});

test('cart badge updates immediately after adding a second ticket', async ({ page }) => {
  await gotoHomeWithRaffles(page);

  const addButtons = page.getByRole('button', { name: /add .* ticket to cart/i });

  await addButtons.first().click();
  await expect(page.getByLabel(/cart with 1 ticket/i)).toBeVisible();

  // Add a second different raffle if one is available.
  const secondBtn = addButtons.nth(1);
  if (await secondBtn.isVisible()) {
    await secondBtn.click();
    await expect(page.getByLabel(/cart with 2 tickets/i)).toBeVisible();
  }
});
