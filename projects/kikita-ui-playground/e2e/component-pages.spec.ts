import { expect, test } from './support/fixtures';
import { expectNoDocumentOverflow } from './support/page-ready';

const componentPages = [
  { path: '/components/accordion', title: 'Accordion' },
  { path: '/components/breadcrumbs', title: 'Breadcrumbs' },
  { path: '/components/button', title: 'Button' },
  { path: '/components/icon-button', title: 'Icon Button' },
  { path: '/components/menu', title: 'Menu' },
  { path: '/components/command-palette', title: 'Command Palette' },
  { path: '/components/calendar', title: 'Calendar' },
  { path: '/components/checkbox', title: 'Checkbox' },
  { path: '/components/color-input', title: 'Color Input' },
  { path: '/components/combobox', title: 'Combobox' },
  { path: '/components/date-picker', title: 'Date Picker' },
  { path: '/components/number-input', title: 'Number Input' },
  { path: '/components/segmented', title: 'Segmented' },
  { path: '/components/popover', title: 'Popover' },
  { path: '/components/field', title: 'Field' },
  { path: '/components/file-upload', title: 'File Upload' },
  { path: '/components/group', title: 'Group' },
  { path: '/components/input', title: 'Input' },
  { path: '/components/loader', title: 'Loader' },
  { path: '/components/progress', title: 'Progress' },
  { path: '/components/skeleton', title: 'Skeleton' },
  { path: '/components/toast', title: 'Toast' },
  { path: '/components/radio', title: 'Radio' },
  { path: '/components/select', title: 'Select' },
  { path: '/components/slider', title: 'Slider' },
  { path: '/components/switch', title: 'Switch' },
  { path: '/components/textarea', title: 'Textarea' },
  { path: '/components/card', title: 'Card' },
  { path: '/components/dialog', title: 'Dialog' },
  { path: '/components/drawer', title: 'Drawer' },
  { path: '/components/dropdown', title: 'Dropdown' },
  { path: '/components/separator', title: 'Separator' },
  { path: '/components/tooltip', title: 'Tooltip' },
  { path: '/components/avatar', title: 'Avatar' },
  { path: '/components/chart', title: 'Chart' },
  { path: '/components/chip', title: 'Chip' },
  { path: '/components/icon', title: 'Icon' },
  { path: '/components/scrollbar', title: 'Scrollbar' },
  { path: '/components/table', title: 'Table' },
  { path: '/components/tabs', title: 'Tabs' },
  { path: '/components/stepper', title: 'Stepper' },
  { path: '/components/tree', title: 'Tree' },
  { path: '/components/badge', title: 'Badge' },
  { path: '/components/empty-state', title: 'Empty State' },
  { path: '/components/alert', title: 'Alert' },
  { path: '/components/calendar-range', title: 'Calendar Range' },
  { path: '/components/carousel', title: 'Carousel' },
  { path: '/components/link', title: 'Link' },
  { path: '/components/media-viewer', title: 'Media viewer' },
  { path: '/components/otp-input', title: 'OTP Input' },
  { path: '/components/pagination', title: 'Pagination' },
  { path: '/components/splitter', title: 'Splitter' },
  { path: '/components/time-picker', title: 'Time Picker' },
  { path: '/components/typography', title: 'Typography' },
] as const;

// Both tests below walk every component page, which Firefox and WebKit load several times slower.
const slowEngineFactor = 5;

test('server renders each component page and hydrates its selected navigation item', async ({
  page,
  browserName,
}) => {
  if (browserName !== 'chromium') test.setTimeout(30_000 * slowEngineFactor);
  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  for (const component of componentPages) {
    const response = await page.request.get(component.path);
    expect(response.ok(), component.path).toBeTruthy();

    const serverMarkup = await response.text();
    const serverHeadings = [...serverMarkup.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(
      ([, heading]) =>
        heading
          .replace(/<[^>]+>/g, '')
          .trim()
          .toLocaleLowerCase(),
    );
    expect(serverHeadings, `${component.path} should include its heading in SSR HTML`).toContain(
      component.title.toLocaleLowerCase(),
    );

    await page.goto(component.path);

    await expect(
      page.getByRole('heading', { level: 1, name: new RegExp(component.title, 'i') }),
    ).toBeVisible();
    const selectedLink = page.locator('.component-list__item[aria-current="page"]');
    await expect(selectedLink).toHaveCount(1);
    await expect(selectedLink).toContainText(new RegExp(component.title, 'i'));
  }

  expect(consoleErrors).toEqual([]);
});

test('component page catalogues fit mobile, tablet, and desktop viewports', async ({
  page,
  browserName,
}) => {
  test.setTimeout(browserName === 'chromium' ? 120_000 : 120_000 * slowEngineFactor);

  for (const viewport of [
    { width: 320, height: 640 },
    { width: 390, height: 844 },
    { width: 768, height: 1024 },
    { width: 1440, height: 1000 },
  ]) {
    await page.setViewportSize(viewport);

    for (const component of componentPages) {
      await page.goto(component.path);
      await expect(
        page.getByRole('heading', { level: 1, name: new RegExp(component.title, 'i') }),
      ).toBeVisible();

      const widths = await page.evaluate(() => ({
        document: document.documentElement.scrollWidth,
        viewport: window.innerWidth,
      }));

      expect(
        widths.document,
        `${component.path} at ${viewport.width}px: ${JSON.stringify(widths)}`,
      ).toBeLessThanOrEqual(widths.viewport);
    }
  }
});

// The library has no direction-aware behavior yet (see docs/browser-test-coverage.md), so this only
// protects layout: physical-side CSS must not push content past the viewport when the document
// direction flips.
test('has no document overflow and keeps overlays on screen in right-to-left layout', async ({
  page,
}) => {
  test.setTimeout(120_000);

  for (const width of [320, 1440] as const) {
    await page.setViewportSize({ width, height: 900 });

    for (const [path, title] of [
      ['/components/field', 'Field'],
      ['/components/select', 'Select'],
      ['/components/table', 'Table'],
      ['/components/dialog', 'Dialog'],
    ] as const) {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1, name: title })).toBeVisible();
      await page.evaluate(() => {
        document.documentElement.dir = 'rtl';
      });
      await expectNoDocumentOverflow(page);
    }

    await page.goto('/components/select');
    await expect(page.getByRole('heading', { level: 1, name: 'Select' })).toBeVisible();
    await page.evaluate(() => {
      document.documentElement.dir = 'rtl';
    });
    await page
      .getByRole('group', { name: 'Default select example', exact: true })
      .getByRole('combobox', { name: 'Role', exact: true })
      .click();

    const listbox = page.getByRole('listbox');
    await expect(listbox).toBeVisible();
    const box = await listbox.boundingBox();

    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(width);
  }
});
