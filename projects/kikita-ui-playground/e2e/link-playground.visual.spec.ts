import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { openWithHeldScripts, readDuplicateIds } from './support/ssr';

const TONES = ['Default', 'Muted', 'Primary', 'Success', 'Warning', 'Danger'] as const;

const UNDERLINES = [
  ['Always', 'always', 'underline'],
  ['On hover', 'hover', 'none'],
  ['None', 'none', 'none'],
] as const;

const SECTIONS = [
  ['Default link example', 'link-default'],
  ['Link tone and underline variants', 'link-tone-underline'],
  ['Link typography variants', 'link-typography'],
  ['Link host examples', 'link-hosts'],
  ['Link icon examples', 'link-icons'],
  ['External link examples', 'link-external'],
  ['Disabled link examples', 'link-disabled'],
  ['Inline link example', 'link-inline'],
] as const;

const ROUTE = '/components/link';

function group(page: Page, name: string): Locator {
  return page.getByRole('group', { name, exact: true });
}

function toneGroup(page: Page, tone: string): Locator {
  return group(page, 'Link tone and underline variants').getByRole('group', {
    name: `${tone} tone links`,
    exact: true,
  });
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  const widths = await page.evaluate(() => ({
    document: document.documentElement.scrollWidth,
    viewport: window.innerWidth,
  }));

  expect(widths.document).toBeLessThanOrEqual(widths.viewport);
}

async function waitForExternalHint(page: Page): Promise<void> {
  // The icons and the visually hidden hint are inserted only after hydration.
  await expect(
    group(page, 'External link examples').getByRole('link', {
      name: 'Automatic external (opens in a new tab)',
      exact: true,
    }),
  ).toBeVisible();
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto(ROUTE);
  await page.mouse.move(0, 0);
});

test('uses composed typography line height for anchor and button links', async ({ page }) => {
  const hosts = group(page, 'Link tone and underline variants');

  for (const selector of ['a[kuiLink]', 'button[kuiLink]']) {
    // Style-only assertions: the first link of each kind on the page is as good as any other.
    const link = page.locator(selector).first();
    await link.evaluate((element) => {
      const variant = element.getAttribute('data-kui-text-variant');
      (element as HTMLElement).style.setProperty(`--kui-type-${variant}-size`, '20px');
      (element as HTMLElement).style.setProperty(`--kui-type-${variant}-line-height`, '2');
      element.parentElement!.style.lineHeight = '64px';
    });
    await expect(link).toHaveCSS('font-size', '20px');
    await expect(link).toHaveCSS('line-height', '40px');
  }

  await expect(hosts).toBeVisible();
});

test('renders the heading and a minimal default link', async ({ page }) => {
  await expect(page.getByRole('heading', { level: 1, name: 'Link', exact: true })).toBeVisible();

  const link = group(page, 'Default link example').getByRole('link', {
    name: 'Read the documentation',
    exact: true,
  });

  await expect(link).toHaveAttribute('data-kui-tone', 'primary');
  await expect(link).toHaveAttribute('data-kui-underline', 'hover');
  await expect(link).toHaveAttribute('data-kui-text-variant', 'body');
  await expect(link).toHaveAttribute('href', '/components/link#link-playground-title');
  await expect(link).not.toHaveAttribute('rel');
  await expect(link).not.toHaveAttribute('aria-disabled');
});

test('renders every tone at every underline mode with the matching underline outcome', async ({
  page,
}) => {
  for (const tone of TONES) {
    const row = toneGroup(page, tone);

    await expect(row.getByRole('heading', { level: 3, name: tone, exact: true })).toBeVisible();

    for (const [label, underline, restDecoration] of UNDERLINES) {
      const link = row.getByRole('link', { name: label, exact: true });

      await expect(link).toHaveAttribute('data-kui-tone', tone.toLowerCase());
      await expect(link).toHaveAttribute('data-kui-underline', underline);
      await expect(link).toHaveCSS('text-decoration-line', restDecoration);
    }
  }
});

test('shrinks the rendered font size across the four inline typography roles', async ({ page }) => {
  const typography = group(page, 'Link typography variants');
  const roles = [
    ['Large body', 'body-lg'],
    ['Body', 'body'],
    ['Small body', 'body-sm'],
    ['Caption', 'caption'],
  ] as const;

  for (const host of ['link', 'button'] as const) {
    const sizes: number[] = [];

    for (const [label, variant] of roles) {
      const row = typography.getByRole('group', { name: `${label} links`, exact: true });
      const element = row.getByRole(host, {
        name: host === 'link' ? label : `${label} action`,
        exact: true,
      });

      await expect(element).toHaveAttribute('data-kui-text-variant', variant);
      sizes.push(await element.evaluate((node) => parseFloat(getComputedStyle(node).fontSize)));
    }

    expect(sizes[0]).toBeGreaterThan(sizes[1]);
    expect(sizes[1]).toBeGreaterThan(sizes[2]);
    expect(sizes[2]).toBeGreaterThan(sizes[3]);
  }
});

test('follows the anchor with Enter but not Space', async ({ page }) => {
  const hosts = group(page, 'Link host examples');
  const anchor = hosts.getByRole('link', { name: 'Anchor link', exact: true });

  // Keys pressed while the page is still hydrating are captured and replayed out of order, which
  // leaves the link ignoring Enter. Hydration has no observable end, so use a client-only reaction
  // as the readiness signal: the button counter only updates once the page is interactive.
  await hosts.getByRole('button', { name: 'Count action', exact: true }).click();
  await expect(hosts.getByRole('status')).toHaveText('Activated 1 times');

  await anchor.focus();
  await page.keyboard.press('Space');
  await expect(page).not.toHaveURL(/#link-playground-title$/);
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#link-playground-title$/);
});

test('activates the button host with Enter, Space, and a click', async ({ page }) => {
  const hosts = group(page, 'Link host examples');
  const button = hosts.getByRole('button', { name: 'Count action', exact: true });
  const status = hosts.getByRole('status');

  await expect(status).toHaveText('Activated 0 times');
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(status).toHaveText('Activated 1 times');
  await page.keyboard.press('Space');
  await expect(status).toHaveText('Activated 2 times');
  await button.click();
  await expect(status).toHaveText('Activated 3 times');
});

test('renders decorative start and end icons on anchor and button hosts', async ({ page }) => {
  const icons = group(page, 'Link icon examples');
  const expectations = [
    ['link', 'Download report', 1, 0],
    ['link', 'All updates', 0, 1],
    ['link', 'Download and continue', 1, 1],
    ['button', 'Save copy', 1, 0],
    ['button', 'Next step', 0, 1],
  ] as const;

  for (const [role, name, start, end] of expectations) {
    const host = icons.getByRole(role, { name, exact: true });

    await expect(host.locator('kui-icon.kui-link__icon-start svg')).toHaveCount(start);
    await expect(host.locator('kui-icon.kui-link__icon-end svg')).toHaveCount(end);
    await expect(host.locator('kui-icon[aria-hidden="true"]')).toHaveCount(start + end);
  }
});

test('handles external links automatically, explicitly, and with an opt-out', async ({ page }) => {
  await waitForExternalHint(page);

  const external = group(page, 'External link examples');
  const auto = external.getByRole('link', { name: /^Automatic external/ });
  const explicit = external.getByRole('link', { name: /^Explicit external/ });
  const withIcon = external.getByRole('link', { name: /^External with icon/ });
  const customRel = external.getByRole('link', { name: /^External with custom rel/ });
  const optOut = external.getByRole('link', { name: 'External opt-out', exact: true });

  await expect(auto).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(auto.locator('kui-link-external-icon')).toHaveCount(1);
  await expect(explicit).not.toHaveAttribute('target');
  await expect(explicit).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(explicit).toHaveAccessibleName('Explicit external (opens in a new tab)');
  await expect(explicit.locator('kui-link-external-icon')).toHaveCount(1);
  await expect(withIcon.locator('kui-link-external-icon')).toHaveCount(0);
  await expect(withIcon.locator('kui-icon.kui-link__icon-end svg')).toHaveCount(1);
  await expect(withIcon).toHaveAccessibleName('External with icon (opens in a new tab)');

  const rel = (await customRel.getAttribute('rel')) ?? '';
  expect(rel.split(' ').sort()).toEqual(['author', 'noopener', 'noreferrer']);

  await expect(optOut).toHaveAttribute('target', '_blank');
  await expect(optOut).not.toHaveAttribute('rel');
  await expect(optOut.locator('kui-link-external-icon')).toHaveCount(0);
});

test('opens an external link in a new tab with a real click', async ({ page }) => {
  await waitForExternalHint(page);

  const link = group(page, 'External link examples').getByRole('link', {
    name: /^Automatic external/,
  });
  const popupPromise = page.waitForEvent('popup');

  await link.click();

  const popup = await popupPromise;

  await expect(popup).toHaveURL(/\/components\/link#link-playground-title$/);
  await popup.close();
});

test('blocks disabled links and buttons from activation, focus order, and handlers', async ({
  page,
  browserName,
}) => {
  test.skip(
    browserName === 'webkit',
    'Safari skips links when Tab is pressed unless the user enables it, so keyboard focus never reaches the link.',
  );
  const disabled = group(page, 'Disabled link examples');
  const anchor = disabled.getByRole('link', { name: 'Disabled anchor', exact: true });
  const button = disabled.getByRole('button', { name: 'Disabled action', exact: true });
  const status = disabled.getByRole('status');

  await expect(anchor).toHaveAttribute('aria-disabled', 'true');
  await expect(anchor).toHaveAttribute('tabindex', '-1');
  await expect(anchor).not.toHaveAttribute('disabled');
  await expect(button).toBeDisabled();
  await expect(button).toHaveAttribute('aria-disabled', 'true');

  // A disabled anchor ignores the pointer (pointer-events: none), so press Enter on a
  // programmatically focused instance; the navigation must still be blocked.
  await anchor.focus();
  await expect(anchor).toBeFocused();
  await page.keyboard.press('Enter');
  await button.click({ force: true });

  await expect(status).toContainText('button 0');
  await expect(page).not.toHaveURL(/#link-playground-title$/);

  // Tab order: every disabled example is skipped, so focus leaves the External group straight
  // for the inline link that follows the Disabled group.
  await group(page, 'External link examples')
    .getByRole('link', { name: 'External opt-out', exact: true })
    .focus();
  await page.keyboard.press('Tab');
  await expect(
    group(page, 'Inline link example').getByRole('link', { name: 'release notes', exact: true }),
  ).toBeFocused();
});

// Library defect: the directive blocks the click with stopImmediatePropagation, but a consumer
// (click) listener declared on the same host is registered earlier and still runs. Enable this
// test when KuiLink stops consumer handlers on a disabled anchor.
test.fixme('does not run a consumer click handler on a disabled anchor', async ({ page }) => {
  const disabled = group(page, 'Disabled link examples');
  const anchor = disabled.getByRole('link', { name: 'Disabled anchor', exact: true });

  await anchor.focus();
  await page.keyboard.press('Enter');

  await expect(disabled.getByRole('status')).toContainText('anchor 0');
});

test('produces no color change on hover, focus, or press', async ({ page, browserName }) => {
  test.skip(
    browserName === 'webkit',
    'Safari skips links when Tab is pressed unless the user enables it, so keyboard focus never reaches the link.',
  );
  const link = toneGroup(page, 'Success').getByRole('link', { name: 'On hover', exact: true });
  const rest = await link.evaluate((node) => getComputedStyle(node).color);

  await link.hover();
  expect(await link.evaluate((node) => node.matches(':hover'))).toBe(true);
  await expect(link).toHaveCSS('text-decoration-line', 'underline');
  await expect(link).toHaveCSS('color', rest);

  await page.mouse.down();
  expect(await link.evaluate((node) => node.matches(':active'))).toBe(true);
  await expect(link).toHaveCSS('color', rest);
  await page.mouse.up();

  await page.mouse.move(0, 0);
  await toneGroup(page, 'Success').getByRole('link', { name: 'Always', exact: true }).focus();
  await page.keyboard.press('Tab');
  await expect(link).toBeFocused();
  expect(await link.evaluate((node) => node.matches(':focus-visible'))).toBe(true);
  await expect(link).toHaveCSS('color', rest);
  await expect(link).toHaveCSS('outline-style', 'solid');
});

test('switches the Link scope to Russian at runtime', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/link/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const translations = (await localeResponse.json()) as {
    title: string;
    accessibility: { default: string; hosts: string };
    labels: { default: string; anchorHost: string };
  };

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();

  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(
    page.getByRole('heading', { level: 1, name: translations.title, exact: true }),
  ).toBeVisible();
  await expect(
    group(page, translations.accessibility.default).getByRole('link', {
      name: translations.labels.default,
      exact: true,
    }),
  ).toBeVisible();
  await expect(group(page, translations.accessibility.hosts)).toBeVisible();
  await expect(group(page, 'Default link example')).toHaveCount(0);
});

for (const width of [320, 768, 1440]) {
  test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1200 });
    await page.goto(ROUTE);
    await expect(page.getByRole('heading', { level: 1, name: 'Link', exact: true })).toBeVisible();
    await waitForExternalHint(page);
    await expectNoHorizontalOverflow(page);
  });
}

test('renders on the server and hydrates the browser-only icons and hint', async ({ page }) => {
  const held = await openWithHeldScripts(page, ROUTE);

  expect(held.serverHtml).toMatch(/<h1[^>]*id="link-playground-title"[^>]*>\s*Link\s*<\/h1>/);
  expect(held.serverHtml).toContain('Automatic external');
  expect(held.serverHtml).not.toContain('kui-link__sr-only');
  expect(held.serverHtml).not.toContain('kui-link-external-icon');
  expect(held.serverHtml).not.toContain('kui-link__icon-start');

  held.release();
  await waitForExternalHint(page);
  await expect(
    group(page, 'Link icon examples').locator('kui-icon.kui-link__icon-start svg'),
  ).toHaveCount(3);
  expect(await readDuplicateIds(page)).toEqual([]);
});

for (const [name, file] of SECTIONS) {
  test(`captures ${name.toLowerCase()} at desktop @visual`, async ({ page }) => {
    await waitForExternalHint(page);

    const section = group(page, name);

    await section.scrollIntoViewIfNeeded();
    await expect(section).toHaveScreenshot(`${file}-desktop.png`, { animations: 'disabled' });
  });

  test(`captures ${name.toLowerCase()} at 320px @visual`, async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 1400 });
    await page.goto(ROUTE);
    await waitForExternalHint(page);

    const section = group(page, name);
    const card = page.getByRole('article').filter({ has: section });

    await card.scrollIntoViewIfNeeded();
    await expectNoHorizontalOverflow(page);
    await expect(card).toHaveScreenshot(`${file}-320.png`, { animations: 'disabled' });
  });
}

test('captures real keyboard focus on the underline-on-hover link @visual', async ({ page }) => {
  const row = toneGroup(page, 'Default');
  const link = row.getByRole('link', { name: 'On hover', exact: true });

  await group(page, 'Default link example').getByRole('link').focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');

  await expect(link).toBeFocused();
  expect(await link.evaluate((node) => node.matches(':focus-visible'))).toBe(true);
  await expect(row).toHaveScreenshot('link-focus-hover-underline.png', { animations: 'disabled' });
});

test('captures real keyboard focus ring on a link without underline @visual', async ({ page }) => {
  const row = toneGroup(page, 'Default');
  const link = row.getByRole('link', { name: 'None', exact: true });

  await group(page, 'Default link example').getByRole('link').focus();
  for (let index = 0; index < 3; index += 1) await page.keyboard.press('Tab');

  await expect(link).toBeFocused();
  expect(await link.evaluate((node) => node.matches(':focus-visible'))).toBe(true);
  await expect(row).toHaveScreenshot('link-focus-none-underline.png', { animations: 'disabled' });
});

test('captures real keyboard focus on the button host @visual', async ({ page }) => {
  const hosts = group(page, 'Link host examples');
  const button = hosts.getByRole('button', { name: 'Count action', exact: true });

  await hosts.getByRole('link', { name: 'Anchor link', exact: true }).focus();
  await page.keyboard.press('Tab');

  await expect(button).toBeFocused();
  expect(await button.evaluate((node) => node.matches(':focus-visible'))).toBe(true);
  await expect(hosts).toHaveScreenshot('link-focus-button.png', { animations: 'disabled' });
});

test('captures pointer hover and pressed link states @visual', async ({ page }) => {
  const row = toneGroup(page, 'Primary');
  const link = row.getByRole('link', { name: 'On hover', exact: true });

  await link.hover();
  expect(await link.evaluate((node) => node.matches(':hover'))).toBe(true);
  await expect(row).toHaveScreenshot('link-hover.png', { animations: 'disabled' });

  await page.mouse.down();
  expect(await link.evaluate((node) => node.matches(':active'))).toBe(true);
  await expect(row).toHaveScreenshot('link-pressed.png', { animations: 'disabled' });
  await page.mouse.up();
});

test('captures the button host after keyboard activation @visual', async ({ page }) => {
  const hosts = group(page, 'Link host examples');
  const button = hosts.getByRole('button', { name: 'Count action', exact: true });

  await button.focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Space');

  await expect(hosts.getByRole('status')).toHaveText('Activated 2 times');
  await expect(hosts).toHaveScreenshot('link-button-activated.png', { animations: 'disabled' });
});
