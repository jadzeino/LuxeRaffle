import { expect, test } from '@playwright/test';

test('login with wrong password shows an error and echoes the email back', async ({ page }) => {
  await page.goto('/login');

  await page.getByLabel('Email').fill('jane.doe@gmail.com');
  await page.getByLabel('Password').fill('wrong-password');
  await page.getByRole('button', { name: /sign in/i }).click();

  // Error message must appear.
  await expect(page.getByRole('alert')).toBeVisible();

  // Email input must retain the submitted value so the user does not retype it.
  await expect(page.getByLabel('Email')).toHaveValue('jane.doe@gmail.com');

  // Both inputs must show the destructive ring (aria-invalid=true).
  await expect(page.getByLabel('Email')).toHaveAttribute('aria-invalid', 'true');
  await expect(page.getByLabel('Password')).toHaveAttribute('aria-invalid', 'true');
});

test('successful login redirects to the originally requested page', async ({ page }) => {
  // Navigate to account, get redirected to login with ?next=/account.
  await page.goto('/account');
  await expect(page).toHaveURL(/\/login/);

  await page.getByLabel('Email').fill('jane.doe@gmail.com');
  await page.getByLabel('Password').fill('applejuice');
  await page.getByRole('button', { name: /sign in/i }).click();

  await expect(page).toHaveURL(/\/account/);
});

test('unauthenticated access to /checkout redirects to login', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page).toHaveURL(/\/login/);
});

test('logout clears session and redirects to homepage', async ({ page }) => {
  // Log in first.
  await page.goto('/login');
  await page.getByLabel('Email').fill('jane.doe@gmail.com');
  await page.getByLabel('Password').fill('applejuice');
  await page.getByRole('button', { name: /sign in/i }).click();
  await expect(page).toHaveURL(/\/account/);

  // Log out.
  await page.getByRole('button', { name: /sign out/i }).click();
  await expect(page).toHaveURL('/');

  // Navigating back to /account must redirect to login again.
  await page.goto('/account');
  await expect(page).toHaveURL(/\/login/);
});
