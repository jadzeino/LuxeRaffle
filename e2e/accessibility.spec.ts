import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { gotoHomeWithRaffles } from './helpers';

test('homepage has no serious automated accessibility violations', async ({
  page,
}) => {
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
