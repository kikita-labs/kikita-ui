import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { kuiMessage, loadKuiCatalogue } from './support/kui-catalogue';
import { openWithHeldScripts, readDuplicateIds } from './support/ssr';

interface MediaViewerLocale {
  title: string;
  accessibility: { grid: string; options: string; select: string };
  actions: { openTile: string; openCustomLabel: string; selectPhoto: string };
  labels: { photoAlt: string; customAriaLabel: string };
  status: { lastViewed: string; selected: string };
}

type ShellTheme = 'dark' | 'light';

const brokenPhotoPath = /\/media-viewer\/missing\.svg$/;

const groups = {
  default: 'Default media viewer example',
  grid: 'Media viewer photo grid',
  options: 'Media viewer option examples',
  states: 'Media viewer photo state examples',
  select: 'Media viewer selection composition',
};

async function selectTheme(page: Page, theme: ShellTheme): Promise<void> {
  const root = page.locator('html');

  if ((await root.getAttribute('data-kui-theme')) !== theme) {
    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Switch to ' + theme + ' theme', exact: true })
      .click();
  }

  await expect(root).toHaveAttribute('data-kui-theme', theme);
}

function group(page: Page, name: string): Locator {
  return page.getByRole('group', { name, exact: true });
}

function viewer(page: Page, position?: { photo: number; total: number }, base = 'Photo viewer') {
  const name = position ? `${base}, photo ${position.photo} of ${position.total}` : base;

  return page.getByRole('dialog', { name, exact: true });
}

function photo(dialog: Locator, number: number): Locator {
  return dialog.getByRole('img', { name: `Placeholder photo ${number}`, exact: true });
}

async function openGridPhoto(page: Page, number: number): Promise<Locator> {
  await group(page, groups.grid)
    .getByRole('button', { name: `Open photo ${number} of 6`, exact: true })
    .click();
  const dialog = viewer(page, { photo: number, total: 6 });
  await expect(dialog).toBeVisible();
  await expect(photo(dialog, number)).toBeVisible();
  await waitForDialogEntrance(dialog);

  return dialog;
}

async function waitForDialogEntrance(dialog: Locator): Promise<void> {
  await dialog.evaluate(async (element) => {
    const entrance = element.getAnimations().find((animation) => {
      return 'animationName' in animation && animation.animationName === 'kui-dialog-in';
    });

    await entrance?.finished.catch(() => undefined);
  });
}

async function imageBox(image: Locator): Promise<{ x: number; y: number; w: number; h: number }> {
  const box = await image.evaluate((element) => {
    const rect = element.getBoundingClientRect();

    return { x: rect.x, y: rect.y, w: rect.width, h: rect.height };
  });

  return box;
}

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/media-viewer');
});

test('renders the default trigger and named catalogue groups', async ({ page }) => {
  await expect(
    page.getByRole('heading', { level: 1, name: 'Media viewer', exact: true }),
  ).toBeVisible();
  await expect(page.getByRole('main')).toHaveAccessibleName('Media viewer');

  for (const name of Object.values(groups)) {
    await expect(group(page, name)).toBeVisible();
  }

  await expect(
    group(page, groups.default).getByRole('button', { name: 'Open viewer', exact: true }),
  ).toBeVisible();
  await expect(group(page, groups.grid).getByRole('button')).toHaveCount(6);
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('opens from the default trigger with every default and reports the index', async ({
  page,
}) => {
  const container = group(page, groups.default);
  const trigger = container.getByRole('button', { name: 'Open viewer', exact: true });

  await trigger.click();
  const dialog = viewer(page, { photo: 1, total: 6 });
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(dialog.getByText('1 / 6', { exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Previous photo', exact: true })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Next photo', exact: true })).toBeEnabled();
  await expect(container.getByRole('status')).toHaveText('Last viewed: photo 1');

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('opens each grid tile at its own index with keyboard or pointer', async ({ page }) => {
  const container = group(page, groups.grid);
  const tile = container.getByRole('button', { name: 'Open photo 4 of 6', exact: true });

  await tile.focus();
  await page.keyboard.press('Enter');
  const dialog = viewer(page, { photo: 4, total: 6 });
  await expect(photo(dialog, 4)).toBeVisible();
  await expect(container.getByRole('status')).toHaveText('Last viewed: photo 4');
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(tile).toBeFocused();

  const lastTile = container.getByRole('button', { name: 'Open photo 6 of 6', exact: true });
  await lastTile.focus();
  await page.keyboard.press('Space');
  await expect(viewer(page, { photo: 6, total: 6 })).toBeVisible();
  await expect(
    viewer(page, { photo: 6, total: 6 }).getByRole('button', { name: 'Next photo', exact: true }),
  ).toBeDisabled();
});

test('navigates with keyboard, buttons and thumbnails without wrapping', async ({ page }) => {
  const container = group(page, groups.grid);
  let dialog = await openGridPhoto(page, 1);

  await page.keyboard.press('ArrowLeft');
  await expect(dialog.getByText('1 / 6', { exact: true })).toBeVisible();

  await page.keyboard.press('ArrowRight');
  dialog = viewer(page, { photo: 2, total: 6 });
  await expect(photo(dialog, 2)).toBeVisible();
  await expect(dialog.getByText('2 / 6', { exact: true })).toBeVisible();
  await expect(container.getByRole('status')).toHaveText('Last viewed: photo 2');

  await page.keyboard.press('End');
  dialog = viewer(page, { photo: 6, total: 6 });
  await expect(dialog.getByText('6 / 6', { exact: true })).toBeVisible();
  await page.keyboard.press('ArrowRight');
  await expect(dialog.getByText('6 / 6', { exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Next photo', exact: true })).toBeDisabled();
  await expect(dialog.getByRole('button', { name: 'Previous photo', exact: true })).toBeEnabled();

  await page.keyboard.press('Home');
  dialog = viewer(page, { photo: 1, total: 6 });
  await expect(dialog.getByText('1 / 6', { exact: true })).toBeVisible();

  await dialog.getByRole('button', { name: 'Go to photo 4 of 6', exact: true }).click();
  dialog = viewer(page, { photo: 4, total: 6 });
  await expect(photo(dialog, 4)).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Go to photo 4 of 6' })).toHaveAttribute(
    'aria-current',
    'true',
  );
  await expect(dialog.getByRole('button', { name: 'Go to photo 1 of 6' })).not.toHaveAttribute(
    'aria-current',
  );

  await dialog.getByRole('button', { name: 'Next photo', exact: true }).click();
  await expect(viewer(page, { photo: 5, total: 6 })).toBeVisible();
  await viewer(page, { photo: 5, total: 6 })
    .getByRole('button', { name: 'Previous photo', exact: true })
    .click();
  await expect(viewer(page, { photo: 4, total: 6 })).toBeVisible();
  await expect(container.getByRole('status')).toHaveText('Last viewed: photo 4');
});

test('closes with Escape or the Close button and returns focus to the tile', async ({ page }) => {
  const tile = group(page, groups.grid).getByRole('button', {
    name: 'Open photo 3 of 6',
    exact: true,
  });

  await tile.click();
  const dialog = viewer(page, { photo: 3, total: 6 });
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(tile).toBeFocused();

  await tile.click();
  await viewer(page, { photo: 3, total: 6 })
    .getByRole('button', { name: 'Close photo viewer', exact: true })
    .click();
  await expect(viewer(page)).toHaveCount(0);
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await expect(tile).toBeFocused();
});

test('keeps keyboard focus inside the viewer while tabbing', async ({ page }) => {
  const dialog = await openGridPhoto(page, 2);

  for (let step = 0; step < 14; step += 1) {
    await page.keyboard.press('Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }

  for (let step = 0; step < 14; step += 1) {
    await page.keyboard.press('Shift+Tab');
    expect(await dialog.evaluate((element) => element.contains(document.activeElement))).toBe(true);
  }
});

test('zooms with the buttons up to the maximum and back to one', async ({ page }) => {
  const dialog = await openGridPhoto(page, 2);
  const image = photo(dialog, 2);
  const zoomIn = dialog.getByRole('button', { name: 'Zoom in', exact: true });
  const zoomOut = dialog.getByRole('button', { name: 'Zoom out', exact: true });
  const base = await imageBox(image);

  await expect(zoomOut).toBeDisabled();

  for (let step = 0; step < 4; step += 1) {
    await zoomIn.click();
  }

  await expect(zoomIn).toBeDisabled();
  await expect(zoomOut).toBeEnabled();
  await expect.poll(async () => (await imageBox(image)).w / base.w).toBeCloseTo(3, 1);

  for (let step = 0; step < 4; step += 1) await zoomOut.click();

  await expect(zoomOut).toBeDisabled();
  await expect.poll(async () => (await imageBox(image)).w / base.w).toBeCloseTo(1, 1);
});

test('zooms with the mouse wheel over the photo', async ({ page }) => {
  const dialog = await openGridPhoto(page, 2);
  const image = photo(dialog, 2);
  const base = await imageBox(image);

  await page.mouse.move(base.x + base.w / 2, base.y + base.h / 2);
  await page.mouse.wheel(0, -100);
  await expect(dialog.getByRole('button', { name: 'Zoom out', exact: true })).toBeEnabled();
  await expect.poll(async () => (await imageBox(image)).w / base.w).toBeCloseTo(1.5, 1);

  await page.mouse.wheel(0, 100);
  await expect(dialog.getByRole('button', { name: 'Zoom out', exact: true })).toBeDisabled();
});

test('pans a zoomed photo by dragging and clamps the offset', async ({ page }) => {
  const dialog = await openGridPhoto(page, 2);
  const image = photo(dialog, 2);
  const zoomIn = dialog.getByRole('button', { name: 'Zoom in', exact: true });
  const base = await imageBox(image);

  await zoomIn.click();
  await zoomIn.click();
  await expect.poll(async () => (await imageBox(image)).w / base.w).toBeCloseTo(2, 3);
  const zoomed = await imageBox(image);
  const centerX = zoomed.x + zoomed.w / 2;
  const centerY = zoomed.y + zoomed.h / 2;

  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX + 60, centerY, { steps: 4 });
  await page.mouse.up();
  // Chrome may coalesce the last synthetic pointer moves, so the offset is checked as a range.
  await expect.poll(async () => (await imageBox(image)).x - zoomed.x).toBeGreaterThan(30);
  expect((await imageBox(image)).x - zoomed.x).toBeLessThanOrEqual(60.5);

  await page.mouse.move(centerX, centerY);
  await page.mouse.down();
  await page.mouse.move(centerX + 400, centerY, { steps: 4 });
  await page.mouse.up();
  await expect.poll(async () => (await imageBox(image)).x - zoomed.x).toBeCloseTo(120, 0);

  await dialog.getByRole('button', { name: 'Zoom out', exact: true }).click();
  await dialog.getByRole('button', { name: 'Zoom out', exact: true }).click();
  await expect.poll(async () => Math.abs((await imageBox(image)).x - base.x)).toBeLessThan(1);
});

test('resets zoom when navigating to another photo', async ({ page }) => {
  const dialog = await openGridPhoto(page, 2);

  await dialog.getByRole('button', { name: 'Zoom in', exact: true }).click();
  await expect(dialog.getByRole('button', { name: 'Zoom out', exact: true })).toBeEnabled();

  await dialog.getByRole('button', { name: 'Next photo', exact: true }).click();
  await expect(viewer(page, { photo: 3, total: 6 })).toBeVisible();
  await expect(
    viewer(page, { photo: 3, total: 6 }).getByRole('button', { name: 'Zoom out', exact: true }),
  ).toBeDisabled();
});

test.describe('touch pinch', () => {
  test.use({ hasTouch: true });

  test('pinch-zooms with two real touch points', async ({ page }) => {
    const dialog = await openGridPhoto(page, 2);
    const image = photo(dialog, 2);
    const base = await imageBox(image);
    const cdp = await page.context().newCDPSession(page);
    const y = base.y + base.h / 2;
    const cx = base.x + base.w / 2;
    const touch = (spread: number) => [
      { x: cx - spread, y, id: 1 },
      { x: cx + spread, y, id: 2 },
    ];

    await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: touch(40) });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: touch(60) });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: touch(80) });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });

    await expect.poll(async () => (await imageBox(image)).w / base.w).toBeCloseTo(2, 1);
    await expect(dialog.getByRole('button', { name: 'Zoom out', exact: true })).toBeEnabled();
  });
});

// Library defect: when the focused Zoom in button becomes natively disabled, focus falls back to
// <body>. The lightbox handles Arrow/Home/End on its host element, so those keys stop working until
// focus is moved back into the dialog. See media-viewer-inventory.md, discrepancy 3.
test.fixme('keeps arrow keys working after Zoom in becomes disabled while focused', async ({
  page,
}) => {
  const dialog = await openGridPhoto(page, 2);
  const zoomIn = dialog.getByRole('button', { name: 'Zoom in', exact: true });

  await zoomIn.focus();
  for (let step = 0; step < 4; step += 1) await page.keyboard.press('Enter');

  await expect(zoomIn).toBeDisabled();
  await page.keyboard.press('ArrowRight');
  await expect(viewer(page, { photo: 3, total: 6 })).toBeVisible();
});

test('opens single-photo mode with only zoom and close controls', async ({ page }) => {
  await group(page, groups.options)
    .getByRole('button', { name: 'Open single photo', exact: true })
    .click();

  const dialog = viewer(page);
  await expect(photo(dialog, 1)).toBeVisible();
  await expect(dialog.getByRole('button')).toHaveCount(3);
  await expect(dialog.getByRole('button', { name: 'Zoom out', exact: true })).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Zoom in', exact: true })).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: 'Close photo viewer', exact: true }),
  ).toBeVisible();
  await expect(dialog.getByText(/\d+ \/ \d+/)).toHaveCount(0);
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('clamps an index past the end and reports the clamped index', async ({ page }) => {
  const container = group(page, groups.options);

  await container.getByRole('button', { name: 'Open past the end', exact: true }).click();
  const dialog = viewer(page, { photo: 6, total: 6 });
  await expect(photo(dialog, 6)).toBeVisible();
  await expect(dialog.getByText('6 / 6', { exact: true })).toBeVisible();
  await expect(container.getByRole('status')).toHaveText('Last viewed: photo 6');
});

test('uses a custom accessible name and custom zoom bounds', async ({ page }) => {
  const container = group(page, groups.options);

  await container.getByRole('button', { name: 'Open with custom label', exact: true }).click();
  await expect(viewer(page, { photo: 1, total: 6 }, 'Holiday album')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await container.getByRole('button', { name: 'Open with zoom limits', exact: true }).click();
  const dialog = viewer(page, { photo: 1, total: 6 });
  const image = photo(dialog, 1);
  await waitForDialogEntrance(dialog);
  const base = await imageBox(image);
  const zoomIn = dialog.getByRole('button', { name: 'Zoom in', exact: true });

  await zoomIn.click();
  await expect.poll(async () => (await imageBox(image)).w / base.w).toBeCloseTo(1.25, 1);
  await expect(zoomIn).toBeEnabled();
  await zoomIn.click();
  await expect.poll(async () => (await imageBox(image)).w / base.w).toBeCloseTo(1.5, 1);
  await expect(zoomIn).toBeDisabled();
});

test('shows the loading placeholder until a held photo request finishes', async ({ page }) => {
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/media-viewer/landscape.svg', async (route) => {
    await gate;
    await route.continue();
  });

  await group(page, groups.states)
    .getByRole('button', { name: 'Open slow photo', exact: true })
    .click();
  const dialog = viewer(page);
  const loaded = dialog.getByRole('img', { name: 'Photo loaded from a file', exact: true });

  await expect(dialog.locator('.kui-skeleton')).toBeVisible();
  await expect(loaded).toHaveCount(0);

  release();
  await expect(loaded).toBeVisible();
  await expect(dialog.locator('.kui-skeleton')).toHaveCount(0);
});

test.describe('unavailable photo', () => {
  test.use({
    browserErrorAllowances: [
      {
        message: /Failed to load resource/,
        url: brokenPhotoPath,
        reason:
          'The error examples deliberately request a missing same-origin photo; Chrome logs the failed image request.',
      },
    ],
  });

  test.beforeEach(async ({ page }) => {
    await page.route(brokenPhotoPath, (route) =>
      route.fulfill({ status: 404, contentType: 'text/plain', body: 'Not found' }),
    );
  });

  test('shows the error placeholder for a photo that fails to load', async ({ page }) => {
    await group(page, groups.states)
      .getByRole('button', { name: 'Open broken photo', exact: true })
      .click();
    const dialog = viewer(page);

    await expect(dialog.getByText('Could not load this photo', { exact: true })).toBeVisible();
    await expect(dialog.getByText('Check your connection and try again')).toBeVisible();
    await expect(dialog.getByRole('img', { name: 'Photo that fails to load' })).toHaveCount(0);
    await dialog.getByRole('button', { name: 'Close photo viewer', exact: true }).click();
    await expect(dialog).toHaveCount(0);
  });

  test('isolates the error to one gallery item and keeps navigation working', async ({ page }) => {
    await group(page, groups.states)
      .getByRole('button', { name: 'Open gallery with broken photo', exact: true })
      .click();
    let dialog = viewer(page, { photo: 2, total: 3 });

    await expect(dialog.getByText('Could not load this photo', { exact: true })).toBeVisible();
    await page.keyboard.press('ArrowRight');
    dialog = viewer(page, { photo: 3, total: 3 });
    await expect(photo(dialog, 3)).toBeVisible();
    await expect(dialog.getByText('Could not load this photo')).toHaveCount(0);

    await page.keyboard.press('ArrowLeft');
    await expect(
      viewer(page, { photo: 2, total: 3 }).getByText('Could not load this photo', { exact: true }),
    ).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await expect(photo(viewer(page, { photo: 1, total: 3 }), 1)).toBeVisible();
  });
});

test('keys thumbnails and photos by src when ids are omitted', async ({ page }) => {
  await group(page, groups.states)
    .getByRole('button', { name: 'Open without ids', exact: true })
    .click();
  let dialog = viewer(page, { photo: 1, total: 3 });

  await expect(dialog.getByRole('button', { name: /^Go to photo \d of 3$/ })).toHaveCount(3);
  await dialog.getByRole('button', { name: 'Go to photo 3 of 3', exact: true }).click();
  dialog = viewer(page, { photo: 3, total: 3 });
  await expect(photo(dialog, 3)).toBeVisible();
  await dialog.getByRole('button', { name: 'Go to photo 2 of 3', exact: true }).click();
  await expect(photo(viewer(page, { photo: 2, total: 3 }), 2)).toBeVisible();
});

test('keeps selection separate from opening in the selection composition', async ({ page }) => {
  const container = group(page, groups.select);
  const status = container.getByRole('status');

  await expect(status).toHaveText('Selected photos: 0');
  await container.getByRole('checkbox', { name: 'Select photo 2', exact: true }).check();
  await container.getByRole('checkbox', { name: 'Select photo 5', exact: true }).check();
  await expect(status).toHaveText('Selected photos: 2');
  await expect(page.getByRole('dialog')).toHaveCount(0);

  await container.getByRole('checkbox', { name: 'Select photo 5', exact: true }).uncheck();
  await expect(status).toHaveText('Selected photos: 1');

  await container.getByRole('button', { name: 'Open photo 3 of 6', exact: true }).click();
  const dialog = viewer(page, { photo: 3, total: 6 });
  await expect(photo(dialog, 3)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(status).toHaveText('Selected photos: 1');
  await expect(
    container.getByRole('checkbox', { name: 'Select photo 2', exact: true }),
  ).toBeChecked();
});

test('still opens and closes when reduced motion is requested', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const dialog = await openGridPhoto(page, 1);

  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
});

test('translates page copy, item text and the viewer chrome', async ({ page }) => {
  const kui = await loadKuiCatalogue(page, 'ru');
  const response = await page.request.get('/i18n/media-viewer/ru.json');
  expect(response.ok()).toBeTruthy();
  const russian = (await response.json()) as MediaViewerLocale;

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();

  await expect(page.getByRole('heading', { level: 1, name: russian.title })).toBeVisible();
  const grid = group(page, russian.accessibility.grid);
  await grid
    .getByRole('button', {
      name: russian.actions.openTile.replace('{{number}}', '2').replace('{{total}}', '6'),
    })
    .click();

  const russianViewer = (base: string, photo: number) =>
    page.getByRole('dialog', {
      name: kuiMessage(kui, 'mediaViewer', 'position', { label: base, index: photo, total: 6 }),
      exact: true,
    });
  const dialog = russianViewer(kuiMessage(kui, 'mediaViewer', 'label'), 2);
  await expect(
    dialog.getByRole('img', { name: russian.labels.photoAlt.replace('{{number}}', '2') }),
  ).toBeVisible();
  await expect(
    dialog.getByRole('button', { name: kuiMessage(kui, 'mediaViewer', 'close'), exact: true }),
  ).toBeVisible();
  await expect(grid.getByRole('status')).toHaveText(
    russian.status.lastViewed.replace('{{number}}', '2'),
  );
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);

  await group(page, russian.accessibility.options)
    .getByRole('button', { name: russian.actions.openCustomLabel, exact: true })
    .click();
  await expect(russianViewer(russian.labels.customAriaLabel, 1)).toBeVisible();
  await page.keyboard.press('Escape');

  await group(page, russian.accessibility.select)
    .getByRole('checkbox', { name: russian.actions.selectPhoto.replace('{{number}}', '1') })
    .check();
  await expect(group(page, russian.accessibility.select).getByRole('status')).toHaveText(
    russian.status.selected.replace('{{count}}', '1'),
  );
});

test('server renders the route and stays interactive after hydration', async ({ page }) => {
  const response = await page.request.get('/components/media-viewer');
  expect(response.status()).toBe(200);
  const markup = await response.text();

  expect(markup).toMatch(/<h1\b[^>]*>\s*Media viewer\s*<\/h1>/);
  expect(markup).not.toMatch(/class="[^"]*\bkui-dialog\b/);
  expect(markup).not.toContain('kui-media-viewer');

  const held = await openWithHeldScripts(page, '/components/media-viewer');
  const tile = group(page, groups.grid).getByRole('button', {
    name: 'Open photo 2 of 6',
    exact: true,
  });

  expect(held.serverHtml).toContain('ng-server-context="ssr"');
  await expect(page.getByRole('heading', { level: 1, name: 'Media viewer' })).toBeVisible();
  await expect(tile).toBeVisible();
  await expect(page.getByRole('dialog')).toHaveCount(0);
  await tile.evaluate((element) => element.setAttribute('data-server-node', ''));

  held.release();

  await expect(async () => {
    await tile.click({ timeout: 1_000 });
    await expect(viewer(page, { photo: 2, total: 6 })).toBeVisible({ timeout: 1_000 });
  }).toPass();

  await expect(tile).toHaveAttribute('data-server-node', '');
  expect(await readDuplicateIds(page)).toEqual([]);
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('keeps the page and the open viewer inside 768px and 320px viewports', async ({ page }) => {
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 768, height: 1024 },
    { width: 320, height: 640 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/components/media-viewer');

    const page_ = await page.evaluate(() => ({
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
    }));
    expect(page_.scrollWidth, `${viewport.width}px page`).toBeLessThanOrEqual(page_.clientWidth);

    const dialog = await openGridPhoto(page, 3);
    await waitForDialogEntrance(dialog);
    const bounds = await dialog.boundingBox();
    expect(bounds, `${viewport.width}px viewer`).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
    const overflow = await dialog.evaluate((element) => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth,
      dialogScroll: element.scrollWidth,
      dialogClient: element.clientWidth,
    }));
    expect(overflow.scroll, `${viewport.width}px document with viewer`).toBeLessThanOrEqual(
      overflow.client,
    );
    expect(overflow.dialogScroll).toBeLessThanOrEqual(overflow.dialogClient);
    await expect(dialog.getByRole('button', { name: 'Go to photo 6 of 6' })).toBeAttached();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
  }
});

test('captures each Media Viewer catalogue group @visual', async ({ page }) => {
  const names = [
    ['default', groups.default],
    ['grid', groups.grid],
    ['options', groups.options],
    ['states', groups.states],
    ['select', groups.select],
  ] as const;

  for (const [slug, name] of names) {
    await expect(group(page, name)).toHaveScreenshot(`media-viewer-${slug}-catalogue.png`, {
      animations: 'disabled',
    });
  }
});

test('captures the catalogue at 320px in both shell themes @visual', async ({ page }) => {
  // A tall viewport keeps the whole catalogue inside the shell scroller for the capture.
  await page.setViewportSize({ width: 320, height: 2800 });
  await page.goto('/components/media-viewer');

  for (const theme of ['dark', 'light'] as const) {
    await selectTheme(page, theme);
    await expect(page.getByRole('main')).toHaveScreenshot(
      `media-viewer-page-${theme}-mobile-320.png`,
      { animations: 'disabled' },
    );
  }
});

test('captures the open gallery and zoomed photo @visual', async ({ page }) => {
  const dialog = await openGridPhoto(page, 2);
  await waitForDialogEntrance(dialog);
  await expect(dialog).toHaveScreenshot('media-viewer-open-gallery.png', {
    animations: 'disabled',
  });

  const zoomIn = dialog.getByRole('button', { name: 'Zoom in', exact: true });
  await zoomIn.click();
  await zoomIn.click();
  await expect(dialog).toHaveScreenshot('media-viewer-open-zoomed.png', { animations: 'disabled' });
});

// Library defect: the lightbox host is `display: contents`, so its dark scrim background never
// paints and the white chrome sits on the theme's light panel surface. See the inventory.
test.fixme('keeps the viewer chrome readable in the light theme', async ({ page }) => {
  await selectTheme(page, 'light');
  const dialog = await openGridPhoto(page, 1);
  const close = dialog.getByRole('button', { name: 'Close photo viewer', exact: true });

  const contrast = await close.evaluate((button) => {
    const toRgb = (color: string): number[] => {
      const canvas = document.createElement('canvas');
      canvas.width = 1;
      canvas.height = 1;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas is unavailable.');
      context.fillStyle = color;
      context.fillRect(0, 0, 1, 1);

      return Array.from(context.getImageData(0, 0, 1, 1).data.slice(0, 3));
    };
    const luminance = ([r, g, b]: number[]): number => {
      const [lr, lg, lb] = [r, g, b].map((channel) => {
        const value = channel / 255;

        return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
      });

      return 0.2126 * lr + 0.7152 * lg + 0.0722 * lb;
    };
    const panel = button.closest('[role="dialog"]');
    if (!panel) throw new Error('Expected the viewer dialog.');
    const foreground = luminance(toRgb(getComputedStyle(button).color));
    const background = luminance(toRgb(getComputedStyle(panel).backgroundColor));

    return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
  });

  expect(contrast).toBeGreaterThanOrEqual(3);
});

test('captures the single-photo viewer and keyboard focus on a thumbnail @visual', async ({
  page,
}) => {
  await group(page, groups.options)
    .getByRole('button', { name: 'Open single photo', exact: true })
    .click();
  const single = viewer(page);
  await waitForDialogEntrance(single);
  await expect(single).toHaveScreenshot('media-viewer-open-single.png', { animations: 'disabled' });
  await page.keyboard.press('Escape');
  await expect(single).toHaveCount(0);

  const dialog = await openGridPhoto(page, 3);
  await waitForDialogEntrance(dialog);
  await dialog.getByRole('button', { name: 'Go to photo 3 of 6', exact: true }).focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(
    dialog.getByRole('button', { name: 'Go to photo 3 of 6', exact: true }),
  ).toBeFocused();
  await expect(dialog).toHaveScreenshot('media-viewer-open-thumbnail-focus.png', {
    animations: 'disabled',
  });
});

test('captures the loading and unavailable photo states @visual', async ({ page }) => {
  let release: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route('**/media-viewer/landscape.svg', async (route) => {
    await gate;
    await route.continue();
  });

  await group(page, groups.states)
    .getByRole('button', { name: 'Open slow photo', exact: true })
    .click();
  const loading = viewer(page);
  await expect(loading.locator('.kui-skeleton')).toBeVisible();
  await waitForDialogEntrance(loading);
  await expect(loading).toHaveScreenshot('media-viewer-open-loading.png', {
    animations: 'disabled',
  });
  release();
  await expect(
    loading.getByRole('img', { name: 'Photo loaded from a file', exact: true }),
  ).toBeVisible();
  await expect(loading).toHaveScreenshot('media-viewer-open-file-photo.png', {
    animations: 'disabled',
  });
  await page.keyboard.press('Escape');
  await expect(loading).toHaveCount(0);
});

test.describe('unavailable photo captures', () => {
  test.use({
    browserErrorAllowances: [
      {
        message: /Failed to load resource/,
        url: brokenPhotoPath,
        reason:
          'The error examples deliberately request a missing same-origin photo; Chrome logs the failed image request.',
      },
    ],
  });

  test('captures the error placeholder at desktop and 320px @visual', async ({ page }) => {
    await page.route(brokenPhotoPath, (route) =>
      route.fulfill({ status: 404, contentType: 'text/plain', body: 'Not found' }),
    );

    for (const viewport of [
      { width: 1440, height: 1200, name: 'desktop' },
      { width: 320, height: 640, name: 'mobile-320' },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto('/components/media-viewer');
      await group(page, groups.states)
        .getByRole('button', { name: 'Open gallery with broken photo', exact: true })
        .click();
      const dialog = viewer(page, { photo: 2, total: 3 });
      await expect(dialog.getByText('Could not load this photo', { exact: true })).toBeVisible();
      await waitForDialogEntrance(dialog);
      await expect(dialog).toHaveScreenshot(`media-viewer-open-error-${viewport.name}.png`, {
        animations: 'disabled',
      });
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
    }
  });
});

test('captures the open viewer at 320px @visual', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/components/media-viewer');

  const dialog = await openGridPhoto(page, 2);
  await waitForDialogEntrance(dialog);
  await expect(dialog).toHaveScreenshot('media-viewer-open-gallery-mobile-320.png', {
    animations: 'disabled',
  });
});
