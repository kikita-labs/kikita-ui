import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

// Tall viewports keep every named group inside the shell's scrolling workspace for capture.
const desktopViewport = { width: 1440, height: 2400 };
const tabletViewport = { width: 768, height: 2400 };
const mobileViewport = { width: 320, height: 2400 };

const markSelector = '[role="graphics-symbol img"]';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/chart');
  await expect(page.getByRole('heading', { level: 1, name: 'Chart' })).toBeVisible();
});

test('server-renders the Chart catalogue and hydrates without console errors', async ({ page }) => {
  const response = await page.request.get('/components/chart');

  expect(response.ok()).toBe(true);
  const serverMarkup = await response.text();
  expect(serverMarkup).toContain('Minimal chart');
  expect(serverMarkup).toContain('Sessions per weekday');
  expect(serverMarkup).toContain('graphics-document');

  const consoleErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  await page.goto('/components/chart');
  await expect(getChart(page, 'Sessions per weekday')).toBeVisible();

  for (const heading of [
    'Minimal chart',
    'Line and area',
    'Bar orientation and stacking',
    'Scatter and bubble',
    'Donut and slices',
    'Axes and grid lines',
    'Sizes',
    'Loading and empty',
    'Tooltip and value formatting',
    'Legend',
    'Alternative table',
  ]) {
    await expect(getGroup(page, heading)).toBeVisible();
  }

  expect(consoleErrors).toEqual([]);
});

test('renders the minimal line chart with defaults and captures it', async ({ page }) => {
  const example = getGroup(page, 'Minimal chart');
  const chart = getChart(example, 'Sessions per weekday');

  await expect(chart).toHaveAttribute('aria-roledescription', 'line chart');
  await expect(chart.locator(markSelector)).toHaveCount(7);
  await expect(chart.locator(markSelector).first()).toHaveAttribute(
    'aria-label',
    'Sessions · Mon: 120',
  );
  await expect(chart.locator('svg')).toHaveAttribute('viewBox', '0 0 480 280');
  await expect(example.getByRole('button', { name: /Sessions/ })).toHaveCount(0);
  await expect(example.getByRole('button', { name: 'Table', exact: true })).toBeVisible();
  await expect(example).toHaveScreenshot('chart-minimal-desktop.png', { animations: 'disabled' });
});

test('renders line and area variants and toggles series through the legend', async ({ page }) => {
  const example = getGroup(page, 'Line and area');
  const three = getGroup(example, 'Line, three series');
  const chart = getChart(three, 'Sessions, sign-ups, and trials per weekday');

  await expect(chart.locator(markSelector)).toHaveCount(21);
  await expect(chart.locator('.kui-chart__area')).toHaveCount(0);

  const sessions = three.getByRole('button', { name: 'Sessions', exact: true });
  await expect(sessions).toHaveAttribute('aria-pressed', 'true');
  await sessions.click();
  await expect(sessions).toHaveAttribute('aria-pressed', 'false');
  await expect(chart.locator(markSelector)).toHaveCount(14);
  await sessions.click();
  await expect(sessions).toHaveAttribute('aria-pressed', 'true');
  await expect(chart.locator(markSelector)).toHaveCount(21);

  await three.getByRole('button', { name: 'Trials', exact: true }).hover();
  await expect(chart.locator('.kui-chart__line.kui-chart__series--dimmed')).toHaveCount(2);
  await page.mouse.move(2, 2);
  await expect(chart.locator('.kui-chart__series--dimmed')).toHaveCount(0);
  await chart.locator(markSelector).nth(1).hover();
  await expect(three.getByRole('button', { name: 'Sign-ups', exact: true })).toHaveClass(
    /kui-chart__legend-item--active/,
  );
  await page.mouse.move(2, 2);

  const area = getChart(
    getGroup(example, 'Area, two series'),
    'Sessions and sign-ups per weekday, filled area',
  );
  await expect(area.locator('.kui-chart__area')).toHaveCount(2);

  const gaps = getChart(
    getGroup(example, 'Line with gaps'),
    'Sessions and sign-ups per weekday with missing values',
  );
  await expect(gaps.locator(markSelector)).toHaveCount(12);

  const areaGaps = getChart(
    getGroup(example, 'Area with gaps'),
    'Sessions per weekday with missing values, filled area',
  );
  await expect(areaGaps.locator(markSelector)).toHaveCount(5);

  const colors = getChart(
    getGroup(example, 'Explicit series colors'),
    'Sessions and sign-ups per weekday with explicit colors',
  );
  await expect(colors.locator('.kui-chart__line').first()).toHaveAttribute(
    'style',
    /--kui-color-success-fill/,
  );

  await expect(example).toHaveScreenshot('chart-line-area-desktop.png', {
    animations: 'disabled',
  });
});

test('renders bar orientation and stacking and recomputes only stacked bars on hide', async ({
  page,
}) => {
  const example = getGroup(page, 'Bar orientation and stacking');

  const single = getChart(getGroup(example, 'Vertical, single series'), 'Revenue by plan');
  await expect(single.locator(markSelector)).toHaveCount(4);

  const grouped = getChart(
    getGroup(example, 'Vertical, grouped'),
    'Monthly and annual revenue by plan, vertical grouped bars',
  );
  await expect(grouped.locator(markSelector)).toHaveCount(8);

  const horizontal = getChart(
    getGroup(example, 'Horizontal, grouped'),
    'Monthly and annual revenue by plan, horizontal grouped bars',
  );
  await expect(horizontal.locator(markSelector)).toHaveCount(8);

  const stacked = getChart(
    getGroup(example, 'Vertical, stacked'),
    'Monthly and annual revenue by plan, vertical stacked bars',
  );
  await expect(stacked.locator(markSelector)).toHaveCount(8);

  const horizontalStacked = getChart(
    getGroup(example, 'Horizontal, stacked'),
    'Monthly and annual revenue by plan, horizontal stacked bars',
  );
  await expect(horizontalStacked.locator(markSelector)).toHaveCount(8);

  const diverging = getChart(
    getGroup(example, 'Stacked, positive and negative'),
    'Gains and losses per weekday, stacked bars',
  );
  await expect(diverging.locator(markSelector)).toHaveCount(10);

  const gaps = getChart(
    getGroup(example, 'Grouped with gaps'),
    'Monthly and annual revenue by plan with missing values',
  );
  await expect(gaps.locator(markSelector)).toHaveCount(6);

  await expect(example).toHaveScreenshot('chart-bars-desktop.png', { animations: 'disabled' });

  const groupedTicks = await readValueTicks(grouped);
  await getGroup(example, 'Vertical, grouped')
    .getByRole('button', { name: 'Monthly', exact: true })
    .click();
  await expect(grouped.locator(markSelector)).toHaveCount(4);
  expect(await readValueTicks(grouped)).toEqual(groupedTicks);

  const stackedTicks = await readValueTicks(stacked);
  const monthly = getGroup(example, 'Vertical, stacked').getByRole('button', {
    name: 'Monthly',
    exact: true,
  });
  await monthly.click();
  await expect(monthly).toHaveAttribute('aria-pressed', 'false');
  await expect(stacked.locator(markSelector)).toHaveCount(4);
  await expect.poll(() => readValueTicks(stacked)).not.toEqual(stackedTicks);

  await expect(getGroup(example, 'Vertical, stacked')).toHaveScreenshot(
    'chart-bars-stacked-hidden-desktop.png',
    { animations: 'disabled' },
  );
});

test('renders scatter and bubble charts', async ({ page }) => {
  const example = getGroup(page, 'Scatter and bubble');

  const scatter = getChart(getGroup(example, 'Scatter, two series'), 'Age and income by plan');
  await expect(scatter).toHaveAttribute('aria-roledescription', 'scatter chart');
  await expect(scatter.locator(markSelector)).toHaveCount(10);
  await expect(
    scatter.locator('circle[aria-hidden="true"]:not(.kui-chart__grid-line)'),
  ).toHaveCount(10);

  const single = getChart(
    getGroup(example, 'Scatter, single series'),
    'Age and income for one plan',
  );
  await expect(single.locator(markSelector)).toHaveCount(5);
  await expect(getGroup(example, 'Scatter, single series').getByRole('button')).toHaveCount(1);

  const bubble = getChart(
    getGroup(example, 'Bubble, two series'),
    'Age and income by plan with bubble sizes',
  );
  await expect(bubble.locator(markSelector)).toHaveCount(10);
  const radii = await bubble
    .locator('circle[aria-hidden="true"]')
    .evaluateAll((circles) => circles.map((circle) => circle.getAttribute('r')));
  expect(new Set(radii).size).toBeGreaterThan(3);

  await expect(example).toHaveScreenshot('chart-scatter-bubble-desktop.png', {
    animations: 'disabled',
  });
});

test('renders donut slices and re-partitions when a slice is hidden', async ({ page }) => {
  const example = getGroup(page, 'Donut and slices');

  const three = getGroup(example, 'Three slices');
  const chart = getChart(three, 'Plan mix, three slices');
  await expect(chart).toHaveAttribute('aria-roledescription', 'donut chart');
  await expect(chart.locator(markSelector)).toHaveCount(3);
  await expect(chart.locator(markSelector).first()).toHaveAttribute('aria-label', 'Free: 40 (40%)');

  const pro = three.getByRole('button', { name: 'Pro', exact: true });
  await pro.click();
  await expect(pro).toHaveAttribute('aria-pressed', 'false');
  await expect(chart.locator(markSelector)).toHaveCount(2);
  await expect(chart.locator(markSelector).first()).toHaveAttribute('aria-label', 'Free: 40 (62%)');
  await pro.click();
  await expect(chart.locator(markSelector)).toHaveCount(3);

  await expect(
    getChart(getGroup(example, 'Five slices'), 'Plan mix, five slices').locator(markSelector),
  ).toHaveCount(5);
  await expect(
    getChart(getGroup(example, 'Single slice'), 'Plan mix, single slice').locator(markSelector),
  ).toHaveCount(1);

  const negative = getGroup(example, 'Negative value dropped');
  await expect(
    getChart(negative, 'Plan mix with a negative value dropped').locator(markSelector),
  ).toHaveCount(2);

  await expect(example).toHaveScreenshot('chart-donut-desktop.png', { animations: 'disabled' });
});

test('shows axis and grid-line configurations', async ({ page }) => {
  const example = getGroup(page, 'Axes and grid lines');

  const defaults = getChart(
    getGroup(example, 'Default axes'),
    'Sessions per weekday for axes configuration',
  );
  await expect(defaults.locator('.kui-chart__axis-text--x')).not.toHaveCount(0);
  await expect(defaults.locator('.kui-chart__axis-text--y')).not.toHaveCount(0);

  const noCategory = getChart(
    getGroup(example, 'Category axis hidden'),
    'Sessions per weekday for axes configuration',
  );
  await expect(noCategory.locator('.kui-chart__axis-text--x')).toHaveCount(0);
  await expect(noCategory.locator('.kui-chart__axis-text--y')).not.toHaveCount(0);

  const noValue = getChart(
    getGroup(example, 'Value axis hidden'),
    'Sessions per weekday for axes configuration',
  );
  await expect(noValue.locator('.kui-chart__axis-text--y')).toHaveCount(0);

  const noAxes = getChart(
    getGroup(example, 'Both axes hidden'),
    'Sessions per weekday for axes configuration',
  );
  await expect(noAxes.locator('.kui-chart__axis-text')).toHaveCount(0);

  const noGrid = getChart(
    getGroup(example, 'No grid lines'),
    'Sessions per weekday for axes configuration',
  );
  await expect(noGrid.locator('.kui-chart__grid-line')).toHaveCount(0);
  const horizontal = getChart(
    getGroup(example, 'Horizontal grid lines'),
    'Sessions per weekday for axes configuration',
  );
  await expect(horizontal.locator('.kui-chart__grid-line')).not.toHaveCount(0);

  await expect(example).toHaveScreenshot('chart-axes-desktop.png', { animations: 'disabled' });
});

test('applies nominal sizes to every chart type', async ({ page }) => {
  const example = getGroup(page, 'Sizes');
  const dimensions = { sm: '0 0 320 200', md: '0 0 480 280', lg: '0 0 640 360' } as const;
  const donutDimensions = { sm: '0 0 200 200', md: '0 0 280 280', lg: '0 0 360 360' } as const;

  for (const [type, label] of [
    ['line', 'Line'],
    ['bar', 'Bar'],
    ['scatter', 'Scatter'],
    ['donut', 'Donut'],
  ] as const) {
    for (const size of ['sm', 'md', 'lg'] as const) {
      const chart = getChart(
        getGroup(example, `${label}, size ${size}`),
        `${label} chart, size ${size}`,
      );
      await expect(chart.locator('svg')).toHaveAttribute(
        'viewBox',
        type === 'donut' ? donutDimensions[size] : dimensions[size],
      );
    }
  }

  await expect(example).toHaveScreenshot('chart-sizes-desktop.png', { animations: 'disabled' });
});

test('shows loading skeletons and empty compositions for every type', async ({ page }) => {
  const example = getGroup(page, 'Loading and empty');
  const loadingRow = getGroup(example, 'Charts in loading state');
  const emptyRow = getGroup(example, 'Charts in empty state');

  await expect(loadingRow.getByRole('status', { name: 'Loading chart' })).toHaveCount(4);
  await expect(loadingRow.locator(markSelector)).toHaveCount(0);
  await expect(emptyRow.getByText('No data', { exact: true })).toHaveCount(4);
  await expect(emptyRow.getByRole('button', { name: 'Table' })).toHaveCount(0);

  await expect(example).toHaveScreenshot('chart-states-desktop.png', { animations: 'disabled' });
});

test('formats values and tooltips with consumer formatters', async ({ page }) => {
  const example = getGroup(page, 'Tooltip and value formatting');

  const currency = getChart(
    getGroup(example, 'Value format and custom tooltip'),
    'Sessions per weekday in dollars',
  );
  await expect(currency.locator(markSelector).first()).toHaveAttribute(
    'aria-label',
    'Sessions on Mon: $120',
  );
  await expect(currency.locator('.kui-chart__axis-text--y').last()).toContainText('$');

  const compact = getChart(
    getGroup(example, 'Default compact format'),
    'Large session counts per weekday',
  );
  await expect(compact.locator('.kui-chart__axis-text--y').last()).toContainText('M');
  await expect(compact.locator(markSelector).first()).toHaveAttribute(
    'aria-label',
    'Sessions · Mon: 1.2M',
  );

  const thousands = getChart(getGroup(example, 'Bar value format'), 'Revenue by plan in thousands');
  await expect(thousands.locator(markSelector).nth(1)).toHaveAttribute(
    'aria-label',
    'Revenue · Pro: 4.2k',
  );

  const scatter = getChart(
    getGroup(example, 'Custom scatter tooltip'),
    'Age and income by plan with custom tooltip',
  );
  await expect(scatter.locator(markSelector).first()).toHaveAttribute(
    'aria-label',
    'Free: income 32,000',
  );

  const donut = getChart(getGroup(example, 'Custom donut tooltip'), 'Plan mix with custom tooltip');
  await expect(donut.locator(markSelector).first()).toHaveAttribute(
    'aria-label',
    'Free accounts: 40',
  );

  await expect(example).toHaveScreenshot('chart-formatting-desktop.png', {
    animations: 'disabled',
  });
});

test('shows a shared tooltip on pointer hover and keyboard focus', async ({ page }) => {
  const chart = getChart(getGroup(page, 'Minimal chart'), 'Sessions per weekday');
  const marks = chart.locator(markSelector);
  const tooltip = page.getByRole('tooltip');

  await marks.nth(1).hover();
  await expect(tooltip).toHaveText('Sessions · Tue: 180');
  await expect(tooltip).toHaveCount(1);
  await marks.nth(2).hover();
  await expect(tooltip).toHaveText('Sessions · Wed: 150');
  await expect(tooltip).toHaveCount(1);

  await page.mouse.move(2, 2);
  await expect(tooltip).toHaveCount(0);
});

test('enters a chart at its roving tab stop, shows the focus tooltip, and leaves with Tab', async ({
  page,
}) => {
  const example = getGroup(page, 'Minimal chart');
  const chart = getChart(example, 'Sessions per weekday');
  const marks = chart.locator(markSelector);
  const tooltip = page.getByRole('tooltip');

  // Server-rendered mark ids come from a process-wide counter, while the client counter restarts
  // at 1. The first mark carries the client id only after hydration; pressing keys earlier is
  // replayed and Chart's keydown handler throws on preventDefault (see the inventory).
  await expect(marks.nth(0)).toHaveAttribute('id', 'kui-line-chart-1-mark-0');
  await expect(marks.nth(0)).toHaveAttribute('tabindex', '0');
  await expect(marks.nth(1)).toHaveAttribute('tabindex', '-1');

  await marks.nth(3).focus();
  await expect(tooltip).toHaveText('Sessions · Thu: 220');
  expect(await marks.nth(3).evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(example).toHaveScreenshot('chart-minimal-focus-visible-desktop.png', {
    animations: 'disabled',
  });

  await page.keyboard.press('Tab');
  await expect(example.getByRole('button', { name: 'Table', exact: true })).toBeFocused();
  await expect(tooltip).toHaveCount(0);

  await page.keyboard.press('Shift+Tab');
  await expect(marks.nth(3)).toBeFocused();
  await expect(tooltip).toHaveText('Sessions · Thu: 220');
});

test('moves the roving tab stop with arrow, Home, and End keys and re-enters there', async ({
  page,
}) => {
  const example = getGroup(page, 'Minimal chart');
  const marks = getChart(example, 'Sessions per weekday').locator(markSelector);

  await expect(marks.nth(0)).toHaveAttribute('id', 'kui-line-chart-1-mark-0');
  await marks.nth(0).focus();

  await page.keyboard.press('ArrowRight');
  await expect(marks.nth(1)).toHaveAttribute('tabindex', '0');
  await expect(marks.nth(0)).toHaveAttribute('tabindex', '-1');
  await page.keyboard.press('End');
  await expect(marks.nth(6)).toHaveAttribute('tabindex', '0');
  await page.keyboard.press('ArrowLeft');
  await expect(marks.nth(5)).toHaveAttribute('tabindex', '0');
  await page.keyboard.press('Home');
  await expect(marks.nth(0)).toHaveAttribute('tabindex', '0');
  await page.keyboard.press('ArrowUp');
  await expect(marks.nth(1)).toHaveAttribute('tabindex', '0');

  // DOM focus stays on the first mark (see the fixme below), so move it to the Table button
  // directly before re-entering with Shift+Tab.
  const table = example.getByRole('button', { name: 'Table', exact: true });
  await table.focus();
  await page.keyboard.press('Shift+Tab');
  await expect(marks.nth(1)).toBeFocused();
  await expect(page.getByRole('tooltip')).toHaveText('Sessions · Tue: 180');
});

// Known library gap (record only, fix belongs to Plan 24): arrow keys update the roving tab stop
// but never move DOM focus, because the keydown handlers call focus() on an ElementRef.
test.fixme('moves DOM focus to the adjacent mark on ArrowRight', async ({ page }) => {
  const marks = getChart(getGroup(page, 'Minimal chart'), 'Sessions per weekday').locator(
    markSelector,
  );

  await expect(marks.nth(0)).toHaveAttribute('id', 'kui-line-chart-1-mark-0');
  await marks.nth(0).focus();
  await page.keyboard.press('ArrowRight');
  await expect(marks.nth(1)).toBeFocused();
});

test('supports automatic, disabled, forced, standalone, and custom legends', async ({ page }) => {
  const example = getGroup(page, 'Legend');

  await expect(example).toHaveScreenshot('chart-legend-desktop.png', { animations: 'disabled' });

  const automatic = getGroup(example, 'Automatic legend');
  await expect(automatic.getByRole('button', { name: 'Sessions', exact: true })).toBeVisible();
  await expect(automatic.getByRole('button', { name: 'Sign-ups', exact: true })).toBeVisible();

  const off = getGroup(example, 'Legend turned off');
  await expect(off.getByRole('button')).toHaveCount(1);
  await expect(off.getByRole('button', { name: 'Table', exact: true })).toBeVisible();

  const forced = getGroup(example, 'Legend on one series');
  await expect(forced.getByRole('button', { name: 'Sessions', exact: true })).toBeVisible();

  const stacked = getGroup(example, 'Legend on stacked bars');
  await expect(stacked.getByRole('button', { name: 'Annual', exact: true })).toBeVisible();

  const standalone = getGroup(example, 'Standalone legend');
  const standaloneChart = getChart(standalone, 'Age and income with standalone legend');
  const free = standalone.getByRole('button', { name: 'Free', exact: true });
  await expect(free).toHaveAttribute('aria-pressed', 'true');
  await expect(standaloneChart.locator(markSelector)).toHaveCount(10);
  await free.click();
  await expect(free).toHaveAttribute('aria-pressed', 'false');
  await expect(standaloneChart.locator(markSelector)).toHaveCount(5);
  await free.click();
  await expect(standaloneChart.locator(markSelector)).toHaveCount(10);

  const custom = getGroup(example, 'Custom legend template');
  const customChart = getChart(custom, 'Plan mix with custom legend');
  const business = custom.getByRole('button', { name: 'Business', exact: true });
  await expect(business).toHaveAttribute('aria-pressed', 'true');
  await business.click();
  await expect(business).toHaveAttribute('aria-pressed', 'false');
  await expect(customChart.locator(markSelector)).toHaveCount(2);

  await expect(custom).toHaveScreenshot('chart-legend-custom-hidden-desktop.png', {
    animations: 'disabled',
  });
});

test('switches every chart type to its exact-value alternative table and back', async ({
  page,
}) => {
  const example = getGroup(page, 'Alternative table');

  const line = getGroup(example, 'Line table');
  await line.getByRole('button', { name: 'Table', exact: true }).click();
  await expect(line.getByRole('table')).toBeVisible();
  await expect(line.getByRole('cell', { name: '1234', exact: true })).toBeVisible();
  await expect(line.getByRole('cell', { name: '3017', exact: true })).toBeVisible();
  await expect(line.getByRole('columnheader')).toHaveText(['Category', 'Sessions', 'Sign-ups']);

  const bar = getGroup(example, 'Bar table');
  await bar.getByRole('button', { name: 'Table', exact: true }).click();
  await expect(bar.getByRole('cell', { name: '15600', exact: true })).toBeVisible();

  const scatter = getGroup(example, 'Scatter table');
  await scatter.getByRole('button', { name: 'Table', exact: true }).click();
  await expect(scatter.getByRole('columnheader')).toHaveText(['Series', 'X', 'Y']);
  await expect(scatter.getByRole('cell', { name: '32000', exact: true })).toBeVisible();

  const bubble = getGroup(example, 'Bubble table');
  await bubble.getByRole('button', { name: 'Table', exact: true }).click();
  await expect(bubble.getByRole('columnheader')).toHaveText(['Series', 'X', 'Y', 'R']);

  const donut = getGroup(example, 'Donut table');
  await donut.getByRole('button', { name: 'Table', exact: true }).click();
  await expect(donut.getByRole('columnheader')).toHaveText(['Label', 'Value']);
  await expect(donut.getByRole('cell', { name: 'Free', exact: true })).toBeVisible();

  await expect(example).toHaveScreenshot('chart-tables-desktop.png', { animations: 'disabled' });

  await line.getByRole('button', { name: 'Chart', exact: true }).click();
  await expect(line.getByRole('table')).toHaveCount(0);
  await expect(getChart(line, 'Exact session and sign-up counts')).toBeVisible();
});

test('shows Russian page copy and translated chart data after a runtime language switch', async ({
  page,
}) => {
  const russianResponse = await page.request.get('/i18n/chart/ru.json');
  expect(russianResponse.ok()).toBe(true);
  const russian = (await russianResponse.json()) as {
    title: string;
    examples: { minimal: string; formatting: string; states: string };
    labels: { formatCurrency: string };
    charts: { sessions: string; sessionsCurrency: string };
    series: { sessions: string };
    weekdays: { mon: string };
    tooltip: { cartesian: string };
  };

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();

  await expect(page.getByRole('heading', { level: 1, name: russian.title })).toBeVisible();
  const minimal = getGroup(page, russian.examples.minimal);
  const chart = getChart(minimal, russian.charts.sessions);
  await expect(chart.locator(markSelector).first()).toHaveAttribute(
    'aria-label',
    `${russian.series.sessions} · ${russian.weekdays.mon}: 120`,
  );

  const formatting = getGroup(page, russian.examples.formatting);
  await expect(
    getChart(getGroup(formatting, russian.labels.formatCurrency), russian.charts.sessionsCurrency)
      .locator(markSelector)
      .first(),
  ).toHaveAttribute(
    'aria-label',
    russian.tooltip.cartesian
      .replace('{{series}}', russian.series.sessions)
      .replace('{{category}}', russian.weekdays.mon)
      .replace('{{value}}', '$120'),
  );

  // Chart's own built-in strings ("Table", "No data", "Loading chart") are not localizable yet.
  await expect(minimal.getByRole('button', { name: 'Table', exact: true })).toBeVisible();
  await expect(
    getGroup(page, russian.examples.states).getByText('No data', { exact: true }).first(),
  ).toBeVisible();
});

test('keeps the Chart catalogue within tablet and 320px layouts', async ({ page }) => {
  for (const viewport of [
    { ...tabletViewport, name: 'tablet-768' },
    { ...mobileViewport, name: 'mobile-320' },
  ]) {
    await page.setViewportSize(viewport);
    await collapseMobileNavigation(page);
    await expectNoHorizontalOverflow(page);
    await expect(page.getByRole('heading', { level: 1, name: 'Chart' })).toBeVisible();

    await expect(getGroup(page, 'Minimal chart')).toHaveScreenshot(
      `chart-minimal-${viewport.name}.png`,
      { animations: 'disabled' },
    );
    await expect(getGroup(page, 'Line, three series')).toHaveScreenshot(
      `chart-line-three-${viewport.name}.png`,
      { animations: 'disabled' },
    );
    await expect(getGroup(page, 'Three slices')).toHaveScreenshot(
      `chart-donut-${viewport.name}.png`,
      { animations: 'disabled' },
    );
    // The bar loading skeleton overflows containers narrower than about 452px (see the
    // inventory), so the narrow captures use the other three loading skeletons.
    await expect(getGroup(page, 'Scatter, loading')).toHaveScreenshot(
      `chart-scatter-loading-${viewport.name}.png`,
      { animations: 'disabled' },
    );
    await expect(getGroup(page, 'Line, empty')).toHaveScreenshot(
      `chart-line-empty-${viewport.name}.png`,
      { animations: 'disabled' },
    );
  }
});

async function readValueTicks(chart: Locator): Promise<string[]> {
  return (await chart.locator('.kui-chart__axis-text--y').allTextContents()).map((text) =>
    text.trim(),
  );
}

function getGroup(container: Page | Locator, accessibleName: string): Locator {
  return container.getByRole('group', { name: accessibleName, exact: true });
}

function getChart(container: Page | Locator, accessibleName: string): Locator {
  return container.locator(`[role="graphics-document"][aria-label="${accessibleName}"]`);
}

async function collapseMobileNavigation(page: Page): Promise<void> {
  const navigation = page.getByRole('navigation', {
    name: 'Component navigation',
    exact: true,
  });

  for (const category of ['Actions', 'Forms', 'Surfaces', 'Feedback', 'Data and identity']) {
    const toggle = navigation.getByRole('button', { name: category, exact: true });

    if ((await toggle.getAttribute('aria-expanded')) === 'true') await toggle.click();
  }
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}
