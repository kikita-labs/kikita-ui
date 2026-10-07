import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';

const desktopViewport = { width: 1440, height: 1000 };
const tabletViewport = { width: 768, height: 1024 };
const mobileViewport = { width: 320, height: 844 };
const mobileCatalogueViewport = { width: 320, height: 2048 };

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/avatar');
});

test('server-renders and hydrates the default avatar without browser errors', async ({ page }) => {
  const response = await page.request.get('/components/avatar');

  expect(response.ok()).toBe(true);

  const serverMarkup = await response.text();
  expect(serverMarkup).toContain('Avatar');
  expect(serverMarkup).toContain('aria-label="Avatar"');
  expect(serverMarkup).toContain('data-kui-size="md"');

  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/components/avatar');
  await expect(page.getByRole('heading', { level: 1, name: 'Avatar' })).toBeVisible();
  await expect(page.locator('#avatar-minimum-default kui-avatar')).toHaveAttribute(
    'aria-label',
    'Avatar',
  );
  expect(consoleErrors).toEqual([]);
});

test('captures the minimum default and content fallbacks @visual', async ({ page }) => {
  const content = page.getByRole('group', {
    name: 'Avatar default and content examples',
    exact: true,
  });
  const defaultAvatar = page.locator('#avatar-minimum-default kui-avatar');
  const image = content.locator('img');

  await expect(defaultAvatar).toHaveAttribute('data-kui-size', 'md');
  await expect(defaultAvatar).toHaveAttribute('data-kui-shape', 'circle');
  await expect(defaultAvatar).toHaveAttribute('aria-label', 'Avatar');
  await expect(content.locator('kui-avatar[aria-label="Taylor Morgan"]')).toHaveText('TM');
  await expect(content.locator('kui-avatar[aria-label="Luna Ivanova"]')).toHaveText('LU');
  await expect(image).toHaveAttribute('src', '/assets/avatar-example.svg');
  await expect(image).toHaveAttribute('alt', 'Illustrated profile avatar');
  await expect
    .poll(() => image.evaluate((element) => (element as HTMLImageElement).naturalWidth))
    .toBeGreaterThan(0);
  await expect(content).toHaveScreenshot('avatar-content-default-desktop.png', {
    animations: 'disabled',
  });

  await captureMobile(page, content, 'avatar-content-default-320.png');
});

test('captures every supported size and shape with stable fallback colors @visual', async ({
  page,
}) => {
  const matrix = page.getByRole('group', { name: 'Avatar shape and size examples', exact: true });
  const avatars = matrix.locator('kui-avatar');

  await expect(avatars).toHaveCount(12);
  await expect
    .poll(() =>
      avatars.evaluateAll((elements) =>
        elements.map((element) => ({
          size: element.getAttribute('data-kui-size'),
          shape: element.getAttribute('data-kui-shape'),
          role: element.getAttribute('role'),
        })),
      ),
    )
    .toEqual(
      ['circle', 'square'].flatMap((shape) =>
        ['xs', 'sm', 'md', 'lg', 'xl', '2xl'].map((size) => ({
          size,
          shape,
          role: 'img',
        })),
      ),
    );
  await expect(matrix).toHaveScreenshot('avatar-shape-size-desktop.png', {
    animations: 'disabled',
  });

  await captureMobile(page, matrix, 'avatar-shape-size-320.png');

  await page.setViewportSize(tabletViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await matrix.scrollIntoViewIfNeeded();
  await expect(matrix).toHaveScreenshot('avatar-shape-size-tablet-768.png', {
    animations: 'disabled',
  });
});

test('captures palette and presence states in both shell themes @visual', async ({ page }) => {
  const document = page.locator('html');
  const palette = page.getByRole('group', {
    name: 'Avatar fallback palette examples',
    exact: true,
  });
  const paletteAvatars = palette.locator('kui-avatar');

  await expect(document).toHaveAttribute('data-kui-theme', 'dark');
  await expect(paletteAvatars).toHaveCount(8);
  await expect
    .poll(() =>
      paletteAvatars.evaluateAll((items) => items.map((item) => item.dataset['kuiPalette'])),
    )
    .toEqual(['7', '1', '2', '3', '4', '5', '6', '7']);
  await expect(palette).toHaveScreenshot('avatar-palette-desktop.png', {
    animations: 'disabled',
  });

  const presence = page.getByRole('group', {
    name: 'Avatar presence status examples',
    exact: true,
  });
  const statusValues = ['online', 'away', 'busy', 'offline'];
  await expect(presence.locator('kui-avatar')).toHaveCount(statusValues.length);

  for (const status of statusValues) {
    const avatar = presence.locator(`kui-avatar[data-kui-status="${status}"]`);

    await expect(avatar).toHaveAttribute('aria-label', `Avery Jordan, ${status}`);
    await expect(avatar.locator('.kui-avatar__status')).toHaveAttribute('aria-hidden', 'true');
  }

  await expect(presence).toHaveScreenshot('avatar-presence-desktop.png', {
    animations: 'disabled',
  });
  await captureMobile(page, presence, 'avatar-presence-320.png');

  await page.setViewportSize(desktopViewport);
  const darkPaletteColor = await paletteAvatars
    .nth(1)
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  const darkStatusColor = await presence
    .locator('[data-kui-status="online"] .kui-avatar__status')
    .evaluate((element) => getComputedStyle(element).backgroundColor);

  await page.getByRole('button', { name: 'Switch to light theme', exact: true }).click();
  await expect(document).toHaveAttribute('data-kui-theme', 'light');
  await expect(
    page.getByRole('button', { name: 'Switch to dark theme', exact: true }),
  ).toHaveAttribute('aria-pressed', 'false');

  const lightPaletteColor = await paletteAvatars
    .nth(1)
    .evaluate((element) => getComputedStyle(element).backgroundColor);
  const lightStatusColor = await presence
    .locator('[data-kui-status="online"] .kui-avatar__status')
    .evaluate((element) => getComputedStyle(element).backgroundColor);

  expect(lightPaletteColor).not.toBe(darkPaletteColor);
  // The online dot is the success indicator, one brand colour in both themes.
  expect(lightStatusColor).toBe(darkStatusColor);
  await expect(palette).toHaveScreenshot('avatar-palette-light-desktop.png', {
    animations: 'disabled',
  });
  await expect(presence).toHaveScreenshot('avatar-presence-light-desktop.png', {
    animations: 'disabled',
  });
});

test('captures circle and square loading plus group size and limit behavior @visual', async ({
  page,
}) => {
  const loading = page.getByRole('group', { name: 'Avatar loading examples', exact: true });
  const skeletons = loading.locator('kui-avatar');

  await expect(skeletons).toHaveCount(2);
  await expect(skeletons.nth(0)).toHaveAttribute('data-kui-loading', '');
  await expect(skeletons.nth(0)).toHaveAttribute('data-kui-shape', 'circle');
  await expect(skeletons.nth(1)).toHaveAttribute('data-kui-shape', 'square');
  await expect(skeletons.nth(0)).not.toHaveAttribute('role');
  await expect(skeletons.nth(0).locator('[aria-hidden="true"]')).toHaveCount(2);
  await expect(loading).toHaveScreenshot('avatar-loading-desktop.png', {
    animations: 'disabled',
  });

  const groups = page.getByRole('group', { name: 'Avatar group examples', exact: true });
  const avatarGroups = groups.locator('kui-avatar-group');
  const groupSizes = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
  const groupLabels = [
    'Extra small group',
    'Small group',
    'Medium group',
    'Large group',
    'Extra large group',
    '2× large group',
  ];
  const overlapMargins = ['-5px', '-6px', '-8px', '-10px', '-12px', '-16px'];

  await expect(avatarGroups).toHaveCount(9);

  for (const [index, size] of groupSizes.entries()) {
    const avatarGroup = avatarGroups.nth(index);

    await expect(avatarGroup).toHaveAttribute('data-kui-size', size);
    await expect(avatarGroup).toHaveAttribute('aria-label', groupLabels[index]);
    await expect(avatarGroup.locator('kui-avatar').nth(1)).toHaveCSS(
      'margin-inline-start',
      overlapMargins[index],
    );
  }

  const defaultGroup = avatarGroups.nth(6);
  const customGroup = avatarGroups.nth(7);
  const noOverflowGroup = avatarGroups.nth(8);

  await expect(defaultGroup).toHaveAttribute('aria-label', 'Project team');
  await expect(defaultGroup).toHaveAttribute('role', 'group');
  await expect(defaultGroup).toHaveAttribute('data-kui-size', 'md');
  await expect(defaultGroup.locator('[role="img"][aria-label="1 more"]')).toHaveCount(1);
  await expect(customGroup).toHaveAttribute('data-kui-size', 'sm');
  await expect(customGroup).toHaveAttribute('data-kui-shape', 'square');
  await expect(customGroup.locator('[role="img"][aria-label="3 more"]')).toHaveCount(1);
  await expect(noOverflowGroup.locator('.kui-avatar--overflow')).toHaveCount(0);
  await expect(groups).toHaveScreenshot('avatar-groups-desktop.png', {
    animations: 'disabled',
  });

  await captureMobile(page, groups, 'avatar-groups-320.png');
});

test('captures real keyboard and pointer states for the documented button wrapper @visual', async ({
  page,
}) => {
  const interaction = page.getByRole('group', {
    name: 'Avatar inside a native button',
    exact: true,
  });
  const button = interaction.getByRole('button', {
    name: 'Open profile for Alex Rivera',
    exact: true,
  });

  await tabTo(page, button);
  await expect(button).toBeFocused();
  expect(await button.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(interaction).toHaveScreenshot('avatar-action-focus-desktop.png', {
    animations: 'disabled',
  });

  await button.evaluate((element) => (element as HTMLButtonElement).blur());
  await expect(button).not.toBeFocused();
  expect(await button.evaluate((element) => element.matches(':focus-visible'))).toBe(false);

  await button.hover();
  expect(await button.evaluate((element) => element.matches(':hover'))).toBe(true);
  expect(await button.evaluate((element) => element.matches(':focus-visible'))).toBe(false);
  await expect(interaction).toHaveScreenshot('avatar-action-hover-desktop.png', {
    animations: 'disabled',
  });

  await button.scrollIntoViewIfNeeded();
  const box = await button.boundingBox();
  if (!box) throw new Error('Expected the named Avatar action button to be visible.');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  expect(await button.evaluate((element) => element.matches(':active'))).toBe(true);
  expect(await button.evaluate((element) => element.matches(':focus-visible'))).toBe(false);
  await expect(interaction).toHaveScreenshot('avatar-action-active-desktop.png', {
    animations: 'disabled',
  });
  await page.mouse.move(box.x + box.width + 80, box.y + box.height / 2);
  await page.mouse.up();

  await button.click();
  await expect(page.getByRole('status')).toHaveText('Profile action activation count: 1');
  await expect(page.getByRole('status')).toHaveScreenshot('avatar-action-activated-desktop.png', {
    animations: 'disabled',
  });

  await page.setViewportSize(mobileViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await button.evaluate((element) => (element as HTMLButtonElement).blur());
  await tabTo(page, button);
  await expect(button).toBeFocused();
  expect(await button.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(interaction).toHaveScreenshot('avatar-action-focus-320.png', {
    animations: 'disabled',
  });
});

test.describe('touch input', () => {
  test.use({ hasTouch: true });

  test('keeps the Avatar action target at least 44 by 44 CSS pixels on mobile', async ({
    page,
    browserName,
  }) => {
    await page.setViewportSize(mobileViewport);
    await collapseMobileSidebar(page);
    await expectNoHorizontalOverflow(page);

    const interaction = page.getByRole('group', {
      name: 'Avatar inside a native button',
      exact: true,
    });
    const button = interaction.getByRole('button', {
      name: 'Open profile for Alex Rivera',
      exact: true,
    });

    await expect(page.getByRole('heading', { level: 1, name: 'Avatar' })).toBeVisible();
    // Only Chromium reports touch points for an emulated touch context.
    if (browserName === 'chromium') {
      await expect.poll(() => page.evaluate(() => navigator.maxTouchPoints)).toBeGreaterThan(0);
    }
    await button.scrollIntoViewIfNeeded();

    const targetSize = await button.evaluate((element) => {
      const { width, height } = element.getBoundingClientRect();
      return { width, height };
    });

    expect(targetSize.width).toBeGreaterThanOrEqual(44);
    expect(targetSize.height).toBeGreaterThanOrEqual(44);
  });
});

async function captureMobile(page: Page, example: Locator, screenshotName: string): Promise<void> {
  await page.setViewportSize(mobileCatalogueViewport);
  await collapseMobileSidebar(page);
  await expectNoHorizontalOverflow(page);
  await expect(example).toHaveScreenshot(screenshotName, { animations: 'disabled' });
}

async function collapseMobileSidebar(page: Page): Promise<void> {
  const navigation = page.getByRole('navigation', {
    name: 'Component navigation',
    exact: true,
  });

  for (const category of ['Actions', 'Surfaces', 'Data and identity']) {
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

async function tabTo(page: Page, target: Locator): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;

    await page.keyboard.press('Tab');
  }

  throw new Error('Keyboard navigation did not reach the named Avatar action button.');
}
