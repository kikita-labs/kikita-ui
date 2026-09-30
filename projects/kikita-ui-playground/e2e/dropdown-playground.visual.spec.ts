import { expect, test } from './support/fixtures';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/dropdown');
  await expect(page.getByRole('heading', { name: 'Dropdown', level: 1 })).toBeVisible();
});

test('server-renders Dropdown closed and hydrates its keyboard opening', async ({
  browser,
  page,
}) => {
  const routeUrl = new URL('/components/dropdown', page.url()).toString();
  const serverContext = await browser.newContext({ javaScriptEnabled: false });

  try {
    const serverPage = await serverContext.newPage();
    const response = await serverPage.goto(routeUrl);

    expect(response?.status()).toBe(200);
    await expect(serverPage.getByRole('heading', { level: 1, name: 'Dropdown' })).toBeVisible();
    const serverExample = serverPage.getByRole('group', {
      name: 'Default listbox example',
      exact: true,
    });
    const serverTrigger = serverExample.getByRole('button', { name: 'Options', exact: true });
    await expect(serverTrigger).toHaveAttribute('aria-haspopup', 'listbox');
    await expect(serverTrigger).toHaveAttribute('aria-expanded', 'false');
    await expect(serverPage.getByRole('listbox')).toHaveCount(0);
  } finally {
    await serverContext.close();
  }

  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));

  await page.goto('/components/dropdown');
  const example = page.getByRole('group', { name: 'Default listbox example', exact: true });
  const trigger = example.getByRole('button', { name: 'Options', exact: true });
  await trigger.press('ArrowDown');

  const listbox = page.getByRole('listbox', { name: 'Options', exact: true });
  await expect(listbox).toBeVisible();
  await expect(listbox.getByRole('option', { name: 'Rename', exact: true })).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(listbox).toBeHidden();
  expect(runtimeErrors).toEqual([]);
});

test('captures the named Dropdown catalogue groups @visual', async ({ page }) => {
  const groups = [
    { name: 'Dropdown options and selection behavior', screenshot: 'dropdown-options.png' },
    { name: 'Dropdown panel width strategies', screenshot: 'dropdown-widths.png' },
    { name: 'Dropdown panel height and offset examples', screenshot: 'dropdown-height-offset.png' },
    { name: 'Controlled Dropdown open state example', screenshot: 'dropdown-controlled.png' },
    { name: 'Dropdown viewport placement example', screenshot: 'dropdown-edge-placement.png' },
    {
      name: 'Dropdown anchor scroll dismissal example',
      screenshot: 'dropdown-anchor-dismissal.png',
    },
  ];

  for (const group of groups) {
    await expect(page.getByRole('group', { name: group.name, exact: true })).toHaveScreenshot(
      group.screenshot,
      { animations: 'disabled' },
    );
  }
});

test('opens the default listbox with its accessible trigger and option semantics @visual', async ({
  page,
}) => {
  const example = page.getByRole('group', { name: 'Default listbox example', exact: true });
  const trigger = example.getByRole('button', { name: 'Options', exact: true });
  await expect(trigger).toHaveAttribute('aria-haspopup', 'listbox');
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).not.toHaveAttribute('aria-controls', /.+/);

  await trigger.click();

  const listbox = page.getByRole('listbox', { name: 'Options', exact: true });
  await expect(listbox).toBeVisible();
  await expect(listbox).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
  const panelId = await listbox.getAttribute('id');
  expect(panelId).toBeTruthy();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await expect(trigger).toHaveAttribute('aria-controls', panelId!);
  const triggerBounds = await trigger.boundingBox();
  const panelBounds = await listbox.boundingBox();
  expect(triggerBounds).not.toBeNull();
  expect(panelBounds).not.toBeNull();
  expect(
    Math.abs(panelBounds!.y - triggerBounds!.y - triggerBounds!.height - 4),
  ).toBeLessThanOrEqual(1);
  await expect(listbox.getByRole('option', { name: 'Rename', exact: true })).toHaveAttribute(
    'aria-selected',
    'false',
  );
  await expect(listbox.getByRole('option', { name: 'Archive', exact: true })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await expect(listbox).toHaveScreenshot('dropdown-options-open.png', {
    animations: 'disabled',
  });

  await listbox.getByRole('option', { name: 'Duplicate', exact: true }).click();
  await expect(example.getByRole('status')).toHaveText('Option event: duplicate');
  await expect(listbox).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await expect(trigger).not.toHaveAttribute('aria-controls', /.+/);
});

test('captures a real pointer hover on an enabled listbox option @visual', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default listbox example', exact: true });
  await example.getByRole('button', { name: 'Options', exact: true }).click();

  const listbox = page.getByRole('listbox', { name: 'Options', exact: true });
  const hoveredOption = listbox.getByRole('option', { name: 'Duplicate', exact: true });
  await expect(listbox).toBeVisible();
  await hoveredOption.hover();
  await expect
    .poll(() => hoveredOption.evaluate((element) => element.matches(':hover')))
    .toBe(true);
  await expect(listbox).toHaveScreenshot('dropdown-options-hover.png', {
    animations: 'disabled',
  });
});

test('keeps a disabled option inert and the default listbox open', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default listbox example', exact: true });
  const trigger = example.getByRole('button', { name: 'Options', exact: true });
  await trigger.click();

  const listbox = page.getByRole('listbox', { name: 'Options', exact: true });
  const disabledOption = listbox.getByRole('option', { name: 'Archive', exact: true });
  await expect(disabledOption).toHaveAttribute('aria-disabled', 'true');
  await disabledOption.evaluate((element) => (element as HTMLElement).click());

  await expect(listbox).toBeVisible();
  await expect(example.getByRole('status')).toHaveCount(0);
});

test('keeps the listbox open after keyboard selection when closeOnSelect is false', async ({
  page,
}) => {
  const example = page.getByRole('group', {
    name: 'Keep open after selection example',
    exact: true,
  });
  const trigger = example.getByRole('button', { name: 'Keep open', exact: true });
  await trigger.press('ArrowDown');

  const listbox = page.getByRole('listbox', { name: 'Keep open', exact: true });
  const rename = listbox.getByRole('option', { name: 'Rename', exact: true });
  const duplicate = listbox.getByRole('option', { name: 'Duplicate', exact: true });
  const deleteOption = listbox.getByRole('option', { name: 'Delete', exact: true });
  await expect(rename).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(duplicate).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(deleteOption).toBeFocused();
  await page.keyboard.press('ArrowUp');
  await expect(duplicate).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(listbox).toBeVisible();
  await expect(example.getByRole('status')).toHaveText('Option event: duplicate');
});

test('applies anchor, content, auto, and explicit panel widths', async ({ page }) => {
  const examples = page.getByRole('group', {
    name: 'Dropdown panel width strategies',
    exact: true,
  });
  const cases = [
    { label: 'Anchor width', strategy: 'anchor' },
    { label: 'Content width', strategy: 'content' },
    { label: 'Auto width', strategy: 'auto' },
    { label: '16 rem width', strategy: 'explicit' },
  ] as const;

  for (const { label, strategy } of cases) {
    const trigger = examples.getByRole('button', { name: label, exact: true });
    await trigger.click();

    const listbox = page.getByRole('listbox', { name: label, exact: true });
    await expect(listbox).toBeVisible();
    await listbox.evaluate(async (element) => {
      await Promise.all(element.getAnimations().map((animation) => animation.finished));
    });
    const triggerBounds = await trigger.boundingBox();
    const panelBounds = await listbox.boundingBox();
    expect(triggerBounds).not.toBeNull();
    expect(panelBounds).not.toBeNull();
    if (strategy === 'anchor') {
      expect(Math.abs(panelBounds!.width - triggerBounds!.width)).toBeLessThanOrEqual(1);
    } else if (strategy === 'content') {
      expect(panelBounds!.width).toBeGreaterThan(triggerBounds!.width);
    } else if (strategy === 'auto') {
      expect(panelBounds!.width).toBeGreaterThan(triggerBounds!.width);
    } else {
      expect(Math.abs(panelBounds!.width - 256)).toBeLessThanOrEqual(1);
    }

    await page.keyboard.press('Escape');
    await expect(listbox).toBeHidden();
  }
});

test('positions the panel at zero and twelve pixel offsets', async ({ page }) => {
  const examples = page.getByRole('group', {
    name: 'Dropdown panel height and offset examples',
    exact: true,
  });

  for (const { label, offset } of [
    { label: 'Zero offset', offset: 0 },
    { label: '12 px offset', offset: 12 },
  ]) {
    const trigger = examples.getByRole('button', { name: label, exact: true });
    await trigger.click();

    const listbox = page.getByRole('listbox', { name: label, exact: true });
    await expect(listbox).toBeVisible();
    await expect(listbox).toHaveCSS('transform', 'matrix(1, 0, 0, 1, 0, 0)');
    const triggerBounds = await trigger.boundingBox();
    const panelBounds = await listbox.boundingBox();
    expect(triggerBounds).not.toBeNull();
    expect(panelBounds).not.toBeNull();
    expect(
      Math.abs(panelBounds!.y - triggerBounds!.y - triggerBounds!.height - offset),
    ).toBeLessThanOrEqual(1);

    await page.keyboard.press('Escape');
    await expect(listbox).toBeHidden();
  }
});

test('shows the default and preferred max-height caps with internal scrolling', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1600 });
  const examples = page.getByRole('group', {
    name: 'Dropdown panel height and offset examples',
    exact: true,
  });

  for (const { label, expectedMaxHeight } of [
    { label: 'Default 240 px cap', expectedMaxHeight: 240 },
    { label: '120 px preferred cap', expectedMaxHeight: 120 },
  ]) {
    const trigger = examples.getByRole('button', { name: label, exact: true });
    await trigger.scrollIntoViewIfNeeded();
    await trigger.click();

    const listbox = page.getByRole('listbox', { name: label, exact: true });
    await expect(listbox).toBeVisible();
    await expect
      .poll(() =>
        listbox.evaluate((element) => Number.parseFloat(getComputedStyle(element).maxHeight)),
      )
      .toBe(expectedMaxHeight);
    await expect
      .poll(() => listbox.evaluate((element) => element.scrollHeight > element.clientHeight))
      .toBe(true);
    await listbox.evaluate((element) => {
      element.scrollTop = element.scrollHeight;
    });
    await expect.poll(() => listbox.evaluate((element) => element.scrollTop > 0)).toBe(true);

    await page.keyboard.press('Escape');
    await expect(listbox).toBeHidden();
  }

  const unboundedTrigger = examples.getByRole('button', {
    name: 'No preferred cap',
    exact: true,
  });
  await unboundedTrigger.scrollIntoViewIfNeeded();
  await unboundedTrigger.click();

  const unboundedListbox = page.getByRole('listbox', { name: 'No preferred cap', exact: true });
  await expect(unboundedListbox).toBeVisible();
  await expect
    .poll(() =>
      unboundedListbox.evaluate((element) =>
        Number.parseFloat(getComputedStyle(element).maxHeight),
      ),
    )
    .toBeGreaterThan(240);
  const panelBounds = await unboundedListbox.boundingBox();
  expect(panelBounds).not.toBeNull();
  expect(panelBounds!.y).toBeGreaterThanOrEqual(0);
  expect(panelBounds!.y + panelBounds!.height).toBeLessThanOrEqual(1600);
});

test('keeps a null preferred cap within a constrained viewport and scrollable', async ({
  page,
}) => {
  const viewportHeight = 300;
  await page.setViewportSize({ width: 1440, height: viewportHeight });
  const examples = page.getByRole('group', {
    name: 'Dropdown panel height and offset examples',
    exact: true,
  });
  const trigger = examples.getByRole('button', { name: 'No preferred cap', exact: true });
  await trigger.evaluate((element) => element.scrollIntoView({ block: 'start' }));
  await trigger.click();

  const listbox = page.getByRole('listbox', { name: 'No preferred cap', exact: true });
  await expect(listbox).toBeVisible();
  await listbox.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
  });
  await expect
    .poll(() =>
      listbox.evaluate((element) => Number.parseFloat(getComputedStyle(element).maxHeight)),
    )
    .toBeLessThanOrEqual(viewportHeight - 32);
  await expect
    .poll(() => listbox.evaluate((element) => element.scrollHeight > element.clientHeight))
    .toBe(true);
  const panelBounds = await listbox.boundingBox();
  expect(panelBounds).not.toBeNull();
  expect(panelBounds!.y).toBeGreaterThanOrEqual(0);
  expect(panelBounds!.y + panelBounds!.height).toBeLessThanOrEqual(viewportHeight);

  await listbox.evaluate((element) => {
    element.scrollTop = element.scrollHeight;
  });
  await expect.poll(() => listbox.evaluate((element) => element.scrollTop > 0)).toBe(true);
});

test('keeps the open model synchronized with parent controls and Escape', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Controlled Dropdown open state example',
    exact: true,
  });
  const listbox = page.getByRole('listbox', { name: 'Controlled listbox', exact: true });

  await example.getByRole('button', { name: 'Open from parent', exact: true }).click();
  await expect(listbox).toBeVisible();
  await expect(example.getByRole('status')).toHaveText('Model state: open');
  await page.keyboard.press('Escape');
  await expect(listbox).toBeHidden();
  await expect(example.getByRole('status')).toHaveText('Model state: closed');

  await example.getByRole('button', { name: 'Open from parent', exact: true }).click();
  await expect(listbox).toBeVisible();
  await example.getByRole('button', { name: 'Close from parent', exact: true }).click();
  await expect(listbox).toBeHidden();
  await expect(example.getByRole('status')).toHaveText('Model state: closed');
});

test('closes on trigger toggle, outside click, and Tab without asserting focus restoration', async ({
  page,
}) => {
  const example = page.getByRole('group', { name: 'Default listbox example', exact: true });
  const trigger = example.getByRole('button', { name: 'Options', exact: true });
  const listbox = page.getByRole('listbox', { name: 'Options', exact: true });

  await trigger.click();
  await expect(listbox).toBeVisible();
  await trigger.click();
  await expect(listbox).toBeHidden();

  await trigger.click();
  await expect(listbox).toBeVisible();
  await page.getByRole('heading', { name: 'Dropdown', level: 1 }).click();
  await expect(listbox).toBeHidden();

  await trigger.press('ArrowDown');
  await expect(listbox).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(listbox).toBeHidden();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
});

test('flips the real listbox above its trigger when viewport space below is short', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 500 });
  const example = page.getByRole('group', {
    name: 'Dropdown viewport placement example',
    exact: true,
  });
  const trigger = example.getByRole('button', { name: 'Near viewport edge', exact: true });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.evaluate((element) => {
    let scrollableAncestor = element.parentElement;

    while (scrollableAncestor) {
      const style = getComputedStyle(scrollableAncestor);
      const isScrollable =
        scrollableAncestor.scrollHeight > scrollableAncestor.clientHeight &&
        /(auto|scroll)/.test(style.overflowY);

      if (isScrollable) {
        scrollableAncestor.scrollTop +=
          element.getBoundingClientRect().bottom - (window.innerHeight - 32);
        return;
      }

      scrollableAncestor = scrollableAncestor.parentElement;
    }

    throw new Error('The Dropdown route has no scrollable ancestor for its edge placement stage.');
  });
  await trigger.click();

  const listbox = page.getByRole('listbox', { name: 'Near viewport edge', exact: true });
  await expect(listbox).toBeVisible();
  await expect.poll(() => listbox.getAttribute('data-placement')).toBe('top');
  await listbox.evaluate(async (element) => {
    await Promise.all(element.getAnimations().map((animation) => animation.finished));
  });
  const triggerBounds = await trigger.boundingBox();
  const panelBounds = await listbox.boundingBox();
  expect(triggerBounds).not.toBeNull();
  expect(panelBounds).not.toBeNull();
  expect(panelBounds!.y + panelBounds!.height).toBeLessThanOrEqual(triggerBounds!.y);
});

test('dismisses the listbox when its anchor scrolls fully out of view', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 500 });
  const example = page.getByRole('group', {
    name: 'Dropdown anchor scroll dismissal example',
    exact: true,
  });
  const trigger = example.getByRole('button', { name: 'Scroll anchor example', exact: true });
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();

  const listbox = page.getByRole('listbox', { name: 'Scroll anchor example', exact: true });
  await expect(listbox).toBeVisible();
  await trigger.evaluate((element) => {
    let scrollableAncestor = element.parentElement;

    while (scrollableAncestor) {
      const style = getComputedStyle(scrollableAncestor);
      const isScrollable =
        scrollableAncestor.scrollHeight > scrollableAncestor.clientHeight &&
        /(auto|scroll)/.test(style.overflowY);

      if (isScrollable) {
        scrollableAncestor.scrollTop = scrollableAncestor.scrollHeight;
        return;
      }

      scrollableAncestor = scrollableAncestor.parentElement;
    }

    throw new Error('The Dropdown route has no scrollable ancestor for its anchor stage.');
  });

  await expect
    .poll(async () => {
      return trigger.evaluate((element) => {
        const bounds = element.getBoundingClientRect();
        return bounds.bottom <= 0 || bounds.top >= window.innerHeight;
      });
    })
    .toBe(true);
  await expect(listbox).toBeHidden();
});

test('keeps the catalogue within 320px and 768px viewports @visual', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Dropdown options and selection behavior',
    exact: true,
  });

  for (const viewport of [
    { width: 768, height: 1024, screenshot: 'dropdown-options-768.png' },
    { width: 320, height: 844, screenshot: 'dropdown-options-320.png' },
  ]) {
    await page.setViewportSize(viewport);
    await page.reload();
    await expect(page.getByRole('heading', { name: 'Dropdown', level: 1 })).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      ),
    ).toBe(true);
    await expect(
      page.getByRole('group', {
        name: 'Dropdown options and selection behavior',
        exact: true,
      }),
    ).toHaveScreenshot(viewport.screenshot, { animations: 'disabled' });
  }

  await expect(example).toBeAttached();
});

test('uses the Russian Dropdown scope for the trigger and option labels', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/dropdown/ru.json');
  expect(localeResponse.ok()).toBe(true);
  const russian = (await localeResponse.json()) as {
    accessibility: { default: string };
    options: { duplicate: string };
    status: { selected: string };
    triggers: { default: string };
  };

  await page.getByRole('button', { name: 'Switch language to Russian' }).click();
  const example = page.getByRole('group', {
    name: russian.accessibility.default,
    exact: true,
  });
  const trigger = example.getByRole('button', { name: russian.triggers.default, exact: true });
  await expect(trigger).toBeVisible();

  await trigger.click();

  const listbox = page.getByRole('listbox', { name: russian.triggers.default, exact: true });
  await expect(listbox).toBeVisible();
  await listbox.getByRole('option', { name: russian.options.duplicate, exact: true }).click();
  await expect(example.getByRole('status')).toHaveText(
    russian.status.selected.replace('{{value}}', 'duplicate'),
  );
});
