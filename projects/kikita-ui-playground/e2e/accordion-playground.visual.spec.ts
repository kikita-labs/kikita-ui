import type { Locator, Page } from '@playwright/test';

import { expectNoAxeViolations } from './support/axe';
import { expect, test } from './support/fixtures';

const desktopViewport = { width: 1440, height: 1000 };
const tabletViewport = { width: 768, height: 1024 };
const mobileViewport = { width: 320, height: 844 };

const appearanceSizePairs = [
  { appearance: 'Default', size: 'Extra small (xs)', appearanceValue: 'default', sizeValue: 'xs' },
  { appearance: 'Default', size: 'Small (sm)', appearanceValue: 'default', sizeValue: 'sm' },
  { appearance: 'Default', size: 'Medium (md)', appearanceValue: 'default', sizeValue: 'md' },
  { appearance: 'Default', size: 'Large (lg)', appearanceValue: 'default', sizeValue: 'lg' },
  {
    appearance: 'Bordered',
    size: 'Extra small (xs)',
    appearanceValue: 'bordered',
    sizeValue: 'xs',
  },
  { appearance: 'Bordered', size: 'Small (sm)', appearanceValue: 'bordered', sizeValue: 'sm' },
  { appearance: 'Bordered', size: 'Medium (md)', appearanceValue: 'bordered', sizeValue: 'md' },
  { appearance: 'Bordered', size: 'Large (lg)', appearanceValue: 'bordered', sizeValue: 'lg' },
  { appearance: 'Ghost', size: 'Extra small (xs)', appearanceValue: 'ghost', sizeValue: 'xs' },
  { appearance: 'Ghost', size: 'Small (sm)', appearanceValue: 'ghost', sizeValue: 'sm' },
  { appearance: 'Ghost', size: 'Medium (md)', appearanceValue: 'ghost', sizeValue: 'md' },
  { appearance: 'Ghost', size: 'Large (lg)', appearanceValue: 'ghost', sizeValue: 'lg' },
] as const;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/accordion');
});

test('server-renders and hydrates the Accordion page without browser errors', async ({ page }) => {
  const response = await page.request.get('/components/accordion');

  expect(response.ok()).toBe(true);

  const serverMarkup = await response.text();
  expect(serverMarkup).toContain('Accordion');
  expect(serverMarkup).toContain('Account settings');

  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });
  page.on('pageerror', (error) => consoleErrors.push(error.message));

  await page.goto('/components/accordion');
  await expect(page.getByRole('heading', { level: 1, name: 'Accordion' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Account settings', exact: true })).toBeVisible();
  expect(consoleErrors).toEqual([]);
});

test('has no automated accessibility violations when collapsed or expanded', async ({ page }) => {
  await expectNoAxeViolations(page);

  const example = page.getByRole('group', {
    name: 'Default accordion example',
    exact: true,
  });
  await example.getByRole('button', { name: 'Account settings', exact: true }).click();

  await expectNoAxeViolations(page);
});

test('loads the Accordion scope and switches its accessible names to Russian', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/accordion/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const translations = (await localeResponse.json()) as {
    title: string;
    accessibility: { default: string; interactions: string; exclusive: string };
    headers: { default: string; account: string };
    status: { openItems: string; none: string };
  };

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(
    page.getByRole('heading', { level: 1, name: translations.title, exact: true }),
  ).toBeVisible();
  const defaultExample = page.getByRole('group', {
    name: translations.accessibility.default,
    exact: true,
  });
  await expect(defaultExample).toBeVisible();
  await expect(
    defaultExample.getByRole('button', { name: translations.headers.default, exact: true }),
  ).toBeVisible();

  const interactions = page.getByRole('group', {
    name: translations.accessibility.interactions,
    exact: true,
  });
  const exclusive = interactions.getByRole('group', {
    name: translations.accessibility.exclusive,
    exact: true,
  });
  const account = exclusive.getByRole('button', {
    name: translations.headers.account,
    exact: true,
  });
  const status = exclusive.getByRole('status');

  await expect(status).toHaveText(
    statusTextPattern(translations.status.openItems, [translations.status.none]),
  );
  await account.click();
  await expect(account).toHaveAttribute('aria-expanded', 'true');
  await expect(status).toHaveText(
    statusTextPattern(translations.status.openItems, ['accordion-exclusive-account']),
  );
});

test('shows the minimally configured default with linked collapsed content @visual', async ({
  page,
}) => {
  const example = page.getByRole('group', {
    name: 'Default accordion example',
    exact: true,
  });
  const accordion = example.locator('kui-accordion');
  const trigger = example.getByRole('button', { name: 'Account settings', exact: true });
  const body = example.locator('[role="region"]');

  await expect(accordion).toHaveAttribute('data-kui-mode', 'exclusive');
  await expect(accordion).toHaveAttribute('data-kui-appearance', 'default');
  await expect(accordion).toHaveAttribute('data-kui-size', 'md');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(body).toHaveAttribute('id', /^kui-accordion-item-\d+-body$/);
  await expect
    .poll(async () => {
      const [controls, bodyId, triggerId, labelledBy] = await Promise.all([
        trigger.getAttribute('aria-controls'),
        body.getAttribute('id'),
        trigger.getAttribute('id'),
        body.getAttribute('aria-labelledby'),
      ]);

      return controls === bodyId && labelledBy === triggerId;
    })
    .toBe(true);
  await expect(body).toHaveAttribute('aria-hidden', 'true');
  await expect(body).toHaveAttribute('inert', '');
  await expectWorkspaceScreenshot(page, example, 'accordion-default-desktop.png');

  await captureMobile(page, example, 'accordion-default-320.png');
});

test('renders every supported appearance and size combination @visual', async ({ page }) => {
  const catalogue = page.getByRole('group', {
    name: 'Accordion appearance and size examples',
    exact: true,
  });

  await expect(catalogue.locator('kui-accordion')).toHaveCount(appearanceSizePairs.length);

  for (const { appearance, size, appearanceValue, sizeValue } of appearanceSizePairs) {
    const appearanceGroup = catalogue.getByRole('group', {
      name: `${appearance} appearance examples`,
      exact: true,
    });
    const variant = appearanceGroup.getByRole('group', {
      name: `${appearance}, ${size} example`,
      exact: true,
    });
    const accordion = variant.locator('kui-accordion');
    const trigger = variant.getByRole('button', {
      name: `${appearance}, ${size}`,
      exact: true,
    });

    await expect(accordion).toHaveAttribute('data-kui-appearance', appearanceValue);
    await expect(accordion).toHaveAttribute('data-kui-size', sizeValue);
    await expect(accordion).toHaveAttribute('data-kui-mode', 'exclusive');
    await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  }

  const defaultAppearance = catalogue.getByRole('group', {
    name: 'Default appearance examples',
    exact: true,
  });
  const extraSmallTrigger = defaultAppearance
    .getByRole('group', { name: 'Default, Extra small (xs) example', exact: true })
    .getByRole('button', { name: 'Default, Extra small (xs)', exact: true });
  const mediumTrigger = defaultAppearance
    .getByRole('group', { name: 'Default, Medium (md) example', exact: true })
    .getByRole('button', { name: 'Default, Medium (md)', exact: true });
  const [extraSmallMetrics, mediumMetrics] = await Promise.all([
    readTriggerMetrics(extraSmallTrigger),
    readTriggerMetrics(mediumTrigger),
  ]);

  expect(extraSmallMetrics).toEqual(mediumMetrics);
  await expectWorkspaceScreenshot(page, catalogue, 'accordion-appearance-size-desktop.png');

  await page.setViewportSize(tabletViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await expectWorkspaceScreenshot(page, catalogue, 'accordion-appearance-size-768.png');

  await captureAppearanceMatrixMobile(page, catalogue);
});

test('uses native keyboard activation for exclusive items and exposes model changes @visual', async ({
  page,
}) => {
  const exclusive = page.getByRole('group', { name: 'Exclusive mode interaction', exact: true });
  const account = exclusive.getByRole('button', { name: 'Account', exact: true });
  const privacy = exclusive.getByRole('button', { name: 'Privacy', exact: true });
  const status = exclusive.getByRole('status');
  const accountBody = exclusive.locator('[role="region"]').nth(0);
  const privacyBody = exclusive.locator('[role="region"]').nth(1);

  await expect(status).toHaveText(statusTextPattern('Open items', ['None']));
  await tabTo(page, account);
  await expect(account).toBeFocused();
  expect(await account.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expectWorkspaceScreenshot(page, exclusive, 'accordion-exclusive-focus-desktop.png');

  await page.keyboard.press('Space');
  await expect(account).toHaveAttribute('aria-expanded', 'true');
  await expect(accountBody).not.toHaveAttribute('aria-hidden');
  await expect(accountBody).not.toHaveAttribute('inert');
  await expect(status).toHaveText(statusTextPattern('Open items', ['accordion-exclusive-account']));
  await expectWorkspaceScreenshot(page, exclusive, 'accordion-exclusive-account-open.png');

  await page.keyboard.press('Tab');
  await expect(privacy).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(account).toHaveAttribute('aria-expanded', 'false');
  await expect(privacy).toHaveAttribute('aria-expanded', 'true');
  await expect(accountBody).toHaveAttribute('aria-hidden', 'true');
  await expect(accountBody).toHaveAttribute('inert', '');
  await expect(privacyBody).not.toHaveAttribute('aria-hidden');
  await expect(status).toHaveText(statusTextPattern('Open items', ['accordion-exclusive-privacy']));
  await expectWorkspaceScreenshot(page, exclusive, 'accordion-exclusive-replacement.png');

  await page.keyboard.press('Space');
  await expect(privacy).toHaveAttribute('aria-expanded', 'false');
  await expect(status).toHaveText(statusTextPattern('Open items', ['None']));
});

test('multi mode keeps independent panels open and updates the model output @visual', async ({
  page,
}) => {
  const multi = page.getByRole('group', { name: 'Multi mode interaction', exact: true });
  const profile = multi.getByRole('button', { name: 'Profile', exact: true });
  const billing = multi.getByRole('button', { name: 'Billing', exact: true });
  const status = multi.getByRole('status');

  await profile.click();
  await expect(profile).toHaveAttribute('aria-expanded', 'true');
  await expect(status).toHaveText(statusTextPattern('Open items', ['accordion-multi-profile']));

  await billing.click();
  await expect(profile).toHaveAttribute('aria-expanded', 'true');
  await expect(billing).toHaveAttribute('aria-expanded', 'true');
  await expect(status).toHaveText(
    statusTextPattern('Open items', ['accordion-multi-profile', 'accordion-multi-billing']),
  );
  await expectWorkspaceScreenshot(page, multi, 'accordion-multi-two-open-desktop.png');

  await profile.click();
  await expect(profile).toHaveAttribute('aria-expanded', 'false');
  await expect(billing).toHaveAttribute('aria-expanded', 'true');
  await expect(status).toHaveText(statusTextPattern('Open items', ['accordion-multi-billing']));

  await page.setViewportSize(mobileViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await profile.click();
  await expectWorkspaceScreenshot(page, multi, 'accordion-multi-two-open-320.png');
});

test('disabled items are named, out of tab order, and visually distinct @visual', async ({
  page,
}) => {
  const states = page.getByRole('group', {
    name: 'Accordion item state and icon examples',
    exact: true,
  });
  const disabledExample = states.getByRole('group', { name: 'Disabled item example', exact: true });
  const available = disabledExample.getByRole('button', { name: 'Available section', exact: true });
  const disabled = disabledExample.getByRole('button', { name: 'Disabled section', exact: true });
  const iconExample = states.getByRole('group', {
    name: 'Custom icon template example',
    exact: true,
  });
  const iconTrigger = iconExample.getByRole('button', { name: 'Workspace', exact: true });

  await expect(disabled).toHaveAttribute('aria-disabled', 'true');
  await expect(disabled).toHaveAttribute('tabindex', '-1');
  await expect(disabled).toHaveAttribute('aria-expanded', 'false');
  await expect(
    disabled.evaluate((element) => getComputedStyle(element).pointerEvents),
  ).resolves.toBe('none');
  await expect(disabledExample.locator('[role="region"]').nth(1)).toHaveAttribute(
    'aria-hidden',
    'true',
  );

  await expect(iconExample.locator('kui-icon')).toHaveAttribute('aria-hidden', 'true');
  await expect(iconTrigger).toHaveAttribute('aria-expanded', 'false');
  await expectWorkspaceScreenshot(page, states, 'accordion-item-states-desktop.png');

  await tabTo(page, available);
  await page.keyboard.press('Tab');
  await expect(iconTrigger).toBeFocused();
  await expect(disabled).not.toBeFocused();

  await captureMobile(page, states, 'accordion-item-states-320.png');
});

test('shows real focus-visible and pointer hover on an Accordion trigger @visual', async ({
  page,
}) => {
  const defaultExample = page.getByRole('group', {
    name: 'Default accordion example',
    exact: true,
  });
  const trigger = defaultExample.getByRole('button', { name: 'Account settings', exact: true });

  await tabTo(page, trigger);
  await expect(trigger).toBeFocused();
  expect(await trigger.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expectWorkspaceScreenshot(page, defaultExample, 'accordion-default-focus-desktop.png');

  await trigger.evaluate((element) => element.blur());
  await expectWorkspaceScreenshot(
    page,
    defaultExample,
    'accordion-default-hover-desktop.png',
    async () => {
      await trigger.hover();
      expect(await trigger.evaluate((element) => element.matches(':hover'))).toBe(true);
    },
  );

  await page.setViewportSize(mobileViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await expectWorkspaceScreenshot(
    page,
    defaultExample,
    'accordion-default-hover-320.png',
    async () => {
      await trigger.hover();
      expect(await trigger.evaluate((element) => element.matches(':hover'))).toBe(true);
    },
  );
});

test('removes Accordion transitions when reduced motion is requested', async ({ page }) => {
  const trigger = page
    .getByRole('group', { name: 'Default accordion example', exact: true })
    .getByRole('button', { name: 'Account settings', exact: true });
  const body = page
    .getByRole('group', { name: 'Default accordion example', exact: true })
    .locator('[role="region"]');

  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await expect
    .poll(() => body.evaluate((element) => getComputedStyle(element).transitionProperty))
    .not.toBe('none');

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect
    .poll(() => body.evaluate((element) => getComputedStyle(element).transitionProperty))
    .toBe('none');

  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
});

async function captureMobile(page: Page, example: Locator, screenshotName: string): Promise<void> {
  await page.setViewportSize(mobileViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await expectWorkspaceScreenshot(page, example, screenshotName);
}

async function captureAppearanceMatrixMobile(page: Page, catalogue: Locator): Promise<void> {
  await page.setViewportSize(mobileViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);

  for (const appearance of ['Default', 'Bordered', 'Ghost']) {
    const group = catalogue.getByRole('group', {
      name: `${appearance} appearance examples`,
      exact: true,
    });

    await expectWorkspaceScreenshot(
      page,
      group,
      `accordion-appearance-size-${appearance.toLowerCase()}-320.png`,
    );
  }
}

async function expectWorkspaceScreenshot(
  page: Page,
  target: Locator,
  screenshotName: string,
  prepareCapture?: () => Promise<void>,
): Promise<void> {
  const workspace = page.locator('.playground-shell__workspace');
  const targetHandle = await target.elementHandle();
  if (!targetHandle) throw new Error('The Accordion example should exist before capturing it.');

  await page.evaluate(() => window.scrollTo(0, 0));
  await workspace.evaluate((element, targetElement) => {
    element.scrollTop = 0;
    const workspaceTop = element.getBoundingClientRect().top;
    const targetTop = targetElement.getBoundingClientRect().top;
    element.scrollTop += targetTop - workspaceTop;
  }, targetHandle);

  await expect
    .poll(() =>
      workspace.evaluate((element, targetElement) => {
        const workspaceBounds = element.getBoundingClientRect();
        const targetBounds = targetElement.getBoundingClientRect();

        return (
          targetBounds.top >= workspaceBounds.top - 1 &&
          targetBounds.top < workspaceBounds.bottom &&
          targetBounds.left >= workspaceBounds.left - 1 &&
          targetBounds.right <= workspaceBounds.right + 1
        );
      }, targetHandle),
    )
    .toBe(true);

  await prepareCapture?.();
  await expect(target).toHaveScreenshot(screenshotName, { animations: 'disabled' });
}

async function collapseMobileSidebar(page: Page): Promise<void> {
  const navigation = page.getByRole('navigation', {
    name: 'Component navigation',
    exact: true,
  });

  for (const category of ['Actions', 'Surfaces']) {
    const toggle = navigation.getByRole('button', { name: category, exact: true });

    if ((await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click();
  }

  await navigation.getByRole('button', { name: 'Actions', exact: true }).scrollIntoViewIfNeeded();
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}

async function readTriggerMetrics(
  trigger: Locator,
): Promise<{ minHeight: string; fontSize: string }> {
  return trigger.evaluate((element) => {
    const style = getComputedStyle(element);

    return { minHeight: style.minHeight, fontSize: style.fontSize };
  });
}

function statusTextPattern(label: string, values: string[]): RegExp {
  const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const valuePattern = values.map(escapeRegex).join('\\s*,\\s*');

  return new RegExp(`^${escapeRegex(label)}:\\s*${valuePattern}\\s*$`);
}

async function tabTo(page: Page, target: Locator): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;

    await page.keyboard.press('Tab');
  }

  throw new Error('Keyboard navigation did not reach the named Accordion trigger.');
}
