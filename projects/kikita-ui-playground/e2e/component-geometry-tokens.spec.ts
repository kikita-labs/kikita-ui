import { expect, test } from './support/fixtures';

/**
 * Geometry tokens (radius, font size, height, gap, padding) default to the scale tokens, and a token
 * set on an ancestor reaches the component even when the component also assigns a per-variant
 * default of its own (those defaults are private variables, so they never shadow the public token).
 */
const cases = [
  {
    route: 'alert',
    selector: '.kui-alert',
    hook: '--kui-alert-radius',
    property: 'borderRadius',
    value: '3px',
  },
  {
    route: 'alert',
    selector: '.kui-alert',
    hook: '--kui-alert-gap',
    property: 'columnGap',
    value: '19px',
  },
  {
    route: 'badge',
    selector: '.kui-badge',
    hook: '--kui-badge-height',
    property: 'minHeight',
    value: '37px',
  },
  {
    route: 'calendar',
    selector: '.kui-calendar',
    hook: '--kui-calendar-radius',
    property: 'borderRadius',
    value: '5px',
  },
  {
    route: 'card',
    selector: '.kui-card',
    hook: '--kui-card-padding',
    property: 'paddingTop',
    value: '23px',
  },
  {
    route: 'file-upload',
    selector: '.kui-file-upload-dropzone',
    hook: '--kui-file-upload-dropzone-gap',
    property: 'rowGap',
    value: '17px',
  },
  {
    route: 'accordion',
    selector: '.kui-accordion-body-content',
    hook: '--kui-accordion-body-content-font-size',
    property: 'fontSize',
    value: '21px',
  },
  {
    route: 'stepper',
    selector: '.kui-step-label',
    hook: '--kui-stepper-label-font-size',
    property: 'fontSize',
    value: '22px',
  },
] as const;

for (const { route, selector, hook, property, value } of cases) {
  test(`${hook} reaches ${selector} on the ${route} page`, async ({ page }) => {
    await page.goto(`/components/${route}`);

    const read = () =>
      page.evaluate(
        ([targetSelector, cssProperty]) => {
          const element = document.querySelector(targetSelector);

          return element
            ? (getComputedStyle(element) as unknown as Record<string, string>)[cssProperty]
            : null;
        },
        [selector, property],
      );

    const before = await read();
    expect(before, `${selector} is rendered`).not.toBeNull();

    await page
      .locator('html')
      .evaluate((element, [name, token]) => element.style.setProperty(name, token), [hook, value]);

    await expect.poll(read).toBe(value);
    expect(before).not.toBe(value);
  });
}
