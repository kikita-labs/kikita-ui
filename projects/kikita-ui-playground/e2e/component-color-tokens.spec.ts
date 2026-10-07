import { expect, test } from './support/fixtures';

/**
 * Every color part of a public component reads a component token that defaults to a semantic role.
 * Setting the token must restyle that part, and leaving it unset must keep the semantic color.
 */
const cases = [
  { route: 'card', selector: '.kui-card', hook: '--kui-card-color', property: 'color' },
  {
    route: 'calendar',
    selector: '.kui-calendar',
    hook: '--kui-calendar-bg',
    property: 'backgroundColor',
  },
  { route: 'table', selector: '.kui-table', hook: '--kui-table-color', property: 'color' },
  {
    route: 'accordion',
    selector: '.kui-accordion-chevron',
    hook: '--kui-accordion-chevron-color',
    property: 'color',
  },
  {
    route: 'stepper',
    selector: '.kui-step-description',
    hook: '--kui-stepper-description-color',
    property: 'color',
  },
  {
    route: 'file-upload',
    selector: '.kui-file-upload-dropzone-text',
    hook: '--kui-file-upload-dropzone-text-color',
    property: 'color',
  },
] as const;

for (const { route, selector, hook, property } of cases) {
  test(`${hook} restyles ${selector} on the ${route} page`, async ({ page }) => {
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
      .evaluate((element, name) => element.style.setProperty(name, 'rgb(12, 34, 56)'), hook);

    await expect.poll(read).toBe('rgb(12, 34, 56)');
    expect(before).not.toBe('rgb(12, 34, 56)');
  });
}
