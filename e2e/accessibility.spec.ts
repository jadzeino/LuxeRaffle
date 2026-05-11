import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { gotoHomeWithRaffles } from './helpers';

test('homepage has no serious automated accessibility violations', async ({
  page,
}) => {
  // Emulate reduced motion so the staggered card animations (opacity 0→1) are
  // skipped. Without this, axe scans during an in-progress animation and sees
  // blended colours on partially-transparent elements, producing false contrast
  // failures on text that is actually fully legible.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await gotoHomeWithRaffles(page);
  await expect(
    page.getByRole('heading', { name: 'LuxeRaffle', level: 1 }),
  ).toBeVisible();

  const accessibilityScanResults = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze();

  const seriousViolations = accessibilityScanResults.violations.filter(
    (violation) =>
      violation.impact === 'serious' || violation.impact === 'critical',
  );

  expect(seriousViolations).toEqual([]);
});
