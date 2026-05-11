import { expect, test } from '@playwright/test';
import { gotoHomeWithRaffles } from './helpers';

// This test chains homepage → add → cart → login → checkout → account.
// Each step can hit the slow mock API (1–4 s random + 10% timeout/retry).
// Worst case per API call ≈ 13 s; with multiple calls budget 90 s total.
test.setTimeout(90_000);

test('login, add ticket, checkout, and view account orders', async ({ page }) => {
  await gotoHomeWithRaffles(page);
  await page.getByRole('button', { name: /add .* ticket to cart/i }).first().click();
  await expect(page.getByLabel(/cart with 1 tickets/i)).toBeVisible();

  await page.getByLabel(/cart with 1 tickets/i).click();
  await expect(page.getByRole('heading', { name: /review your entries/i })).toBeVisible();
  await page.getByRole('link', { name: /checkout/i }).click();

  await expect(page).toHaveURL(/\/login/);
  await page.getByLabel('Email').fill('jane.doe@gmail.com');
  await page.getByLabel('Password').fill('applejuice');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/checkout/);
  await page.getByRole('button', { name: /complete purchase/i }).click();
  // checkoutAction calls getFreshRaffles() + createOrder() — two mock API
  // calls each taking 1–4 s. Give the redirect enough room to happen.
  await expect(page).toHaveURL(/\/account/, { timeout: 15_000 });
  // OrdersSection streams in after getOrders + getRaffles resolve. The mock
  // API adds 1–4 s of random delay per request, so give Suspense time to settle.
  await expect(page.getByRole('heading', { name: /order history/i })).toBeVisible({ timeout: 15_000 });
});
