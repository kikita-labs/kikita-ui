import { expect, type Page } from '@playwright/test';

/**
 * Waits until the routed page is mounted and web fonts have settled.
 *
 * The Playground shell renders the active route as the sibling of `<router-outlet>`, so a mounted
 * sibling proves the lazy route chunk loaded and rendered. In a client-rendered shell that also
 * proves the application bootstrapped. In server-rendered HTML the same element is already present
 * before hydration, so hydration itself is proved by the SSR specs, not by this helper.
 */
export async function waitForRouteContent(page: Page): Promise<void> {
  await expect(page.locator('router-outlet + *')).toHaveCount(1);
  await page.evaluate(() => document.fonts.ready.then(() => undefined));
}

/**
 * Navigates to a Playground route and waits for its content. It does not collect errors: the
 * `browserErrors` fixture from `./fixtures` does that for the whole test, including everything
 * that happens after navigation.
 */
export async function gotoReady(page: Page, route: string): Promise<void> {
  const response = await page.goto(route);
  expect(response?.ok(), `${route} responded with an error status`).toBe(true);
  await waitForRouteContent(page);
}

/**
 * Waits for every running finite CSS or Web Animation to finish, using the browser's own animation
 * timeline instead of a fixed delay. Looping animations, such as a spinner, are ignored because
 * they never finish. Use it before measuring layout or asserting that something did NOT close or
 * change, so an enter or exit animation in flight cannot skew the result.
 */
export async function settleAnimations(page: Page): Promise<void> {
  await page.evaluate(async () => {
    const finite = document
      .getAnimations()
      .filter((animation) => animation.effect?.getComputedTiming().endTime !== Infinity);

    await Promise.all(finite.map((animation) => animation.finished.catch(() => null)));
  });
}

/**
 * Asserts the document does not scroll horizontally. Animations settle first, because a slide-in
 * transition briefly places content outside the viewport without being a layout defect.
 */
export async function expectNoDocumentOverflow(page: Page, label = page.url()): Promise<void> {
  await settleAnimations(page);

  const overflow = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body.scrollWidth,
  }));

  expect(overflow.scrollWidth, `${label} document width`).toBeLessThanOrEqual(
    overflow.clientWidth + 1,
  );
  expect(overflow.bodyScrollWidth, `${label} body width`).toBeLessThanOrEqual(
    overflow.clientWidth + 1,
  );
}
