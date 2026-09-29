import type { Locator, Page } from '@playwright/test';

import { expect, test } from '../../../tests/e2e/support/fixtures';

const catalogueSections = [
  ['Default Slider example', 'slider-default'],
  ['Slider size and color variations', 'slider-variants'],
  ['Slider range endpoints', 'slider-endpoints'],
  ['Slider disabled and invalid states', 'slider-states'],
  ['Slider Signal Forms example', 'slider-signal-forms'],
  ['Slider tooltip examples', 'slider-tooltips'],
] as const;

const runtimeErrorsByPage = new WeakMap<Page, string[]>();

async function expectValidDescribedBy(input: Locator): Promise<void> {
  expect(
    await input.evaluate((element) => {
      const ids = element.getAttribute('aria-describedby')?.split(/\s+/) ?? [];
      return ids.length > 0 && ids.every((id) => Boolean(document.getElementById(id)));
    }),
  ).toBe(true);
}

async function captureSliderAndTooltip(
  page: Page,
  slider: Locator,
  tooltip: Locator,
  screenshotName: string,
): Promise<void> {
  await page.evaluate(async () => document.fonts.ready.then(() => undefined));
  await tooltip.evaluate(async (element) => {
    await Promise.all(
      element.getAnimations().map((animation) => animation.finished.catch(() => undefined)),
    );
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
  });

  const wrapper = slider.locator('xpath=..');
  const [wrapperBounds, thumbBounds, tooltipBounds] = await Promise.all([
    wrapper.boundingBox(),
    wrapper.locator('.kui-slider-thumb').boundingBox(),
    tooltip.boundingBox(),
  ]);
  const viewport = page.viewportSize();

  if (!wrapperBounds || !thumbBounds || !tooltipBounds || !viewport) {
    throw new Error('The Slider, thumb, tooltip, and viewport need visible bounds.');
  }
  expect(tooltipBounds.y + tooltipBounds.height).toBeLessThan(
    thumbBounds.y + thumbBounds.height / 2,
  );

  const x = Math.max(0, Math.floor(Math.min(wrapperBounds.x, tooltipBounds.x) - 8));
  const y = Math.max(0, Math.floor(Math.min(wrapperBounds.y, tooltipBounds.y) - 8));
  const right = Math.min(
    viewport.width,
    Math.ceil(
      Math.max(wrapperBounds.x + wrapperBounds.width, tooltipBounds.x + tooltipBounds.width) + 8,
    ),
  );
  const bottom = Math.min(
    viewport.height,
    Math.ceil(
      Math.max(wrapperBounds.y + wrapperBounds.height, tooltipBounds.y + tooltipBounds.height) + 8,
    ),
  );

  await expect(page).toHaveScreenshot(screenshotName, {
    clip: { x, y, width: right - x, height: bottom - y },
    animations: 'disabled',
  });
}

test.beforeEach(async ({ page }) => {
  const runtimeErrors: string[] = [];
  runtimeErrorsByPage.set(page, runtimeErrors);
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/slider');
  await expect(page.getByRole('heading', { level: 1, name: 'Slider', exact: true })).toBeVisible();
});

test('server-renders the native range and hydrates its Slider wrapper', async ({
  browser,
  page,
}) => {
  const routeUrl = new URL('/components/slider', page.url()).toString();
  const serverContext = await browser.newContext({ javaScriptEnabled: false });

  try {
    const serverPage = await serverContext.newPage();
    const response = await serverPage.goto(routeUrl);
    expect(response?.status()).toBe(200);

    const serverDefault = serverPage.getByRole('group', {
      name: 'Default Slider example',
      exact: true,
    });
    const serverSlider = serverDefault.getByRole('slider', { name: 'Default volume' });
    await expect(serverDefault.locator('.kui-slider')).toHaveCount(0);
    await expect(serverSlider).toHaveValue('50');
    for (const attribute of ['min', 'max', 'step', 'value']) {
      await expect(serverSlider).not.toHaveAttribute(attribute);
    }
    await expect(serverSlider).toHaveAttribute('id', /kui-field-\d+/);
    await expect(serverSlider).not.toHaveAttribute('aria-describedby');
    expect(
      await serverSlider.evaluate((element) => (element as HTMLInputElement).labels?.[0]?.htmlFor),
    ).toBe(await serverSlider.getAttribute('id'));
  } finally {
    await serverContext.close();
  }

  const defaultExample = page.getByRole('group', {
    name: 'Default Slider example',
    exact: true,
  });
  const slider = defaultExample.getByRole('slider', { name: 'Default volume' });
  await expect(defaultExample.locator('.kui-slider')).toHaveCount(1);
  await expect(slider.locator('xpath=..')).toHaveAttribute('data-kui-size', 'md');
  await expect(slider.locator('xpath=..')).toHaveAttribute('data-kui-color', 'primary');
  await expect(slider).toHaveValue('50');
  await expect(slider).not.toHaveAttribute('aria-describedby');
  expect(
    await slider.evaluate((element) => (element as HTMLInputElement).labels?.[0]?.htmlFor),
  ).toBe(await slider.getAttribute('id'));
  await slider.focus();
  await slider.press('ArrowRight');
  await expect(slider).toHaveValue('51');
  await slider.press('Home');
  await expect(slider).toHaveValue('0');
  await slider.press('End');
  await expect(slider).toHaveValue('100');
  expect(runtimeErrorsByPage.get(page)).toEqual([]);
});

test('renders every supported size and semantic color', async ({ page }) => {
  const variants = page.getByRole('group', {
    name: 'Slider size and color variations',
    exact: true,
  });
  const sliders = variants.getByRole('slider');
  await expect(sliders).toHaveCount(12);

  const resolved = await sliders.evaluateAll((elements) =>
    elements.map((element) => {
      const wrapper = element.closest<HTMLElement>('.kui-slider');
      return [wrapper?.dataset['kuiSize'], wrapper?.dataset['kuiColor']];
    }),
  );
  expect(resolved).toEqual([
    ['sm', 'primary'],
    ['sm', 'success'],
    ['sm', 'danger'],
    ['sm', 'neutral'],
    ['md', 'primary'],
    ['md', 'success'],
    ['md', 'danger'],
    ['md', 'neutral'],
    ['lg', 'primary'],
    ['lg', 'success'],
    ['lg', 'danger'],
    ['lg', 'neutral'],
  ]);
});

test('shows native endpoints, endpoint labels, disabled state, and Field invalid wiring', async ({
  page,
}) => {
  const endpoints = page.getByRole('group', { name: 'Slider range endpoints', exact: true });
  await expect(endpoints.getByRole('slider', { name: 'At minimum' })).toHaveValue('0');
  await expect(endpoints.getByRole('slider', { name: 'At maximum' })).toHaveValue('100');

  const labeledRange = endpoints.getByRole('slider', { name: 'Endpoint labels' });
  await expect(labeledRange.locator('xpath=..').locator('.kui-slider-labels')).toHaveText('0100');

  const states = page.getByRole('group', {
    name: 'Slider disabled and invalid states',
    exact: true,
  });
  const disabled = states.getByRole('slider', { name: 'Disabled slider' });
  await expect(disabled).toHaveAttribute('disabled', '');
  await expect(disabled).toBeDisabled();
  await expect(disabled.locator('xpath=..')).toHaveAttribute('data-kui-disabled', 'true');

  const fieldInvalid = states.getByRole('slider', { name: 'Invalid Field slider' });
  await expect(fieldInvalid).toHaveAttribute('aria-invalid', 'true');
  const fieldError = states.getByRole('alert');
  await expect(fieldError).toHaveText('The value needs review.');
  const errorId = await fieldError.getAttribute('id');
  expect(errorId).toBeTruthy();
  expect((await fieldInvalid.getAttribute('aria-describedby'))?.split(/\s+/)).toContain(errorId);
  await expectValidDescribedBy(fieldInvalid);

  const explicitInvalid = states.getByRole('slider', { name: 'Standalone invalid slider' });
  await expect(explicitInvalid).toHaveAttribute('id', 'slider-explicit-invalid');
  await expect(explicitInvalid).toHaveAttribute('aria-invalid', 'true');
  expect(
    await explicitInvalid.evaluate((element) => (element as HTMLInputElement).labels?.[0]?.htmlFor),
  ).toBe('slider-explicit-invalid');
});

test('fills a native range to 100% when max is zero', async ({ page }) => {
  const endpoints = page.getByRole('group', { name: 'Slider range endpoints', exact: true });
  const zeroMaximum = endpoints.getByRole('slider', { name: 'Zero maximum' });

  await expect(zeroMaximum).toHaveAttribute('min', '-100');
  await expect(zeroMaximum).toHaveAttribute('max', '0');
  await expect(zeroMaximum).toHaveValue('0');
  await expect
    .poll(() =>
      zeroMaximum
        .locator('xpath=..')
        .locator('.kui-slider-fill')
        .evaluate((element) => (element as HTMLElement).style.width),
    )
    .toBe('100%');
});

test('uses native range keyboard behavior inside a Signal Forms field @visual', async ({
  page,
}) => {
  const formExample = page.getByRole('group', {
    name: 'Slider Signal Forms example',
    exact: true,
  });
  const slider = formExample.getByRole('slider', { name: 'Volume' });

  await expect(slider).toHaveValue('60');
  await expect(slider).toHaveAttribute('aria-describedby', /kui-field-\d+-hint/);
  await expectValidDescribedBy(slider);

  await slider.focus();
  await slider.press('ArrowRight');
  await expect(slider).toHaveValue('61');
  await slider.press('Home');
  await expect(slider).toHaveValue('0');
  await slider.press('End');
  await expect(slider).toHaveValue('100');
  expect(await slider.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(formExample).toHaveScreenshot('slider-keyboard-focused.png', {
    animations: 'disabled',
  });
});

test('shows the value tooltip on hover and static tooltip on hover and keyboard focus @visual', async ({
  page,
}) => {
  const tooltips = page.getByRole('group', { name: 'Slider tooltip examples', exact: true });
  const valueSlider = tooltips.getByRole('slider', { name: 'Value tooltip' });
  const valueTooltip = page.getByRole('tooltip', { name: '40', exact: true });
  await expect(valueSlider).not.toHaveAttribute('aria-describedby');

  await valueSlider.hover();
  await expect(valueTooltip).toHaveText('40');
  await expect(valueSlider).not.toHaveAttribute('aria-describedby');
  await captureSliderAndTooltip(page, valueSlider, valueTooltip, 'slider-value-tooltip-hover.png');

  await page.mouse.move(0, 0);
  await expect(valueTooltip).toHaveCount(0);
  const staticSlider = tooltips.getByRole('slider', { name: 'Static tooltip' });
  const staticTooltip = page.getByRole('tooltip', { name: 'Playback speed', exact: true });
  await staticSlider.hover();
  await expect(staticTooltip).toHaveText('Playback speed');
  await expect(staticSlider).toHaveAttribute('aria-describedby', /kui-tooltip-\d+/);
  await expectValidDescribedBy(staticSlider);
  expect(await staticTooltip.getAttribute('id')).toBe(
    await staticSlider.getAttribute('aria-describedby'),
  );
  await captureSliderAndTooltip(
    page,
    staticSlider,
    staticTooltip,
    'slider-static-tooltip-hover.png',
  );

  await page.mouse.move(0, 0);
  await expect(staticTooltip).toHaveCount(0);
  await expect(staticSlider).not.toHaveAttribute('aria-describedby');
  await valueSlider.focus();
  await page.keyboard.press('Tab');
  await expect(staticSlider).toBeFocused();
  expect(await staticSlider.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(staticTooltip).toHaveText('Playback speed');
  await expect(staticSlider).toHaveAttribute('aria-describedby', /kui-tooltip-\d+/);
  await expectValidDescribedBy(staticSlider);
  await captureSliderAndTooltip(
    page,
    staticSlider,
    staticTooltip,
    'slider-static-tooltip-keyboard-focus.png',
  );
});

test('keeps Slider catalogue copy and consumer-provided tooltip in the active locale', async ({
  page,
}) => {
  const localeResponse = await page.request.get('/i18n/slider/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const translations = await localeResponse.json();
  const shellLocaleResponse = await page.request.get('/i18n/ru.json');
  expect(shellLocaleResponse.ok()).toBeTruthy();
  const shellTranslations = await shellLocaleResponse.json();

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: translations.title, exact: true }),
  ).toBeVisible();

  const defaultExample = page.getByRole('group', {
    name: translations.accessibility.default,
    exact: true,
  });
  await expect(
    defaultExample.getByRole('slider', { name: translations.labels.default }),
  ).toBeVisible();

  const tooltipExamples = page.getByRole('group', {
    name: translations.accessibility.tooltips,
    exact: true,
  });
  const staticTooltip = page.getByRole('tooltip', {
    name: translations.tooltips.static,
    exact: true,
  });
  await tooltipExamples.getByRole('slider', { name: translations.labels.staticTooltip }).hover();
  await expect(staticTooltip).toHaveText(translations.tooltips.static);

  await page.mouse.move(0, 0);
  await page
    .getByRole('button', { name: shellTranslations.playground.language, exact: true })
    .click();
  await expect(page.getByRole('heading', { level: 1, name: 'Slider', exact: true })).toBeVisible();
  expect(runtimeErrorsByPage.get(page)).toEqual([]);
});

test('respects reduced motion for the thumb and shared tooltip', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const tooltips = page.getByRole('group', { name: 'Slider tooltip examples', exact: true });
  const slider = tooltips.getByRole('slider', { name: 'Value tooltip' });
  const valueTooltip = page.getByRole('tooltip', { name: '40', exact: true });
  const thumbTransition = await slider.evaluate((element) => {
    const thumb = element.closest('.kui-slider')?.querySelector('.kui-slider-thumb');
    return thumb ? getComputedStyle(thumb).transitionDuration : null;
  });
  expect(thumbTransition).toBe('0s');

  await slider.hover();
  await expect(valueTooltip).toHaveText('40');
  await expect
    .poll(() => valueTooltip.evaluate((element) => getComputedStyle(element).animationName))
    .toBe('none');
});

test('fits the complete catalogue at desktop, tablet, and 320px @visual', async ({ page }) => {
  for (const [name, width, height] of [
    ['desktop', 1440, 1000],
    ['tablet', 768, 1024],
    ['mobile', 320, 2000],
  ] as const) {
    await page.setViewportSize({ width, height });
    await page
      .locator('.playground-shell__workspace')
      .evaluate((element) => element.scrollTo(0, 0));
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);

    for (const [groupName, screenshotBase] of catalogueSections) {
      const section = page.getByRole('group', { name: groupName, exact: true });
      await section.scrollIntoViewIfNeeded();
      if (groupName === 'Slider size and color variations') {
        const variantSliders = section.getByRole('slider');
        await expect(variantSliders).toHaveCount(12);
        await expect(variantSliders.last()).toBeInViewport({ ratio: 1 });
      }
      await expect(section).toHaveScreenshot(`slider-${screenshotBase}-${name}.png`, {
        animations: 'disabled',
      });
    }
  }
});

test('records that the native range remains below the touch target size at 320px', async ({
  browser,
  page,
}) => {
  const touchContext = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 320, height: 844 },
  });

  try {
    const touchPage = await touchContext.newPage();
    await touchPage.goto(new URL('/components/slider', page.url()).toString());
    const sliders = touchPage.getByRole('slider');
    await expect(sliders).toHaveCount(23);
    const defaultControlRow = touchPage.locator('.slider-default__control-row');
    await expect(defaultControlRow).toHaveCSS('min-block-size', '44px');
    await expect
      .poll(() =>
        sliders.evaluateAll((elements) =>
          elements.every((element) => element.getBoundingClientRect().height < 44),
        ),
      )
      .toBe(true);
    await expect
      .poll(() =>
        touchPage.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
      )
      .toBe(true);
  } finally {
    await touchContext.close();
  }
});

test('captures the color catalogue in the light shell theme @visual', async ({ page }) => {
  await page.getByRole('button', { name: 'Switch to light theme', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'light');
  await expect(
    page.getByRole('group', { name: 'Slider size and color variations', exact: true }),
  ).toHaveScreenshot('slider-variants-light-desktop.png', { animations: 'disabled' });
});
