import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { kuiMessage, loadKuiCatalogue } from './support/kui-catalogue';
import { expectNoDocumentOverflow } from './support/page-ready';
import { openWithHeldScripts } from './support/ssr';

const desktopViewport = { width: 1440, height: 1000 };
const tabletViewport = { width: 768, height: 1024 };
const mobileViewport = { width: 320, height: 2000 };

/** Autoplay delay configured by the page (`CAROUSEL_AUTOPLAY_INTERVAL`). */
const autoplayInterval = 30_000;

const catalogueCards = [
  ['Index model', 'index-model'],
  ['Loop', 'loop'],
  ['Items per view', 'items-per-view'],
  ['Navigation visibility', 'navigation'],
  ['Draggable', 'draggable'],
  ['Autoplay', 'autoplay'],
] as const;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
});

async function open(page: Page): Promise<void> {
  await page.goto('/components/carousel');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Carousel', exact: true }),
  ).toBeVisible();
}

function group(page: Page, name: string): Locator {
  return page.getByRole('group', { name, exact: true });
}

function regionIn(example: Locator, name: string): Locator {
  return example.getByRole('region', { name, exact: true });
}

function card(page: Page, heading: string): Locator {
  return page.getByRole('article').filter({
    has: page.getByRole('heading', { level: 2, name: heading, exact: true }),
  });
}

function prev(region: Locator): Locator {
  return region.getByRole('button', { name: 'Previous slide', exact: true });
}

function next(region: Locator): Locator {
  return region.getByRole('button', { name: 'Next slide', exact: true });
}

function dot(example: Locator, position: number, total: number): Locator {
  return example.getByRole('tab', { name: `Go to slide ${position} of ${total}`, exact: true });
}

function slide(region: Locator, position: number, total: number): Locator {
  return region.getByRole('group', { name: `${position} of ${total}`, exact: true });
}

function readout(example: Locator, index: number): Locator {
  return example.getByText(`Current index: ${index}`, { exact: true });
}

/** Resolves once the track has stopped scrolling, judged by the browser's own frame loop. */
async function waitForScrollEnd(region: Locator): Promise<void> {
  await region.locator('.kui-carousel__track').evaluate(
    (track) =>
      new Promise<void>((resolve) => {
        let last = Number.NaN;
        let stableFrames = 0;
        const tick = (): void => {
          if (track.scrollLeft === last) {
            stableFrames += 1;
            if (stableFrames >= 6) {
              resolve();
              return;
            }
          } else {
            stableFrames = 0;
            last = track.scrollLeft;
          }
          requestAnimationFrame(tick);
        };
        tick();
      }),
  );
}

async function scrollLeftOf(region: Locator): Promise<number> {
  return region.locator('.kui-carousel__track').evaluate((track) => track.scrollLeft);
}

/** Drags across the track with a real mouse, starting on slide content away from the arrows. */
async function dragTrack(page: Page, region: Locator, fraction: number): Promise<void> {
  await region.scrollIntoViewIfNeeded();
  const box = await region.boundingBox();
  if (!box) throw new Error('The carousel region has no bounding box.');
  const y = box.y + box.height / 2;
  const startX = box.x + box.width * (fraction < 0 ? 0.8 : 0.2);

  await page.mouse.move(startX, y);
  await page.mouse.down();
  await page.mouse.move(startX + box.width * fraction, y, { steps: 12 });
  await page.mouse.up();
}

/** Swipes across the track with real touch input dispatched through the browser's input pipeline. */
async function swipeTrack(page: Page, region: Locator): Promise<void> {
  await region.scrollIntoViewIfNeeded();
  const box = await region.boundingBox();
  if (!box) throw new Error('The carousel region has no bounding box.');
  const session = await page.context().newCDPSession(page);
  const y = box.y + box.height / 2;
  let x = box.x + box.width * 0.85;

  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
  for (let step = 0; step < 12; step += 1) {
    x -= box.width * 0.05;
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await session.detach();
}

async function expectNoOverflow(page: Page, label: string): Promise<void> {
  await expectNoDocumentOverflow(page, label);
}

test('renders the minimal default carousel in both themes and at 320px @visual', async ({
  page,
}) => {
  await open(page);

  const example = group(page, 'Default carousel example');
  const region = regionIn(example, 'Release highlights');

  await expect(region).toHaveAttribute('aria-roledescription', 'carousel');
  await expect(region.getByRole('group')).toHaveCount(3);
  await expect(slide(region, 1, 3)).toHaveAttribute('aria-roledescription', 'slide');
  await expect(slide(region, 3, 3)).toBeAttached();
  await expect(prev(region)).toBeDisabled();
  await expect(next(region)).toBeEnabled();
  await expect(example.getByRole('tab')).toHaveCount(3);
  await expect(dot(example, 1, 3)).toHaveAttribute('aria-selected', 'true');
  await expect(example.getByRole('button', { name: /autoplay/i })).toHaveCount(0);
  await expect(example).toHaveScreenshot('carousel-default-dark.png', { animations: 'disabled' });

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch to light theme', exact: true })
    .click();
  await expect(example).toHaveScreenshot('carousel-default-light.png', { animations: 'disabled' });

  await page.setViewportSize(mobileViewport);
  await expectNoOverflow(page, 'default carousel at 320px');
  const regionBox = await region.boundingBox();
  const exampleBox = await example.boundingBox();
  expect(regionBox?.width ?? Infinity).toBeLessThanOrEqual((exampleBox?.width ?? 0) + 1);
  await expect(example).toHaveScreenshot('carousel-default-320.png', { animations: 'disabled' });
});

test('captures every catalogue card at desktop and 320px @visual', async ({ page }) => {
  await open(page);

  for (const [heading, key] of catalogueCards) {
    await expect(card(page, heading)).toHaveScreenshot(`carousel-${key}-desktop.png`, {
      animations: 'disabled',
    });
  }

  await page.setViewportSize(mobileViewport);
  await expectNoOverflow(page, 'carousel catalogue at 320px');

  for (const [heading, key] of catalogueCards) {
    await expect(card(page, heading)).toHaveScreenshot(`carousel-${key}-320.png`, {
      animations: 'disabled',
    });
  }
});

test('moves between slides with the arrows and the dot picker', async ({ page }) => {
  await open(page);

  const example = group(page, 'Default carousel example');
  const region = regionIn(example, 'Release highlights');

  await expect(slide(region, 1, 3)).toBeInViewport({ ratio: 0.9 });
  await expect(slide(region, 2, 3)).not.toBeInViewport({ ratio: 0.5 });

  await next(region).click();
  await expect(dot(example, 2, 3)).toHaveAttribute('aria-selected', 'true');
  await expect(prev(region)).toBeEnabled();
  await expect(slide(region, 2, 3)).toBeInViewport({ ratio: 0.9 });
  await expect(slide(region, 1, 3)).not.toBeInViewport({ ratio: 0.5 });

  await dot(example, 3, 3).click();
  await expect(dot(example, 3, 3)).toHaveAttribute('aria-selected', 'true');
  await expect(next(region)).toBeDisabled();
  await expect(slide(region, 3, 3)).toBeInViewport({ ratio: 0.9 });

  await prev(region).click();
  await expect(dot(example, 2, 3)).toHaveAttribute('aria-selected', 'true');
  await expect(next(region)).toBeEnabled();

  const controls = await example.getByRole('tab').evaluateAll((tabs) =>
    tabs.map((tab) => {
      const target = tab.getAttribute('aria-controls') ?? '';

      return document.getElementById(target)?.getAttribute('aria-label') ?? null;
    }),
  );
  expect(controls).toEqual(['1 of 3', '2 of 3', '3 of 3']);
});

test('keeps the index model, dots, and external controls in sync @visual', async ({ page }) => {
  await open(page);

  const example = group(page, 'Index model carousel example');
  const region = regionIn(example, 'Indexed highlights');
  const exampleCard = card(page, 'Index model');

  await expect(readout(example, 0)).toBeVisible();
  await expect(example.getByRole('tab')).toHaveCount(5);

  await next(region).click();
  await expect(readout(example, 1)).toBeVisible();
  await expect(dot(example, 2, 5)).toHaveAttribute('aria-selected', 'true');

  await dot(example, 4, 5).click();
  await expect(readout(example, 3)).toBeVisible();

  await example.getByRole('button', { name: 'Go to slide 3', exact: true }).click();
  await expect(readout(example, 2)).toBeVisible();
  await expect(dot(example, 3, 5)).toHaveAttribute('aria-selected', 'true');
  await expect(slide(region, 3, 5)).toBeInViewport({ ratio: 0.9 });
  await waitForScrollEnd(region);
  await page.mouse.move(0, 0);
  await expect(exampleCard).toHaveScreenshot('carousel-index-model-third-desktop.png', {
    animations: 'disabled',
  });

  await example.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(readout(example, 0)).toBeVisible();
  await expect(dot(example, 1, 5)).toHaveAttribute('aria-selected', 'true');
  await expect(prev(region)).toBeDisabled();
});

test('disables the arrows at the edges without loop and wraps with loop @visual', async ({
  page,
}) => {
  await open(page);

  const plain = group(page, 'Carousel without loop example');
  const plainRegion = regionIn(plain, 'Highlights without loop');
  const looping = group(page, 'Carousel with loop example');
  const loopRegion = regionIn(looping, 'Highlights with loop');

  await expect(prev(plainRegion)).toBeDisabled();
  await next(plainRegion).click();
  await next(plainRegion).click();
  await expect(dot(plain, 3, 3)).toHaveAttribute('aria-selected', 'true');
  await expect(next(plainRegion)).toBeDisabled();
  await expect(prev(plainRegion)).toBeEnabled();

  await expect(prev(loopRegion)).toBeEnabled();
  await expect(next(loopRegion)).toBeEnabled();
  await prev(loopRegion).click();
  await expect(dot(looping, 3, 3)).toHaveAttribute('aria-selected', 'true');
  await expect(next(loopRegion)).toBeEnabled();
  await waitForScrollEnd(loopRegion);
  await waitForScrollEnd(plainRegion);
  await page.mouse.move(0, 0);
  await expect(card(page, 'Loop')).toHaveScreenshot('carousel-loop-wrapped-desktop.png', {
    animations: 'disabled',
  });

  await next(loopRegion).click();
  await expect(dot(looping, 1, 3)).toHaveAttribute('aria-selected', 'true');
});

test('shows several slides per view and limits the reachable dots', async ({ page }) => {
  await open(page);

  const two = group(page, 'Two per view carousel example');
  const twoRegion = regionIn(two, 'Two highlights per view');
  const three = group(page, 'Three per view carousel example');
  const all = group(page, 'Three per view with three slides carousel example');
  const allRegion = regionIn(all, 'All highlights visible');

  await expect(two.getByRole('tab')).toHaveCount(4);
  await expect(three.getByRole('tab')).toHaveCount(3);
  await expect(all.getByRole('tab')).toHaveCount(1);
  await twoRegion.scrollIntoViewIfNeeded();
  await expect(slide(twoRegion, 1, 5)).toBeInViewport({ ratio: 0.9 });
  await expect(slide(twoRegion, 2, 5)).toBeInViewport({ ratio: 0.9 });
  await expect(slide(twoRegion, 3, 5)).not.toBeInViewport({ ratio: 0.5 });
  await expect(prev(allRegion)).toBeDisabled();
  await expect(next(allRegion)).toBeDisabled();
  await allRegion.scrollIntoViewIfNeeded();
  for (const position of [1, 2, 3]) {
    await expect(slide(allRegion, position, 3)).toBeInViewport({ ratio: 0.9 });
  }

  await next(twoRegion).click();
  await expect(dot(two, 2, 4)).toHaveAttribute('aria-selected', 'true');
  // Firefox nudges the page vertically when the button takes focus; bring the track back into view.
  await twoRegion.scrollIntoViewIfNeeded();
  await expect(slide(twoRegion, 2, 5)).toBeInViewport({ ratio: 0.9 });
  await expect(slide(twoRegion, 3, 5)).toBeInViewport({ ratio: 0.9 });

  await next(twoRegion).focus();
  await page.keyboard.press('End');
  await expect(dot(two, 4, 4)).toHaveAttribute('aria-selected', 'true');
  await expect(next(twoRegion)).toBeDisabled();
  await expect(slide(twoRegion, 5, 5)).toBeInViewport({ ratio: 0.9 });
});

test('hides the arrows, the dots, or both and still navigates by dragging', async ({ page }) => {
  await open(page);

  const dotsOnly = group(page, 'Dots only carousel example');
  const dotsRegion = regionIn(dotsOnly, 'Highlights with dots only');
  const arrowsOnly = group(page, 'Arrows only carousel example');
  const arrowsRegion = regionIn(arrowsOnly, 'Highlights with arrows only');
  const swipeOnly = group(page, 'Swipe only carousel example');
  const swipeRegion = regionIn(swipeOnly, 'Highlights with swipe only');

  await expect(prev(dotsRegion)).toHaveCount(0);
  await expect(next(dotsRegion)).toHaveCount(0);
  await expect(dotsOnly.getByRole('tab')).toHaveCount(3);
  await expect(prev(arrowsRegion)).toBeVisible();
  await expect(next(arrowsRegion)).toBeVisible();
  await expect(arrowsOnly.getByRole('tab')).toHaveCount(0);
  await expect(swipeRegion.getByRole('button')).toHaveCount(0);
  await expect(swipeOnly.getByRole('tab')).toHaveCount(0);

  await expect(readout(swipeOnly, 0)).toBeVisible();
  await dragTrack(page, swipeRegion, -0.6);
  await expect(readout(swipeOnly, 1)).toBeVisible();
  await expect(slide(swipeRegion, 2, 3)).toBeInViewport({ ratio: 0.9 });
});

test('operates with the keyboard from the region and from the dot picker', async ({ page }) => {
  await open(page);

  const example = group(page, 'Default carousel example');
  const region = regionIn(example, 'Release highlights');

  await next(region).click();
  await expect(dot(example, 2, 3)).toHaveAttribute('aria-selected', 'true');
  // Safari does not focus a button on mouse click, so the region keys need an explicit focus.
  await next(region).focus();

  await page.keyboard.press('ArrowLeft');
  await expect(dot(example, 1, 3)).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(dot(example, 2, 3)).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Home');
  await expect(dot(example, 1, 3)).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('End');
  await expect(dot(example, 3, 3)).toHaveAttribute('aria-selected', 'true');

  await dot(example, 2, 3).click();
  await expect(dot(example, 2, 3)).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(dot(example, 3, 3)).toBeFocused();
  await expect(dot(example, 3, 3)).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('ArrowRight');
  await expect(dot(example, 1, 3)).toBeFocused();
  await page.keyboard.press('End');
  await expect(dot(example, 3, 3)).toBeFocused();
  await page.keyboard.press('Home');
  await expect(dot(example, 1, 3)).toBeFocused();
  await expect(dot(example, 2, 3)).toHaveAttribute('tabindex', '-1');

  // The jump back to slide 1 is a smooth scroll. Shift+Tab lands on Next only once the scroll has
  // ended and Next is enabled again; before that it can still be disabled from the last slide.
  await waitForScrollEnd(region);
  await expect(next(region)).toBeEnabled();
  await page.keyboard.press('Shift+Tab');
  await expect(next(region)).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(dot(example, 2, 3)).toHaveAttribute('aria-selected', 'true');
  await page.keyboard.press('Space');
  await expect(dot(example, 3, 3)).toHaveAttribute('aria-selected', 'true');
  await expect(next(region)).toBeDisabled();
});

test('shows real keyboard focus, hover, and pressed states on the controls @visual', async ({
  page,
}) => {
  await open(page);

  const example = group(page, 'Default carousel example');
  const region = regionIn(example, 'Release highlights');

  await dot(example, 1, 3).focus();
  await page.keyboard.press('ArrowRight');
  await expect(dot(example, 2, 3)).toBeFocused();
  await waitForScrollEnd(region);
  await expect(card(page, 'Default')).toHaveScreenshot('carousel-dot-focus-desktop.png', {
    animations: 'disabled',
  });

  await next(region).hover();
  await expect(card(page, 'Default')).toHaveScreenshot('carousel-arrow-hover-desktop.png', {
    animations: 'disabled',
  });

  await page.mouse.down();
  await expect(card(page, 'Default')).toHaveScreenshot('carousel-arrow-pressed-desktop.png', {
    animations: 'disabled',
  });
  await page.mouse.up();
  await expect(dot(example, 3, 3)).toHaveAttribute('aria-selected', 'true');
});

test('drags with the mouse only when draggable and locks wheel scrolling otherwise @visual', async ({
  page,
}) => {
  await open(page);

  const draggable = group(page, 'Draggable carousel example');
  const draggableRegion = regionIn(draggable, 'Draggable highlights');
  const locked = group(page, 'Non-draggable carousel example');
  const lockedRegion = regionIn(locked, 'Non-draggable highlights');

  await expect(draggableRegion.locator('.kui-carousel__track')).toHaveCSS('cursor', 'grab');
  await expect(lockedRegion.locator('.kui-carousel__track')).toHaveCSS('cursor', 'default');

  await dragTrack(page, draggableRegion, -0.6);
  await expect(readout(draggable, 1)).toBeVisible();
  await expect(dot(draggable, 2, 3)).toHaveAttribute('aria-selected', 'true');
  await waitForScrollEnd(draggableRegion);
  await page.mouse.move(0, 0);
  await expect(card(page, 'Draggable')).toHaveScreenshot('carousel-draggable-dragged-desktop.png', {
    animations: 'disabled',
  });

  await dragTrack(page, draggableRegion, 0.6);
  await expect(readout(draggable, 0)).toBeVisible();

  const before = await scrollLeftOf(lockedRegion);
  await dragTrack(page, lockedRegion, -0.6);
  await waitForScrollEnd(lockedRegion);
  expect(await scrollLeftOf(lockedRegion)).toBe(before);
  await expect(readout(locked, 0)).toBeVisible();

  const box = await lockedRegion.boundingBox();
  if (!box) throw new Error('The locked carousel has no bounding box.');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(box.width, 0);
  await waitForScrollEnd(lockedRegion);
  expect(await scrollLeftOf(lockedRegion)).toBe(before);
  await expect(readout(locked, 0)).toBeVisible();

  await lockedRegion.getByRole('button', { name: 'Next slide', exact: true }).click();
  await expect(readout(locked, 1)).toBeVisible();
});

test('scrolls the draggable track with the wheel and syncs the index once it settles', async ({
  page,
}) => {
  await open(page);

  const draggable = group(page, 'Draggable carousel example');
  const region = regionIn(draggable, 'Draggable highlights');

  await region.scrollIntoViewIfNeeded();
  const box = await region.boundingBox();
  if (!box) throw new Error('The draggable carousel has no bounding box.');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.wheel(box.width, 0);

  // WebKit carries a wheel delta of one track width over two snap points; the others stop on one.
  await expect(draggable.getByText(/Current index: [12]/)).toBeVisible();
  await expect(dot(draggable, 1, 3)).toHaveAttribute('aria-selected', 'false');
});

test.describe('touch swipe', () => {
  test.use({ hasTouch: true });
  test.skip(
    ({ browserName }) => browserName !== 'chromium',
    'Real touch input is dispatched through the Chrome DevTools Protocol, which only Chromium offers.',
  );

  test('swipes a draggable track with touch and leaves a non-draggable one in place', async ({
    page,
  }) => {
    await open(page);

    const swipeOnly = group(page, 'Swipe only carousel example');
    const swipeRegion = regionIn(swipeOnly, 'Highlights with swipe only');
    const locked = group(page, 'Non-draggable carousel example');
    const lockedRegion = regionIn(locked, 'Non-draggable highlights');

    const swipeStart = await scrollLeftOf(swipeRegion);
    const lockedStart = await scrollLeftOf(lockedRegion);

    // The touch gesture is dispatched through the browser's input pipeline. The final resting
    // position after the synthetic release is not asserted: only that the track moved and the
    // index model followed it. The touch fling can carry the track past the first slide, so the
    // index is only required to have left the initial slide.
    await swipeTrack(page, swipeRegion);
    await expect(swipeOnly.getByText(/Current index: [12]/)).toBeVisible();
    await waitForScrollEnd(swipeRegion);
    expect(await scrollLeftOf(swipeRegion)).toBeGreaterThan(swipeStart + 100);

    await swipeTrack(page, lockedRegion);
    await waitForScrollEnd(lockedRegion);
    await expect(readout(locked, 0)).toBeVisible();
    expect(await scrollLeftOf(lockedRegion)).toBe(lockedStart);
  });
});

test.describe('autoplay', () => {
  test.beforeEach(async ({ page }) => {
    await page.clock.install();
    await open(page);
  });

  async function scenario(page: Page): Promise<{ example: Locator; region: Locator }> {
    const example = group(page, 'Autoplay with loop carousel example');
    const region = regionIn(example, 'Rotating highlights');
    await expect(region).toBeVisible();
    await page.mouse.move(0, 0);

    return { example, region };
  }

  async function advance(page: Page, region: Locator, milliseconds: number): Promise<void> {
    await waitForScrollEnd(region);
    await page.clock.runFor(milliseconds);
    await waitForScrollEnd(region);
  }

  test('always shows Play/Pause and advances one slide per interval, wrapping with loop', async ({
    page,
  }) => {
    const { example, region } = await scenario(page);

    await expect(region.getByRole('button', { name: 'Pause autoplay', exact: true })).toBeVisible();
    await expect(readout(example, 0)).toBeVisible();

    await advance(page, region, autoplayInterval);
    await expect(readout(example, 1)).toBeVisible();
    await advance(page, region, autoplayInterval);
    await expect(readout(example, 2)).toBeVisible();
    await advance(page, region, autoplayInterval);
    await expect(readout(example, 0)).toBeVisible();
    await expect(dot(example, 1, 3)).toHaveAttribute('aria-selected', 'true');
  });

  test('pauses and resumes from the visible control @visual', async ({ page }) => {
    const { example, region } = await scenario(page);
    const heading = page.getByRole('heading', { level: 1, name: 'Carousel', exact: true });

    await region.getByRole('button', { name: 'Pause autoplay', exact: true }).click();
    await heading.click();
    await page.mouse.move(0, 0);
    const resume = region.getByRole('button', { name: 'Resume autoplay', exact: true });
    await expect(resume).toBeVisible();
    await expect(card(page, 'Autoplay')).toHaveScreenshot('carousel-autoplay-paused-desktop.png', {
      animations: 'disabled',
    });

    await advance(page, region, autoplayInterval * 3);
    await expect(readout(example, 0)).toBeVisible();

    await resume.click();
    await heading.click();
    await page.mouse.move(0, 0);
    await expect(region.getByRole('button', { name: 'Pause autoplay', exact: true })).toBeVisible();
    await advance(page, region, autoplayInterval);
    await expect(readout(example, 1)).toBeVisible();
  });

  test('pauses while the pointer is over the carousel and resumes when it leaves', async ({
    page,
  }) => {
    const { example, region } = await scenario(page);

    await region.hover({ position: { x: 40, y: 40 } });
    await advance(page, region, autoplayInterval * 3);
    await expect(readout(example, 0)).toBeVisible();

    await page.mouse.move(0, 0);
    await advance(page, region, autoplayInterval);
    await expect(readout(example, 1)).toBeVisible();
  });

  test('pauses while focus is inside the carousel', async ({ page }) => {
    const { example, region } = await scenario(page);
    const heading = page.getByRole('heading', { level: 1, name: 'Carousel', exact: true });

    await dot(example, 1, 3).focus();
    await expect(dot(example, 1, 3)).toBeFocused();
    await advance(page, region, autoplayInterval);
    await expect(readout(example, 0)).toBeVisible();

    await heading.click();
    await advance(page, region, autoplayInterval);
    await expect(readout(example, 1)).toBeVisible();
  });

  test('stops at the last slide without loop while still reporting that it plays', async ({
    page,
  }) => {
    const example = group(page, 'Autoplay without loop carousel example');
    const region = regionIn(example, 'Rotating highlights without loop');
    await expect(region).toBeVisible();
    await page.mouse.move(0, 0);

    await advance(page, region, autoplayInterval);
    await advance(page, region, autoplayInterval);
    await expect(readout(example, 2)).toBeVisible();
    await expect(next(region)).toBeDisabled();

    await advance(page, region, autoplayInterval * 3);
    await expect(readout(example, 2)).toBeVisible();
    await expect(region.getByRole('button', { name: 'Pause autoplay', exact: true })).toBeVisible();
  });

  // Reproduced with real hover and keyboard focus: `hoverPaused` feeds the button label, so the
  // control announces "Resume autoplay" while autoplay was never paused by the user.
  test.fixme('keeps the Pause label while the pointer or focus is on the control', async ({
    page,
  }) => {
    const { region } = await scenario(page);
    const control = region.getByRole('button', { name: /autoplay/i });

    await control.hover();
    await expect(control).toHaveAccessibleName('Pause autoplay');
    await page.mouse.move(0, 0);
    await control.focus();
    await expect(control).toHaveAccessibleName('Pause autoplay');
    await page.keyboard.press('Enter');
    await expect(control).toHaveAccessibleName('Resume autoplay');
  });

  // Reproduced: the pointer leaving clears the shared pause flag while focus is still inside.
  test.fixme('stays paused while focus is inside after the pointer leaves', async ({ page }) => {
    const { example, region } = await scenario(page);
    const control = region.getByRole('button', { name: /autoplay/i });

    await control.focus();
    await region.hover({ position: { x: 40, y: 40 } });
    await page.mouse.move(0, 0);
    await advance(page, region, autoplayInterval * 2);
    await expect(control).toBeFocused();
    await expect(readout(example, 0)).toBeVisible();
  });
});

test('server-renders the carousels, hydrates them, and stays interactive', async ({ page }) => {
  const held = await openWithHeldScripts(page, '/components/carousel');
  const example = group(page, 'Default carousel example');
  const region = regionIn(example, 'Release highlights');

  // Scripts are held back: this markup came from the server alone.
  expect(held.serverHtml).toContain('ng-server-context="ssr"');
  expect(held.serverHtml).toContain('aria-roledescription="carousel"');
  expect(held.serverHtml).toContain('id="carousel-playground-title"');
  await expect(
    page.getByRole('heading', { level: 1, name: 'Carousel', exact: true }),
  ).toBeVisible();
  await expect(region).toBeVisible();
  await expect(example.getByRole('tab')).toHaveCount(3);
  await region.evaluate((element) => element.setAttribute('data-server-node', ''));

  held.release();

  await expect(region).toHaveAttribute('data-server-node', '');
  await next(region).click();
  await expect(dot(example, 2, 3)).toHaveAttribute('aria-selected', 'true');
});

test('switches the Carousel translation scope without overflow at any width', async ({ page }) => {
  const kui = await loadKuiCatalogue(page, 'ru');
  const [localeResponse, shellLocaleResponse] = await Promise.all([
    page.request.get('/i18n/carousel/ru.json'),
    page.request.get('/i18n/ru.json'),
  ]);
  expect(localeResponse.ok()).toBeTruthy();
  expect(shellLocaleResponse.ok()).toBeTruthy();
  const translations = await localeResponse.json();
  const shellTranslations = await shellLocaleResponse.json();

  await open(page);
  await expectNoOverflow(page, 'desktop');
  await page.setViewportSize(tabletViewport);
  await expectNoOverflow(page, '768px');
  await page.setViewportSize(mobileViewport);
  await expectNoOverflow(page, '320px');

  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
  await expect(page.locator('#carousel-playground-title')).toHaveText(translations.title);

  const russianDefault = group(page, translations.groups.default);
  await expect(regionIn(russianDefault, translations.regions.default)).toBeVisible();
  await expect(
    regionIn(russianDefault, translations.regions.default).getByRole('group', {
      name: kuiMessage(kui, 'carousel', 'slidePosition', { index: 1, total: 3 }),
    }),
  ).toBeAttached();
  await expectNoOverflow(page, '320px in Russian');

  await page
    .getByRole('button', { name: shellTranslations.playground.language, exact: true })
    .click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#carousel-playground-title')).toHaveText('Carousel');
});
