import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/command-palette');
});

test('captures the default command palette example', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default command palette example', exact: true });
  await expect(example).toHaveScreenshot('command-palette-default.png');

  await example.getByRole('button', { name: 'Open command palette', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Command palette', exact: true });
  const search = dialog.getByRole('combobox');
  const listbox = dialog.getByRole('listbox');
  await expect(search).toBeFocused();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(search).toHaveAttribute('aria-expanded', 'true');
  const listboxId = await listbox.getAttribute('id');
  expect(listboxId).toBeTruthy();
  await expect(search).toHaveAttribute('aria-controls', listboxId ?? '');
  const activeId = await search.getAttribute('aria-activedescendant');
  expect(activeId).toBeTruthy();
  const firstOption = dialog.getByRole('option', { name: /Open projects/ });
  await expect(firstOption).toHaveAttribute('aria-selected', 'true');
  const firstOptionId = await firstOption.getAttribute('id');
  expect(firstOptionId).toBeTruthy();
  await expect(search).toHaveAttribute('aria-activedescendant', firstOptionId ?? '');
  await expect(dialog.getByRole('option')).toHaveCount(5);
  await expect(dialog.getByRole('option', { name: /Export workspace/ })).toBeDisabled();
  await expect(dialog).toHaveScreenshot('command-palette-default-open.png');
});

test('captures hovered and keyboard-active commands', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default command palette example', exact: true });
  await example.getByRole('button', { name: 'Open command palette', exact: true }).click();

  const dialog = page.getByRole('dialog', { name: 'Command palette', exact: true });
  const search = dialog.getByRole('combobox');
  const firstCommand = dialog.getByRole('option', { name: /Browse components/ });

  await firstCommand.hover();
  expect(await firstCommand.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(dialog).toHaveScreenshot('command-palette-command-hover.png', {
    animations: 'disabled',
  });

  await search.press('ArrowDown');
  const activeCommand = dialog.getByRole('option', { name: /Browse components/ });
  await expect(activeCommand).toHaveAttribute('aria-selected', 'true');
  await expect(search).toBeFocused();
  await expect(dialog).toHaveScreenshot('command-palette-command-active.png', {
    animations: 'disabled',
  });
});

test('captures command filtering', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Filtered command palette example',
    exact: true,
  });
  await expect(example).toHaveScreenshot('command-palette-filtering.png');

  await example.getByRole('button', { name: 'Open filtered palette', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: 'Command palette', exact: true });
  await expect(dialog.getByRole('combobox')).toHaveValue('project');
  await expect(dialog.getByRole('option', { name: /Open projects/ })).toBeVisible();
  await expect(dialog.getByRole('option', { name: /Export workspace/ })).toHaveCount(0);
  await expect(dialog).toHaveScreenshot('command-palette-filtered-open.png');
});

test('captures loading and empty overlay states', async ({ page }) => {
  const loadingExample = page.getByRole('group', {
    name: 'Loading command palette example',
    exact: true,
  });
  await expect(loadingExample).toHaveScreenshot('command-palette-loading-trigger.png');
  await loadingExample.getByRole('button', { name: 'Open loading state', exact: true }).click();

  const loadingDialog = page.getByRole('dialog', { name: 'Command palette', exact: true });
  await expect(loadingDialog).toHaveAttribute('aria-busy', 'true');
  await expect(loadingDialog).toHaveScreenshot('command-palette-loading-open.png');
  await page.keyboard.press('Escape');
  await expect(loadingDialog).toHaveCount(0);
  await expect(
    loadingExample.getByRole('button', { name: 'Open loading state', exact: true }),
  ).toBeFocused();

  const emptyExample = page.getByRole('group', {
    name: 'Empty command palette example',
    exact: true,
  });
  await expect(emptyExample).toHaveScreenshot('command-palette-empty-trigger.png');
  await emptyExample.getByRole('button', { name: 'Open empty state', exact: true }).click();

  const emptyDialog = page.getByRole('dialog', { name: 'Command palette', exact: true });
  await expect(emptyDialog.getByRole('status')).toContainText('No matching commands');
  await expect(emptyDialog).toHaveScreenshot('command-palette-empty-open.png');
});

test('selects a command with the keyboard and restores focus to its trigger', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default command palette example', exact: true });
  const trigger = example.getByRole('button', { name: 'Open command palette', exact: true });
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Command palette', exact: true });
  const search = dialog.getByRole('combobox');
  await expect(search).toBeFocused();
  await search.press('ArrowDown');
  await expect(dialog.getByRole('option', { name: /Browse components/ })).toHaveAttribute(
    'aria-selected',
    'true',
  );
  await search.press('Enter');

  await expect(dialog).toHaveCount(0);
  await expect(example.getByRole('status')).toHaveText('Selected: Browse components');
  await expect(trigger).toBeFocused();
});

test('keeps focus inside the dialog and cycles through its Tab boundary', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default command palette example', exact: true });
  await example.getByRole('button', { name: 'Open command palette', exact: true }).click();

  const dialog = page.getByRole('dialog', { name: 'Command palette', exact: true });
  const search = dialog.getByRole('combobox');
  const lastCommand = dialog.getByRole('option', { name: /Delete workspace/ });

  await expect(search).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await expect(lastCommand).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(search).toBeFocused();
});

test('dismisses from the backdrop and restores focus to its trigger', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default command palette example', exact: true });
  const trigger = example.getByRole('button', { name: 'Open command palette', exact: true });
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Command palette', exact: true });
  await dialog.getByRole('combobox').click();
  await expect(dialog).toBeVisible();

  await page.mouse.click(4, 4);

  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('clears the query, moves active selection with both arrows, and restores focus on Escape', async ({
  page,
}) => {
  const example = page.getByRole('group', { name: 'Default command palette example', exact: true });
  const trigger = example.getByRole('button', { name: 'Open command palette', exact: true });
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: 'Command palette', exact: true });
  const search = dialog.getByRole('combobox');
  await search.fill('project');
  await expect(dialog.getByRole('option', { name: /Open projects/ })).toBeVisible();

  await dialog.getByRole('button', { name: 'Clear search', exact: true }).click();
  await expect(search).toHaveValue('');
  await expect(search).toBeFocused();

  await search.press('ArrowDown');
  const components = dialog.getByRole('option', { name: /Browse components/ });
  await expect(components).toHaveAttribute('aria-selected', 'true');
  await search.press('ArrowUp');
  const projects = dialog.getByRole('option', { name: /Open projects/ });
  await expect(projects).toHaveAttribute('aria-selected', 'true');
  const projectsId = await projects.getAttribute('id');
  expect(projectsId).toBeTruthy();
  await expect(search).toHaveAttribute('aria-activedescendant', projectsId ?? '');
  await expect(search).toBeFocused();

  await search.press('Escape');
  await expect(dialog).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test('updates localized page, group, dialog, command, and selected status after switching to Russian', async ({
  page,
}) => {
  const localeResponse = await page.request.get('/i18n/command-palette/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const russian = await localeResponse.json();

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();

  await expect(page.getByRole('heading', { level: 1, name: russian.title })).toBeVisible();
  const example = page.getByRole('group', { name: russian.accessibility.default, exact: true });
  const trigger = example.getByRole('button', { name: russian.actions.openDefault, exact: true });
  await trigger.click();

  const dialog = page.getByRole('dialog', { name: russian.accessibility.dialogLabel, exact: true });
  const search = dialog.getByRole('combobox', {
    name: russian.accessibility.dialogLabel,
    exact: true,
  });
  await expect(search).toHaveAttribute('placeholder', russian.accessibility.searchPlaceholder);
  await expect(
    dialog.getByRole('option').filter({ hasText: russian.commands.projects }),
  ).toBeVisible();
  await dialog.getByRole('option').filter({ hasText: russian.commands.createTask }).click();

  await expect(example.getByRole('status')).toHaveText(
    russian.status.selected.replace('{{command}}', russian.commands.createTask),
  );
  await expect(trigger).toBeFocused();
});

test('server renders the Command Palette route and its translated heading', async ({ page }) => {
  const response = await page.request.get('/components/command-palette');

  expect(response.status()).toBe(200);
  const serverMarkup = await response.text();
  const serverHeadings = [...serverMarkup.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(
    ([, text]) => text.replace(/<[^>]+>/g, '').trim(),
  );
  expect(serverHeadings).toContain('Command Palette');

  await page.goto('/components/command-palette');
  await expect(page.getByRole('heading', { level: 1, name: 'Command Palette' })).toBeVisible();
});

test('keeps the catalogue and open palette within tablet and 320px layouts', async ({ page }) => {
  for (const viewport of [
    { width: 768, height: 1024, name: 'tablet-768' },
    { width: 320, height: 640, name: 'mobile-320' },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/components/command-palette');

    const main = page.getByRole('main');
    await expect(main).toBeVisible();
    const dimensions = await main.evaluate((element) => ({
      clientWidth: element.clientWidth,
      scrollWidth: element.scrollWidth,
    }));
    expect(
      dimensions.scrollWidth,
      `${viewport.name}: ${JSON.stringify(dimensions)}`,
    ).toBeLessThanOrEqual(dimensions.clientWidth);
    await expect(main).toHaveScreenshot(`command-palette-page-${viewport.name}.png`, {
      animations: 'disabled',
    });

    const example = page.getByRole('group', {
      name: 'Default command palette example',
      exact: true,
    });
    await example.getByRole('button', { name: 'Open command palette', exact: true }).click();
    const dialog = page.getByRole('dialog', { name: 'Command palette', exact: true });
    const bounds = await dialog.boundingBox();
    expect(bounds, `${viewport.name}: dialog should have bounds`).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(viewport.width);
    await expect(dialog).toHaveScreenshot(`command-palette-open-${viewport.name}.png`, {
      animations: 'disabled',
    });
  }
});
