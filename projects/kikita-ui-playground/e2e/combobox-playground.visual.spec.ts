import { expect, test } from './support/fixtures';
import { kuiMessage, loadKuiCatalogue } from './support/kui-catalogue';

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1200 });
  await page.goto('/components/combobox');
  await expect(page.getByRole('heading', { name: 'Combobox', level: 1 })).toBeVisible();
});

test('captures the minimally configured default combobox @visual', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default combobox example', exact: true });

  await expect(example).toHaveScreenshot('combobox-default.png', { animations: 'disabled' });
});

test('captures local filtering and selection examples @visual', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Local filtering combobox example',
    exact: true,
  });

  await expect(example).toHaveScreenshot('combobox-filtering.png', { animations: 'disabled' });
});

test('filters, highlights, and selects a local option @visual', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Search people' });
  await input.fill('an');

  const listbox = page.getByRole('listbox');
  await expect(input).toHaveAttribute('aria-haspopup', 'listbox');
  await expect(input).toHaveAttribute('aria-autocomplete', 'list');
  await expect(input).toHaveAttribute('aria-expanded', 'true');
  const listboxId = await input.getAttribute('aria-controls');
  expect(listboxId).toBeTruthy();
  await expect(listbox).toHaveAttribute('id', listboxId ?? '');
  const daniel = listbox.getByRole('option', { name: 'Daniel Kowalski', exact: true });

  await expect(daniel).toBeVisible();
  await expect(listbox).toHaveScreenshot('combobox-filter-results.png', {
    animations: 'disabled',
  });

  await daniel.click();
  await expect(input).toHaveValue('Daniel Kowalski');
  await expect(listbox).toBeHidden();
});

test('captures free-input and async-filtering modes @visual', async ({ page }) => {
  const examples = page.getByRole('group', {
    name: 'Free input and async filtering examples',
    exact: true,
  });

  await expect(examples).toHaveScreenshot('combobox-modes.png', { animations: 'disabled' });
});

test('free mode stores typed text as its value', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Tag' });

  await expect(input).toHaveAttribute('aria-autocomplete', 'both');
  await input.fill('Custom tag');

  await expect(input).toHaveValue('Custom tag');
});

test('async mode filters consumer-provided results', async ({ page }) => {
  const examples = page.getByRole('group', {
    name: 'Free input and async filtering examples',
    exact: true,
  });
  const input = examples.getByRole('combobox', { name: 'Reviewer' });

  await expect(input).toHaveAttribute('aria-autocomplete', 'list');
  await input.fill('Ravi');

  await expect(page.getByRole('listbox').getByRole('option', { name: 'Ravi Patel' })).toBeVisible();
});

test('captures inherited field sizes and control states @visual', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Field sizes and states', exact: true });

  await expect(example).toHaveScreenshot('combobox-field-states.png', { animations: 'disabled' });
});

test('captures the focused combobox field state @visual', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Field sizes and states', exact: true });
  const focused = example.getByRole('combobox', { name: 'Focus example', exact: true });

  await focused.focus();
  await expect(focused).toBeFocused();
  await expect(example).toHaveScreenshot('combobox-focused.png', { animations: 'disabled' });
});

test('captures the combobox input hover state @visual', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Field sizes and states', exact: true });
  const input = example.getByRole('combobox', { name: 'Focus example', exact: true });

  await input.scrollIntoViewIfNeeded();
  await input.hover();
  expect(await input.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(example).toHaveScreenshot('combobox-hover.png', { animations: 'disabled' });
});

test('captures a hovered combobox option @visual', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Search people' });
  await input.fill('Dan');

  const listbox = page.getByRole('listbox');
  await expect(listbox.getByRole('option')).toHaveCount(1);
  const option = listbox.getByRole('option', { name: 'Daniel Kowalski', exact: true });
  await option.hover();
  expect(await option.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(listbox).toHaveScreenshot('combobox-option-hover.png', { animations: 'disabled' });
});

test('captures loading and clear-action examples @visual', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Loading and clear action examples',
    exact: true,
  });

  await expect(example).toHaveScreenshot('combobox-affordances.png', { animations: 'disabled' });
});

test('shows the loading row when the remote results dropdown opens @visual', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Loading and clear action examples',
    exact: true,
  });
  await example.getByRole('combobox', { name: 'Reviewer' }).click();

  const listbox = page.getByRole('listbox');
  await expect(listbox.getByText('Loading people')).toBeVisible();
  await expect(listbox).toHaveScreenshot('combobox-loading-options.png', {
    animations: 'disabled',
  });
});

test('selects an option with keyboard navigation', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Search people' });

  await input.fill('Ravi');
  await input.press('ArrowDown');

  const option = page.getByRole('option', { name: 'Ravi Patel', exact: true });
  await expect(option).toBeFocused();
  await page.keyboard.press('Enter');

  await expect(input).toHaveValue('Ravi Patel');
});

test('exposes native field labeling, validation, disabled, and readonly semantics', async ({
  page,
}) => {
  const localInput = page.getByRole('combobox', { name: 'Search people' });
  const nativeLabelCount = await localInput.evaluate(
    (element) => (element as HTMLInputElement).labels?.length ?? 0,
  );
  expect(nativeLabelCount).toBeGreaterThan(0);

  const invalidInput = page.getByRole('combobox', { name: 'Invalid', exact: true });
  await expect(invalidInput).toHaveAttribute('aria-invalid', 'true');
  const describedText = await invalidInput.evaluate((element) =>
    (element.getAttribute('aria-describedby') ?? '')
      .split(/\s+/)
      .filter(Boolean)
      .map((id) => document.getElementById(id)?.textContent ?? '')
      .join(' '),
  );
  expect(describedText).toContain('Choose an owner');

  await expect(page.getByRole('combobox', { name: 'Disabled', exact: true })).toBeDisabled();
  const readonlyInput = page.getByRole('combobox', { name: 'Readonly', exact: true });
  await expect(readonlyInput).toHaveAttribute('readonly', '');
  await readonlyInput.focus();
  await expect(readonlyInput).toBeFocused();
  await readonlyInput.press('End');
  await readonlyInput.pressSequentially(' changed');
  await expect(readonlyInput).toHaveValue('Amelia Novak');
});

test('gates required Signal Forms errors until touched and clears them after selection @visual', async ({
  page,
}) => {
  const example = page.getByRole('group', {
    name: 'Signal Forms required validation example',
    exact: true,
  });
  const input = example.getByRole('combobox', { name: 'Required assignee', exact: true });

  await expect(input).toHaveValue('');
  await expect(input).not.toHaveAttribute('aria-invalid');
  await expect(input).not.toHaveAttribute('data-has-clear');
  await expect(example.getByText('Choose an owner', { exact: true })).toHaveCount(0);
  await expect(example).toHaveScreenshot('combobox-signal-forms-untouched.png', {
    animations: 'disabled',
  });

  await input.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await input.press('Escape');

  await expect(input).toHaveAttribute('aria-invalid', 'true');
  const error = example.getByText('Choose an owner', { exact: true });
  await expect(error).toBeVisible();
  const errorId = await error.getAttribute('id');
  const describedBy = (await input.getAttribute('aria-describedby'))?.split(/\s+/) ?? [];
  expect(errorId).toBeTruthy();
  expect(describedBy).toContain(errorId);
  await expect(example).toHaveScreenshot('combobox-signal-forms-required-error.png', {
    animations: 'disabled',
  });

  await input.click();
  const listbox = page.getByRole('listbox');
  await expect(listbox).toBeVisible();
  await listbox.getByRole('option', { name: 'Available', exact: true }).click();

  await expect(input).toHaveValue('Available');
  await expect(input).not.toHaveAttribute('aria-invalid');
  await expect(error).toHaveCount(0);
  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(example).toHaveScreenshot('combobox-signal-forms-selected.png', {
    animations: 'disabled',
  });

  const localeResponse = await page.request.get('/i18n/combobox/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const russian = await localeResponse.json();
  const kui = await loadKuiCatalogue(page, 'ru');
  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();

  const russianExample = page.getByRole('group', {
    name: russian.accessibility.signalForms,
    exact: true,
  });
  const russianInput = russianExample.getByRole('combobox', {
    name: russian.fields.requiredAssignee,
    exact: true,
  });
  await russianExample
    .getByRole('button', { name: kuiMessage(kui, 'common', 'clear'), exact: true })
    .click();
  await expect(russianInput).toHaveValue('');
  await expect(russianInput).toHaveAttribute('aria-invalid', 'true');
  await expect(
    russianExample.getByText(russian.states.requiredOwner, { exact: true }),
  ).toBeVisible();
});

test('shows no-match and disabled-option results in filtering mode', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Search people' });

  await input.fill('nobody-matches-this');
  await expect(page.getByText('No matches', { exact: true })).toBeVisible();

  await input.fill('Kai');
  await expect(page.getByRole('option', { name: 'Kai Morgan', exact: true })).toBeDisabled();
});

test('clears a selected value and keeps the explicitly non-clearable field without its action', async ({
  page,
}) => {
  const clearable = page.getByRole('combobox', { name: 'Clearable', exact: true });
  await expect(clearable).toHaveValue('Daniel Kowalski');
  await expect(clearable).toHaveAttribute('data-has-clear', '');

  await page
    .getByRole('group', { name: 'Loading and clear action examples', exact: true })
    .getByRole('button', { name: 'Clear', exact: true })
    .click();
  await expect(clearable).toHaveValue('');
  await expect(clearable).toBeFocused();
  await expect(clearable).not.toHaveAttribute('data-has-clear');

  const notClearable = page.getByRole('combobox', { name: 'Clear action hidden', exact: true });
  await expect(notClearable).toHaveValue('Amelia Novak');
  await expect(notClearable).not.toHaveAttribute('data-has-clear');
});

test('clears an active search query and closes its filtered options', async ({ page }) => {
  const example = page.getByRole('group', {
    name: 'Local filtering combobox example',
    exact: true,
  });
  const input = example.getByRole('combobox', { name: 'Search people' });

  await input.fill('Ravi');
  await expect(input).toHaveAttribute('data-has-clear', '');
  await expect(page.getByRole('option', { name: 'Ravi Patel', exact: true })).toBeVisible();

  await example.getByRole('button', { name: 'Clear', exact: true }).click();

  await expect(input).toHaveValue('');
  await expect(input).not.toHaveAttribute('data-has-clear');
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(input).toBeFocused();
});

test('opens to the last enabled option with ArrowUp', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Assignee', exact: true });
  await input.press('ArrowUp');

  const listbox = page.getByRole('listbox');
  await expect(listbox.getByRole('option', { name: 'Ravi Patel', exact: true })).toBeFocused();
  await expect(input).toHaveAttribute('aria-expanded', 'true');
});

test('closes the options list with Escape and keeps focus on the input', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Search people' });

  await input.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await input.press('Escape');

  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).not.toHaveAttribute('aria-controls');
  await expect(input).toBeFocused();
});

test('closes the options list with Tab and lets focus move forward', async ({ page }) => {
  const input = page.getByRole('combobox', { name: 'Search people' });

  await input.click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await input.press('Tab');

  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
  await expect(input).not.toBeFocused();
});

test('opens and closes the options list through the field suffix control', async ({ page }) => {
  const example = page.getByRole('group', { name: 'Default combobox example', exact: true });
  const input = example.getByRole('combobox', { name: 'Assignee', exact: true });

  await example.getByRole('button', { name: 'Open options', exact: true }).click();
  await expect(page.getByRole('listbox')).toBeVisible();
  await expect(input).toHaveAttribute('aria-expanded', 'true');

  await example.getByRole('button', { name: 'Close options', exact: true }).click();
  await expect(page.getByRole('listbox')).toBeHidden();
  await expect(input).toHaveAttribute('aria-expanded', 'false');
});

test('updates translated labels and selected values after switching to Russian', async ({
  page,
}) => {
  const localeResponse = await page.request.get('/i18n/combobox/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const russian = await localeResponse.json();

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();

  await expect(page.getByRole('heading', { level: 1, name: russian.title })).toBeVisible();
  await expect(
    page.getByRole('group', { name: russian.accessibility.default, exact: true }),
  ).toBeVisible();
  const search = page.getByRole('combobox', { name: russian.fields.searchPeople });
  await expect(search).toHaveAttribute('placeholder', russian.placeholders.searchPeople);

  const assignee = page.getByRole('combobox', { name: russian.fields.assignee, exact: true });
  await assignee.click();
  await page.getByRole('option', { name: russian.options.amelia, exact: true }).click();
  await expect(assignee).toHaveValue(russian.options.amelia);

  const tag = page.getByRole('combobox', { name: russian.fields.tag, exact: true });
  await tag.click();
  await page.getByRole('option', { name: russian.options.feature, exact: true }).click();
  await expect(tag).toHaveValue(russian.options.feature);
});

test('server renders the Combobox route and its translated heading', async ({ page }) => {
  const response = await page.request.get('/components/combobox');

  expect(response.status()).toBe(200);
  const serverMarkup = await response.text();
  expect(serverMarkup).toMatch(/<input\b[^>]*role="combobox"/);
  expect(serverMarkup).toMatch(/<input\b[^>]*aria-haspopup="listbox"/);
  const serverHeadings = [...serverMarkup.matchAll(/<h1\b[^>]*>([\s\S]*?)<\/h1>/g)].map(
    ([, text]) => text.replace(/<[^>]+>/g, '').trim(),
  );
  expect(serverHeadings).toContain('Combobox');

  await page.goto('/components/combobox');
  await expect(page.getByRole('heading', { level: 1, name: 'Combobox' })).toBeVisible();
});

test('keeps the Combobox catalogue within tablet and 320px layouts @visual', async ({ page }) => {
  for (const viewport of [
    { width: 768, height: 1024, name: 'tablet-768' },
    { width: 320, height: 1440, name: 'mobile-320' },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto('/components/combobox');

    const main = page.getByRole('main');
    await expect(main).toBeVisible();
    const dimensions = await page.evaluate(() => ({
      document: {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
      },
      main: {
        clientWidth: document.querySelector('main')?.clientWidth ?? 0,
        scrollWidth: document.querySelector('main')?.scrollWidth ?? 0,
      },
    }));
    expect(
      dimensions.document.scrollWidth,
      `${viewport.name} document: ${JSON.stringify(dimensions.document)}`,
    ).toBeLessThanOrEqual(dimensions.document.clientWidth);
    expect(
      dimensions.main.scrollWidth,
      `${viewport.name} catalogue: ${JSON.stringify(dimensions.main)}`,
    ).toBeLessThanOrEqual(dimensions.main.clientWidth);

    const sections = [
      {
        locator: page.getByRole('group', { name: 'Default combobox example', exact: true }),
        name: 'default',
      },
      {
        locator: page.getByRole('group', {
          name: 'Local filtering combobox example',
          exact: true,
        }),
        name: 'filtering',
      },
      {
        locator: page.getByRole('group', {
          name: 'Free input and async filtering examples',
          exact: true,
        }),
        name: 'modes',
      },
      {
        locator: page.getByRole('group', { name: 'Field sizes and states', exact: true }),
        name: 'field-states',
      },
      {
        locator: page.getByRole('group', {
          name: 'Signal Forms required validation example',
          exact: true,
        }),
        name: 'signal-forms',
      },
      {
        locator: page.getByRole('group', {
          name: 'Loading and clear action examples',
          exact: true,
        }),
        name: 'affordances',
      },
    ];

    for (const section of sections) {
      await expect(section.locator).toBeVisible();
      await section.locator.scrollIntoViewIfNeeded();
      const bounds = await section.locator.boundingBox();
      if (!bounds) throw new Error(`${section.name} section has no rendered bounds`);
      expect(bounds.x, `${section.name} section starts inside viewport`).toBeGreaterThanOrEqual(0);
      expect(
        bounds.x + bounds.width,
        `${section.name} section ends inside viewport`,
      ).toBeLessThanOrEqual(viewport.width);
      expect(bounds.height, `${section.name} section fits review viewport`).toBeLessThanOrEqual(
        viewport.height,
      );
      await expect(section.locator).toHaveScreenshot(
        `combobox-${section.name}-${viewport.name}.png`,
        { animations: 'disabled' },
      );
    }
  }
});
