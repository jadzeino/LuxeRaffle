import { expect, test } from '@playwright/test';
import { gotoHomeWithRaffles } from './helpers';

test('homepage remains usable on a mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await gotoHomeWithRaffles(page);

  await expect(
    page.getByRole('heading', { name: 'LuxeRaffle', level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole('link', { name: /view live raffles/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /add .* ticket to cart/i }).first()).toBeVisible();

  const hasHorizontalOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth,
  );

  expect(hasHorizontalOverflow).toBe(false);
});

test('raffle card primary actions can be operated from the keyboard', async ({
  page,
}) => {
  await gotoHomeWithRaffles(page);

  const addButton = page
    .getByRole('button', { name: /add .* ticket to cart/i })
    .first();
  await addButton.focus();
  await expect(addButton).toBeFocused();
  await page.keyboard.press('Enter');

  // After the server action + router.refresh(), the button aria-label switches
  // to "<name> — 1 in cart, click to add more".
  await expect(
    page.getByRole('button', { name: /1 in cart, click to add more/i }).first(),
  ).toBeVisible();

  const detailsLink = page.getByRole('link', { name: /view all raffles/i }).first();
  await detailsLink.focus();
  await expect(detailsLink).toBeFocused();
});
