import type { Locator, Page } from '@playwright/test';

import { expect, test } from '../../../tests/e2e/support/fixtures';
import { openWithHeldScripts, readDuplicateIds } from '../../../tests/e2e/support/ssr';

const desktopViewport = { width: 1440, height: 1000 };
const tabletViewport = { width: 768, height: 1024 };
const mobileViewport = { width: 320, height: 844 };
// Tall enough for the shell's content scroller to show every catalogue card without clipping it.
const mobileCatalogueViewport = { width: 320, height: 2400 };

const cardNames = {
  default: 'Default OTP Input example',
  lengths: 'OTP Input lengths',
  sizes: 'OTP Input sizes',
  formats: 'OTP Input formats',
  states: 'OTP Input states',
  field: 'OTP Input inside Field',
  entry: 'OTP Input keyboard and paste entry',
  completion: 'OTP Input completion output',
  verification: 'OTP Input verification',
  autofocus: 'OTP Input autofocus',
  validation: 'OTP Input Signal Forms validation',
} as const;

type CardKey = keyof typeof cardNames;

const screenshotCards: readonly CardKey[] = [
  'default',
  'lengths',
  'sizes',
  'formats',
  'states',
  'field',
  'entry',
  'completion',
  'verification',
  'autofocus',
  'validation',
];

function card(page: Page, key: CardKey): Locator {
  return page.getByRole('group', { name: cardNames[key], exact: true });
}

function otp(scope: Locator, name: string): Locator {
  return scope.getByRole('group', { name, exact: true });
}

function cell(group: Locator, index: number, length = 6): Locator {
  return group.getByLabel(`Digit ${index} of ${length}`, { exact: true });
}

function readoutOf(scope: Locator, label = 'Value:'): Locator {
  return scope.locator('app-otp-input-readout', { hasText: label });
}

async function cellValues(group: Locator): Promise<string[]> {
  return group
    .locator('input')
    .evaluateAll((inputs) => inputs.map((el) => (el as HTMLInputElement).value));
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}

async function paste(page: Page, text: string): Promise<void> {
  await page.evaluate((value) => navigator.clipboard.writeText(value), text);
  await page.keyboard.press('Control+V');
}

/** Installs a running fake clock so the verification timer can be controlled later. */
async function installClock(page: Page): Promise<void> {
  await page.clock.install({ time: new Date('2026-05-14T12:00:00.000Z') });
}

/** Pauses the fake clock a moment after now, once Angular has rendered the pending state. */
async function freezeClock(page: Page): Promise<void> {
  const now = await page.evaluate(() => Date.now());

  await page.clock.pauseAt(new Date(now + 100));
}

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/otp-input');
  await expect(
    page.getByRole('heading', { level: 1, name: 'OTP Input', exact: true }),
  ).toBeVisible();
});

test('server-renders the default group and keeps it through hydration', async ({ page }) => {
  const held = await openWithHeldScripts(page, '/components/otp-input');
  const defaultCard = card(page, 'default');
  const group = otp(defaultCard, 'Verification code');

  await expect(
    page.getByRole('heading', { level: 1, name: 'OTP Input', exact: true }),
  ).toBeVisible();
  await expect(group.locator('input')).toHaveCount(6);
  await group.evaluate((element) => element.setAttribute('data-server-node', 'true'));
  const labelFor = await defaultCard.locator('label').getAttribute('for');
  expect(labelFor).toBe(await cell(group, 1).getAttribute('id'));

  held.release();
  await page.waitForLoadState('load');

  await expect(group).toHaveAttribute('data-server-node', 'true');
  await expect(defaultCard.locator('label')).toHaveAttribute('for', labelFor ?? '');
  expect(await readDuplicateIds(page)).toEqual([]);
  await expect(async () => {
    await cell(group, 1).fill('7');
    await expect(readoutOf(defaultCard)).toContainText('7');
  }).toPass();
});

test('renders the minimal default with six labelled digit cells and no initial focus', async ({
  page,
}) => {
  const group = otp(card(page, 'default'), 'Verification code');

  await expect(group.locator('input')).toHaveCount(6);
  await expect(group).toHaveAttribute('data-kui-size', 'md');
  await expect(cell(group, 1)).toHaveAttribute('autocomplete', 'one-time-code');
  await expect(cell(group, 2)).toHaveAttribute('autocomplete', 'off');
  await expect(cell(group, 1)).toHaveAttribute('inputmode', 'numeric');
  await expect(page.locator('input:focus')).toHaveCount(0);
  await expect(readoutOf(card(page, 'default'))).toContainText('empty');
});

test('rejects letters, accepts digits, and advances focus while typing', async ({ page }) => {
  const scope = card(page, 'default');
  const group = otp(scope, 'Verification code');

  await cell(group, 1).click();
  await page.keyboard.type('a');
  await expect(cell(group, 1)).toHaveValue('');
  await expect(cell(group, 1)).toBeFocused();

  await page.keyboard.type('12');
  await expect(cell(group, 3)).toBeFocused();
  await expect(readoutOf(scope)).toContainText('12');
  await expect.poll(() => cellValues(group)).toEqual(['1', '2', '', '', '', '']);
});

test('focuses the first cell when the Field label is clicked', async ({ page }) => {
  const scope = card(page, 'default');

  await scope.getByText('Verification code', { exact: true }).click();
  await expect(cell(otp(scope, 'Verification code'), 1)).toBeFocused();

  const field = card(page, 'field');
  await field.getByText('Code from email', { exact: true }).click();
  await expect(cell(otp(field, 'Code from email'), 1)).toBeFocused();
});

test('shows the supported cell counts', async ({ page }) => {
  const lengths = card(page, 'lengths');

  await expect(otp(lengths, '4 cells').locator('input')).toHaveCount(4);
  await expect(otp(lengths, '6 cells (default)').locator('input')).toHaveCount(6);
  await expect(otp(lengths, '8 cells').locator('input')).toHaveCount(8);
});

test('sizes the cells as squares from the size scale', async ({ page }) => {
  const sizes = card(page, 'sizes');
  const expected = [
    ['Extra small', 'xs', 28],
    ['Small', 'sm', 32],
    ['Medium', 'md', 40],
    ['Large', 'lg', 44],
  ] as const;

  for (const [name, size, pixels] of expected) {
    const group = otp(sizes, name);

    await expect(group).toHaveAttribute('data-kui-size', size);
    const box = await cell(group, 1, 4).boundingBox();
    expect(box?.width).toBe(pixels);
    expect(box?.height).toBe(pixels);
    await expect.poll(() => cellValues(group)).toEqual(['1', '2', '3', '4']);
  }
});

test('masks a PIN and uppercases alphanumeric backup codes', async ({ page }) => {
  const formats = card(page, 'formats');
  const pin = otp(formats, 'Masked PIN');
  const backup = otp(formats, 'Backup code (letters and digits)');

  for (const input of await pin.locator('input').all()) {
    await expect(input).toHaveAttribute('type', 'password');
  }
  await expect(cell(pin, 1, 4)).toHaveAttribute('inputmode', 'numeric');

  await expect(cell(backup, 1, 8)).toHaveAttribute('inputmode', 'text');
  await cell(backup, 1, 8).click();
  await page.keyboard.type('x!');
  await expect(cell(backup, 1, 8)).toHaveValue('X');
  await expect(cell(backup, 2, 8)).toBeFocused();
  await expect.poll(() => cellValues(backup)).toEqual(['X', '7', 'K', '9', 'Q', '2', 'Z', 'M']);
});

test('applies invalid, disabled, read-only, and loading to every cell', async ({ page }) => {
  const states = card(page, 'states');
  const invalid = otp(states, 'Invalid');
  const disabled = otp(states, 'Disabled');
  const readOnly = otp(states, 'Read-only');
  const loading = otp(states, 'Loading');

  for (const input of await invalid.locator('input').all()) {
    await expect(input).toHaveAttribute('aria-invalid', 'true');
  }
  for (const input of await disabled.locator('input').all()) await expect(input).toBeDisabled();
  for (const input of await loading.locator('input').all()) await expect(input).toBeDisabled();
  await expect(loading.getByRole('status', { name: 'Verifying code' })).toBeVisible();
  await expect(disabled.getByRole('status')).toHaveCount(0);

  for (const input of await readOnly.locator('input').all()) {
    await expect(input).toHaveAttribute('readonly', '');
  }
  await cell(readOnly, 3).click();
  await expect(cell(readOnly, 3)).toBeFocused();
  await page.keyboard.type('9');
  await page.keyboard.press('Backspace');
  await paste(page, '000000');
  await expect.poll(() => cellValues(readOnly)).toEqual(['4', '8', '2', '9', '1', '3']);
});

test('keeps the group size stable when loading turns on', async ({ page }) => {
  const states = card(page, 'states');
  const loading = otp(states, 'Loading');
  const disabled = otp(states, 'Disabled');

  const loadingBox = await loading.boundingBox();
  const disabledBox = await disabled.boundingBox();

  expect(loadingBox?.width).toBe(disabledBox?.width);
  expect(loadingBox?.height).toBe(disabledBox?.height);
});

test('wires Field hint and error to the group and marks cells invalid from the ambient error', async ({
  page,
}) => {
  const field = card(page, 'field');
  const withHint = otp(field, 'Code from email');
  const withError = otp(field, 'Code from SMS');

  for (const group of [withHint, withError]) {
    const ids = ((await group.getAttribute('aria-describedby')) ?? '').split(' ').filter(Boolean);
    expect(ids.length).toBeGreaterThan(0);
    for (const id of ids) await expect(field.locator(`[id="${id}"]`)).toHaveCount(1);
  }

  await expect(field.getByText('We sent a 6-digit code to your email')).toBeVisible();
  await expect(field.getByRole('alert')).toHaveText('Code is wrong or expired. Request a new one.');
  await expect(withHint).not.toHaveAttribute('data-kui-invalid', '');
  await expect(withError).toHaveAttribute('data-kui-invalid', '');
  await expect(cell(withError, 1)).toHaveAttribute('aria-invalid', 'true');
});

test('navigates and edits with the real keyboard', async ({ page }) => {
  const scope = card(page, 'entry');
  const group = otp(scope, 'Entry code');

  await cell(group, 1).click();
  await page.keyboard.type('123');
  await expect(readoutOf(scope)).toContainText('123');
  await expect(cell(group, 4)).toBeFocused();

  await page.keyboard.press('Backspace');
  await expect(cell(group, 3)).toBeFocused();
  await expect.poll(() => cellValues(group)).toEqual(['1', '2', '', '', '', '']);
  await page.keyboard.press('Backspace');
  await expect(cell(group, 2)).toBeFocused();
  await expect(readoutOf(scope)).toContainText('1');

  await page.keyboard.press('ArrowLeft');
  await expect(cell(group, 1)).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(cell(group, 1)).toBeFocused();
  await page.keyboard.press('End');
  await expect(cell(group, 6)).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(cell(group, 6)).toBeFocused();
  await page.keyboard.press('Home');
  await expect(cell(group, 1)).toBeFocused();
  await page.keyboard.press('ArrowRight');
  await expect(cell(group, 2)).toBeFocused();
  await expect(readoutOf(scope)).toContainText('1');
});

test('replaces a filled cell on typing and collapses later cells when one is cleared', async ({
  page,
}) => {
  const scope = card(page, 'entry');
  const group = otp(scope, 'Entry code');

  await cell(group, 1).click();
  await page.keyboard.type('123456');
  await expect(readoutOf(scope)).toContainText('123456');

  await cell(group, 2).click();
  await page.keyboard.type('9');
  await expect.poll(() => cellValues(group)).toEqual(['1', '9', '3', '4', '5', '6']);

  await cell(group, 3).click();
  await page.keyboard.press('Backspace');
  await expect.poll(() => cellValues(group)).toEqual(['1', '9', '', '4', '5', '6']);
  await expect(readoutOf(scope)).toContainText('19456');
});

test('distributes a pasted code from the first cell regardless of the focused cell', async ({
  page,
}) => {
  const scope = card(page, 'entry');
  const group = otp(scope, 'Entry code');

  await cell(group, 4).focus();
  await paste(page, '12 34 56');
  await expect(readoutOf(scope)).toContainText('123456');
  await expect(cell(group, 6)).toBeFocused();

  await cell(group, 3).focus();
  await paste(page, '9876543210');
  await expect.poll(() => cellValues(group)).toEqual(['9', '8', '7', '6', '5', '4']);

  await paste(page, 'abc');
  await expect.poll(() => cellValues(group)).toEqual(['9', '8', '7', '6', '5', '4']);

  await page.reload();
  await cell(otp(card(page, 'entry'), 'Entry code'), 1).focus();
  await paste(page, '1-2');
  await expect(readoutOf(card(page, 'entry'))).toContainText('12');
  await expect(cell(otp(card(page, 'entry'), 'Entry code'), 3)).toBeFocused();
});

test('uppercases and cleans a pasted alphanumeric backup code', async ({ page }) => {
  const backup = otp(card(page, 'formats'), 'Backup code (letters and digits)');

  await cell(backup, 5, 8).focus();
  await paste(page, 'ab-12 cd34 xyz');
  await expect.poll(() => cellValues(backup)).toEqual(['A', 'B', '1', '2', 'C', 'D', '3', '4']);
});

test('emits complete once per completed code and again after a clear and refill', async ({
  page,
}) => {
  const scope = card(page, 'completion');
  const group = otp(scope, 'Completion code');
  const completions = readoutOf(scope, 'Completions:');
  const last = readoutOf(scope, 'Last completed code:');

  await expect(completions).toContainText('0');
  await cell(group, 1, 4).click();
  await page.keyboard.type('1234');
  await expect(completions).toContainText('1');
  await expect(last).toContainText('1234');

  await cell(group, 3, 4).click();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.type('5');
  await expect.poll(() => cellValues(group)).toEqual(['1', '2', '3', '5']);
  await expect(completions).toContainText('1');
  await expect(last).toContainText('1234');

  await scope.getByRole('button', { name: 'Clear code', exact: true }).click();
  await expect.poll(() => cellValues(group)).toEqual(['', '', '', '']);
  await cell(group, 1, 4).click();
  await page.keyboard.type('4321');
  await expect(completions).toContainText('2');
  await expect(last).toContainText('4321');
});

test('loads the consumer-owned verification with a controlled clock', async ({ page }) => {
  await installClock(page);

  const scope = card(page, 'verification');
  const group = otp(scope, 'Code to verify');
  const idleBox = await group.boundingBox();
  const idleSize = { width: idleBox?.width, height: idleBox?.height };

  await cell(group, 1).click();
  await page.keyboard.type('123456');
  await expect(scope.getByRole('status', { name: 'Verifying code' })).toBeVisible();
  await freezeClock(page);
  await expect(scope.getByText('Verifying the code')).toBeVisible();
  for (const input of await group.locator('input').all()) await expect(input).toBeDisabled();
  const loadingBox = await group.boundingBox();
  expect({ width: loadingBox?.width, height: loadingBox?.height }).toEqual(idleSize);

  await page.clock.runFor(500);
  await expect(scope.getByText('Verifying the code')).toBeVisible();
  await page.clock.runFor(1000);
  await page.clock.resume();
  await expect(scope.getByText('Code accepted')).toBeVisible();
  await expect(scope.getByRole('status', { name: 'Verifying code' })).toHaveCount(0);
  for (const input of await group.locator('input').all()) await expect(input).toBeEnabled();

  await scope.getByRole('button', { name: 'Reset verification', exact: true }).click();
  await expect(scope.getByText('Enter 123456 to accept the code.')).toBeVisible();
  await expect.poll(() => cellValues(group)).toEqual(['', '', '', '', '', '']);

  await cell(group, 1).click();
  await page.keyboard.type('654321');
  await freezeClock(page);
  await page.clock.runFor(1100);
  await page.clock.resume();
  await expect(scope.getByText('Code rejected')).toBeVisible();
});

test('mounts the autofocus example on demand instead of on page load', async ({ page }) => {
  const scope = card(page, 'autofocus');

  await expect(page.locator('input:focus')).toHaveCount(0);
  await expect(scope.locator('input')).toHaveCount(0);

  await scope.getByRole('button', { name: 'Show autofocused code', exact: true }).click();
  const group = otp(scope, 'Autofocused code');
  await expect(cell(group, 1)).toBeFocused();
});

test('shows Signal Forms errors only after the group is edited', async ({ page }) => {
  const scope = card(page, 'validation');
  const group = otp(scope, 'Sign-in code');

  await expect(group).not.toHaveAttribute('data-kui-invalid', '');
  await expect(scope.getByRole('alert')).toHaveCount(0);
  await cell(group, 1).focus();
  await page.keyboard.press('Tab');
  await expect(scope.getByRole('alert')).toHaveCount(0);

  await cell(group, 1).click();
  await page.keyboard.type('1');
  await expect(scope.getByRole('alert')).toHaveText('Enter all 6 digits.');
  await expect(group).toHaveAttribute('data-kui-invalid', '');
  const errorId = await scope.getByRole('alert').getAttribute('id');
  expect(((await group.getAttribute('aria-describedby')) ?? '').split(' ')).toContain(errorId);
  await expect(readoutOf(scope)).toContainText('1');

  await page.keyboard.press('Backspace');
  await expect(scope.getByRole('alert')).toHaveText('Enter the sign-in code.');

  await page.keyboard.type('123456');
  await expect(scope.getByRole('alert')).toHaveCount(0);
  await expect(group).not.toHaveAttribute('data-kui-invalid', '');
  await expect(readoutOf(scope)).toContainText('123456');
});

test('loads the OTP Input scope and switches page text at runtime', async ({ page }) => {
  const localeResponse = await page.request.get('/i18n/otp-input/ru.json');
  expect(localeResponse.ok()).toBeTruthy();
  const translations = await localeResponse.json();

  await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();

  await expect(
    page.getByRole('heading', { level: 1, name: translations.title, exact: true }),
  ).toBeVisible();
  const defaultCard = page.getByRole('group', {
    name: translations.accessibility.default,
    exact: true,
  });
  await expect(defaultCard.getByText(translations.fields.verificationCode)).toBeVisible();
  // Library-owned strings stay English by design.
  await expect(cell(otp(defaultCard, 'Verification code'), 1)).toBeVisible();

  const validation = page.getByRole('group', {
    name: translations.accessibility.validation,
    exact: true,
  });
  const group = validation.getByRole('group', {
    name: translations.fields.signInCode,
    exact: true,
  });
  await cell(group, 1).click();
  await page.keyboard.type('1');
  await expect(validation.getByRole('alert')).toHaveText(translations.errors.length);
});

test('keeps the catalogue free of page-level horizontal overflow', async ({ page }) => {
  for (const viewport of [desktopViewport, tabletViewport, mobileViewport]) {
    await page.setViewportSize(viewport);
    await expectNoHorizontalOverflow(page);
  }
});

test.describe('catalogue captures', () => {
  for (const key of screenshotCards) {
    test(`captures the ${key} card at desktop and 320px @visual`, async ({ page }) => {
      const scope = card(page, key);

      await expect(scope).toBeVisible();
      await expect(scope).toHaveScreenshot(`otp-input-${key}-desktop.png`, {
        animations: 'disabled',
      });

      await page.setViewportSize(mobileCatalogueViewport);
      await expect(scope).toBeVisible();
      await expect(scope).toHaveScreenshot(`otp-input-${key}-320.png`, {
        animations: 'disabled',
      });
      await expectNoHorizontalOverflow(page);
    });
  }
});

test('captures real keyboard focus, typed input, and pasted input @visual', async ({ page }) => {
  const scope = card(page, 'entry');
  const group = otp(scope, 'Entry code');

  await cell(group, 1).focus();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Tab');
  await expect(cell(group, 1)).toBeFocused();
  expect(await cell(group, 1).evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(scope).toHaveScreenshot('otp-input-entry-focused.png', { animations: 'disabled' });

  await page.keyboard.type('123');
  await expect(scope).toHaveScreenshot('otp-input-entry-typed.png', { animations: 'disabled' });

  await paste(page, '654321');
  await expect(readoutOf(scope)).toContainText('654321');
  await expect(scope).toHaveScreenshot('otp-input-entry-pasted.png', { animations: 'disabled' });
});

test('captures real pointer hover on a cell @visual', async ({ page }) => {
  const scope = card(page, 'entry');
  const cellOne = cell(otp(scope, 'Entry code'), 1);

  await cellOne.hover();
  expect(await cellOne.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect(scope).toHaveScreenshot('otp-input-entry-hover.png', { animations: 'disabled' });
});

test('captures the verification loading, accepted, and rejected states @visual', async ({
  page,
}) => {
  await installClock(page);

  const scope = card(page, 'verification');
  const group = otp(scope, 'Code to verify');

  await cell(group, 1).click();
  await page.keyboard.type('123456');
  await expect(scope.getByText('Verifying the code')).toBeVisible();
  await freezeClock(page);
  await expect(scope).toHaveScreenshot('otp-input-verification-loading.png', {
    animations: 'disabled',
  });

  await page.clock.runFor(1100);
  await page.clock.resume();
  await expect(scope.getByText('Code accepted')).toBeVisible();
  await expect(scope).toHaveScreenshot('otp-input-verification-accepted.png', {
    animations: 'disabled',
  });

  await scope.getByRole('button', { name: 'Reset verification', exact: true }).click();
  await cell(group, 1).click();
  await page.keyboard.type('654321');
  await freezeClock(page);
  await page.clock.runFor(1100);
  await page.clock.resume();
  await expect(scope.getByText('Code rejected')).toBeVisible();
  await expect(scope).toHaveScreenshot('otp-input-verification-rejected.png', {
    animations: 'disabled',
  });
});

test('captures Signal Forms validation before and after editing @visual', async ({ page }) => {
  const scope = card(page, 'validation');
  const group = otp(scope, 'Sign-in code');

  await expect(scope).toHaveScreenshot('otp-input-validation-untouched.png', {
    animations: 'disabled',
  });

  await cell(group, 1).click();
  await page.keyboard.type('12');
  await expect(scope.getByRole('alert')).toHaveText('Enter all 6 digits.');
  await expect(scope).toHaveScreenshot('otp-input-validation-invalid.png', {
    animations: 'disabled',
  });

  await page.keyboard.type('3456');
  await expect(scope.getByRole('alert')).toHaveCount(0);
  await expect(scope).toHaveScreenshot('otp-input-validation-corrected.png', {
    animations: 'disabled',
  });
});

// Library defect: every cell is a tab stop, so Tab moves between cells although docs/otp-input.md says Tab leaves the group.
test.fixme('leaves the whole group on Tab as documented', async ({ page }) => {
  const group = otp(card(page, 'entry'), 'Entry code');
  await cell(group, 1).focus();
  await page.keyboard.press('Tab');
  await expect(group.locator('input:focus')).toHaveCount(0);
});

// Library defect: cells are flex items without a minimum size, so an 8-cell group shrinks its cells below square at 320px instead of scrolling as documented in otp-input.css.
test.fixme('keeps cells square in a long group at 320px', async ({ page }) => {
  await page.setViewportSize(mobileCatalogueViewport);
  const box = await cell(otp(card(page, 'lengths'), '8 cells'), 1, 8).boundingBox();
  expect(box?.width).toBe(box?.height);
});

test('captures the mounted autofocus group with the first cell focused @visual', async ({
  page,
}) => {
  const scope = card(page, 'autofocus');
  await scope.getByRole('button', { name: 'Show autofocused code', exact: true }).click();
  await expect(cell(otp(scope, 'Autofocused code'), 1)).toBeFocused();
  await expect(scope).toHaveScreenshot('otp-input-autofocus-mounted.png', {
    animations: 'disabled',
  });
});
