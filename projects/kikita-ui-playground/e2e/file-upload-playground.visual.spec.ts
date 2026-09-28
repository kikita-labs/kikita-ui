import type { Locator, Page } from '@playwright/test';
import { expect, test } from '@playwright/test';

const mobileViewport = { width: 320, height: 844 };
const mobileCatalogueViewport = { width: 320, height: 2048 };

interface FileUploadPageLocale {
  title: string;
  accessibility: {
    variants: string;
    states: string;
    sizes: string;
    disabled: string;
  };
  errors: {
    network: string;
  };
}

const tinyPng = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j8ZkAAAAASUVORK5CYII=',
  'base64',
);

const catalogueExamples = [
  ['Default file upload', 'file-upload-default-desktop.png', 'file-upload-default-320.png'],
  [
    'File Upload variants and selection modes',
    'file-upload-variants-desktop.png',
    'file-upload-variants-320.png',
  ],
  [
    'File selection and validation',
    'file-upload-validation-desktop.png',
    'file-upload-validation-320.png',
  ],
  ['Wildcard MIME validation', 'file-upload-wildcard-desktop.png', 'file-upload-wildcard-320.png'],
  ['Single file replacement', 'file-upload-single-desktop.png', 'file-upload-single-320.png'],
  ['File list states', 'file-upload-states-desktop.png', 'file-upload-states-320.png'],
  ['File Upload sizes', 'file-upload-sizes-desktop.png', 'file-upload-sizes-320.png'],
  [
    'Disabled File Upload pickers',
    'file-upload-disabled-desktop.png',
    'file-upload-disabled-320.png',
  ],
  ['File Upload inside a field', 'file-upload-field-desktop.png', 'file-upload-field-320.png'],
] as const;

test.beforeEach(async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/components/file-upload');
  await expect(
    page.getByRole('heading', { level: 1, name: 'File Upload', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('group', { name: 'File list states', exact: true }).getByRole('button', {
      name: 'Retry',
      exact: true,
    }),
  ).toBeVisible();
});

test('server-renders the catalogue and hydrates seeded File objects in the browser', async ({
  browser,
  page,
}) => {
  const routeUrl = new URL('/components/file-upload', page.url()).toString();
  const serverContext = await browser.newContext({ javaScriptEnabled: false });

  try {
    const serverPage = await serverContext.newPage();
    const response = await serverPage.goto(routeUrl);

    expect(response?.status()).toBe(200);
    await expect(
      serverPage.getByRole('heading', { level: 1, name: 'File Upload', exact: true }),
    ).toBeVisible();
    await expect(
      serverPage
        .getByRole('group', { name: 'Default file upload', exact: true })
        .getByRole('button', { name: /Upload file/ }),
    ).toBeVisible();
    await expect(
      serverPage
        .getByRole('group', { name: 'File list states', exact: true })
        .getByText('preview.svg'),
    ).toHaveCount(0);
  } finally {
    await serverContext.close();
  }

  const runtimeErrors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') runtimeErrors.push(message.text());
  });
  page.on('pageerror', (error) => runtimeErrors.push(error.message));
  await page.reload();

  await expect(
    page
      .getByRole('group', { name: 'File list states', exact: true })
      .getByRole('progressbar', { name: 'Uploading preview.svg' }),
  ).toBeVisible();
  expect(runtimeErrors).toEqual([]);
});

test('uses the file picker and consumer-owned model updates for the upload lifecycle', async ({
  page,
}) => {
  const validation = page.getByRole('group', {
    name: 'File selection and validation',
    exact: true,
  });
  const picker = validation.getByRole('button', { name: /Upload file/ });
  const chooserPromise = page.waitForEvent('filechooser');

  await picker.press('Enter');
  await (
    await chooserPromise
  ).setFiles({
    name: 'accepted.png',
    mimeType: 'image/png',
    buffer: tinyPng,
  });

  await expect(validation.getByText('Queued', { exact: true })).toBeVisible();
  await expect(validation.getByRole('button', { name: 'Start upload' })).toBeEnabled();
  await validation.getByRole('button', { name: 'Start upload' }).click();
  await expect(
    validation.getByRole('progressbar', { name: 'Uploading accepted.png' }),
  ).toBeVisible();

  await validation.getByRole('button', { name: 'Finish upload' }).click();
  await expect(validation.getByText('Done', { exact: true })).toBeVisible();
});

test('uses the nested Choose file button to open the native picker', async ({ page }) => {
  const variants = page.getByRole('group', {
    name: 'File Upload variants and selection modes',
    exact: true,
  });
  const dropzoneMultiple = variants.getByRole('group', {
    name: 'Dropzone · multiple',
    exact: true,
  });
  const chooserPromise = page.waitForEvent('filechooser');

  await dropzoneMultiple.getByRole('button', { name: 'Choose file', exact: true }).click();
  await (
    await chooserPromise
  ).setFiles({
    name: 'nested-chooser.png',
    mimeType: 'image/png',
    buffer: tinyPng,
  });

  await expect(dropzoneMultiple.getByText('nested-chooser.png')).toBeVisible();
});

test('keeps native input attributes aligned with selection settings and clears after picking', async ({
  page,
}) => {
  const variants = page.getByRole('group', {
    name: 'File Upload variants and selection modes',
    exact: true,
  });
  const multiple = variants.getByRole('group', { name: 'Dropzone · multiple', exact: true });
  const multipleInput = multiple.locator('input[type="file"]');
  await expect(multipleInput).toHaveAttribute('multiple', '');
  await expect(multipleInput).not.toHaveAttribute('accept');
  await expect(multipleInput).toHaveAttribute('tabindex', '-1');

  const single = page.getByRole('group', { name: 'Single file replacement', exact: true });
  await expect(single.locator('input[type="file"]')).not.toHaveAttribute('multiple');

  const validation = page.getByRole('group', {
    name: 'File selection and validation',
    exact: true,
  });
  await expect(validation.locator('input[type="file"]')).toHaveAttribute('accept', 'image/png');

  const disabledDropzone = page
    .getByRole('group', { name: 'Disabled File Upload pickers', exact: true })
    .getByRole('group', { name: 'Disabled dropzone with an existing file', exact: true });
  await expect(disabledDropzone.locator('input[type="file"]')).toBeDisabled();

  const picker = multiple.getByRole('button', { name: /Upload file/ });

  for (let selection = 0; selection < 2; selection++) {
    const chooserPromise = page.waitForEvent('filechooser');

    await picker.click();
    await (
      await chooserPromise
    ).setFiles({
      name: 'repeat.png',
      mimeType: 'image/png',
      buffer: tinyPng,
    });
    await expect(multipleInput).toHaveValue('');
  }

  await expect(multiple.getByRole('button', { name: 'Remove repeat.png' })).toHaveCount(2);
});

test('composes with Field using consumer-owned required validation', async ({ page }) => {
  const field = page.getByRole('group', { name: 'File Upload inside a field', exact: true });
  await expect(field.getByText('A file is required to continue.', { exact: true })).toBeVisible();

  const chooserPromise = page.waitForEvent('filechooser');
  await field.getByRole('button', { name: 'Attach file', exact: true }).click();
  await (
    await chooserPromise
  ).setFiles({
    name: 'identity.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4 sample'),
  });

  await expect(field.getByText('A file is required to continue.', { exact: true })).toHaveCount(0);
  await field.getByRole('button', { name: 'Remove identity.pdf' }).click();
  await expect(field.getByText('A file is required to continue.', { exact: true })).toBeVisible();
});

test('reports MIME and size errors from actual file selections', async ({ page }) => {
  const validation = page.getByRole('group', {
    name: 'File selection and validation',
    exact: true,
  });
  const picker = validation.getByRole('button', { name: /Upload file/ });
  const wrongTypeChooser = page.waitForEvent('filechooser');

  await picker.click();
  await (
    await wrongTypeChooser
  ).setFiles({
    name: 'notes.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('not a PNG'),
  });
  await expect(validation.getByText('Invalid file type', { exact: true })).toBeVisible();

  await validation.getByRole('button', { name: 'Remove notes.txt' }).click();

  const oversizedChooser = page.waitForEvent('filechooser');
  await picker.click();
  await (
    await oversizedChooser
  ).setFiles({
    name: 'large.png',
    mimeType: 'image/png',
    buffer: Buffer.concat([tinyPng, Buffer.alloc(2_048)]),
  });
  await expect(validation.getByText('Exceeds max size', { exact: false })).toBeVisible();
});

test('shows real valid and invalid drag states and rejects an invalid dropped file', async ({
  page,
}) => {
  const validation = page.getByRole('group', {
    name: 'File selection and validation',
    exact: true,
  });
  const dropzone = validation.getByRole('button', { name: /Upload file/ });

  await dropzone.evaluate((element) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File(['valid image'], 'dragged.png', { type: 'image/png' }));
    element.dispatchEvent(
      new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer }),
    );
  });
  await expect(dropzone).toHaveAttribute('data-kui-drag', 'over');
  await expect(validation).toHaveScreenshot('file-upload-valid-drag.png');
  await dropzone.evaluate((element) => {
    element.dispatchEvent(new DragEvent('dragleave', { bubbles: true, cancelable: true }));
  });
  await expect(dropzone).toHaveAttribute('data-kui-drag', 'none');

  await dropzone.evaluate(
    (element, pngBytes) => {
      const dataTransfer = new DataTransfer();
      dataTransfer.items.add(
        new File([new Uint8Array(pngBytes)], 'accepted-drop.png', { type: 'image/png' }),
      );
      element.dispatchEvent(
        new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }),
      );
    },
    [...tinyPng],
  );
  await expect(dropzone).toHaveAttribute('data-kui-drag', 'none');
  await expect(validation.getByRole('button', { name: 'Remove accepted-drop.png' })).toBeVisible();
  await expect(validation.getByText('Queued', { exact: true })).toBeVisible();
  await validation.getByRole('button', { name: 'Remove accepted-drop.png' }).click();

  await dropzone.evaluate((element) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File(['not an image'], 'dragged.txt', { type: 'text/plain' }));
    element.dispatchEvent(
      new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer }),
    );
  });
  await expect(dropzone).toHaveAttribute('data-kui-drag', 'invalid');
  await expect(validation).toHaveScreenshot('file-upload-invalid-drag.png');

  await dropzone.evaluate((element) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File(['not an image'], 'dropped.txt', { type: 'text/plain' }));
    element.dispatchEvent(new DragEvent('drop', { bubbles: true, cancelable: true, dataTransfer }));
  });
  await expect(dropzone).toHaveAttribute('data-kui-drag', 'none');
  await expect(validation.getByText('Invalid file type', { exact: true })).toBeVisible();
  await expect(validation).toHaveScreenshot('file-upload-rejected-drop.png');
});

test('records literal wildcard MIME validation as a separate behavior check', async ({ page }) => {
  const wildcard = page.getByRole('group', { name: 'Wildcard MIME validation', exact: true });
  const chooserPromise = page.waitForEvent('filechooser');

  await wildcard.getByRole('button', { name: /Upload file/ }).click();
  await (
    await chooserPromise
  ).setFiles({
    name: 'wildcard.png',
    mimeType: 'image/png',
    buffer: tinyPng,
  });

  await expect(wildcard.getByText('Invalid file type', { exact: true })).toBeVisible();
});

test('enforces multiple-mode maxCount and clears its live error after removal', async ({
  page,
}) => {
  const validation = page.getByRole('group', {
    name: 'File selection and validation',
    exact: true,
  });
  const chooserPromise = page.waitForEvent('filechooser');

  await validation.getByRole('button', { name: /Upload file/ }).click();
  await (
    await chooserPromise
  ).setFiles([
    { name: 'first.png', mimeType: 'image/png', buffer: tinyPng },
    { name: 'second.png', mimeType: 'image/png', buffer: tinyPng },
    { name: 'third.png', mimeType: 'image/png', buffer: tinyPng },
  ]);

  await expect(validation.getByText('Maximum 2 files', { exact: true })).toBeVisible();
  await expect(validation.getByRole('button', { name: 'Remove first.png' })).toBeVisible();
  await expect(validation.getByRole('button', { name: 'Remove third.png' })).toHaveCount(0);
  await expect(validation).toHaveScreenshot('file-upload-max-count-error.png');
  await validation.getByRole('button', { name: 'Remove first.png' }).click();
  await expect(validation.getByText('Maximum 2 files', { exact: true })).toHaveCount(0);
  await expect(validation.getByRole('button', { name: 'Remove second.png' })).toBeVisible();
  await expect(validation).toHaveScreenshot('file-upload-max-count-cleared.png');
});

test('single mode replaces the current file and ignores maxCount', async ({ page }) => {
  const single = page.getByRole('group', { name: 'Single file replacement', exact: true });
  const picker = single.getByRole('button', { name: /Upload file/ });
  const firstChooser = page.waitForEvent('filechooser');

  await picker.click();
  await (
    await firstChooser
  ).setFiles({
    name: 'first.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('first'),
  });

  const secondChooser = page.waitForEvent('filechooser');
  await picker.click();
  await (
    await secondChooser
  ).setFiles({
    name: 'second.txt',
    mimeType: 'text/plain',
    buffer: Buffer.from('second'),
  });

  await expect(single.getByRole('button', { name: 'Remove first.txt' })).toHaveCount(0);
  await expect(single.getByRole('button', { name: 'Remove second.txt' })).toBeVisible();
  await expect(single.getByText('Maximum 1 files', { exact: true })).toHaveCount(0);
});

test('supports Space, Tab, Delete, and Backspace through the picker and file row', async ({
  page,
}) => {
  const validation = page.getByRole('group', {
    name: 'File selection and validation',
    exact: true,
  });
  const picker = validation.getByRole('button', { name: /Upload file/ });
  const chooserPromise = page.waitForEvent('filechooser');

  await picker.press('Space');
  await (
    await chooserPromise
  ).setFiles({
    name: 'tab-delete.png',
    mimeType: 'image/png',
    buffer: tinyPng,
  });

  await picker.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Delete');
  await expect(validation.getByRole('button', { name: 'Remove tab-delete.png' })).toHaveCount(0);

  const secondChooser = page.waitForEvent('filechooser');
  await picker.press('Space');
  await (
    await secondChooser
  ).setFiles({
    name: 'backspace.png',
    mimeType: 'image/png',
    buffer: tinyPng,
  });

  const remove = validation.getByRole('button', { name: 'Remove backspace.png' });
  await picker.focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(remove).toBeFocused();
  await expect(validation).toHaveScreenshot('file-upload-keyboard-focused-remove.png');
  await remove.press('Backspace');
  await expect(remove).toHaveCount(0);
});

test('emits Retry for consumer-owned recovery and exposes disabled picker states', async ({
  page,
}) => {
  const states = page.getByRole('group', { name: 'File list states', exact: true });
  await states.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(states.getByRole('progressbar', { name: 'Uploading archive.zip' })).toBeVisible();

  const disabled = page.getByRole('group', { name: 'Disabled File Upload pickers', exact: true });
  await expect(disabled.getByRole('button', { name: /Upload file/ })).toHaveAttribute(
    'aria-disabled',
    'true',
  );
  await expect(disabled.getByRole('button', { name: 'Attach file' })).toBeDisabled();

  const disabledDropzone = disabled.getByRole('group', {
    name: 'Disabled dropzone with an existing file',
    exact: true,
  });
  const disabledZone = disabledDropzone.getByRole('button', { name: /Upload file/ });
  await disabledZone.evaluate((element) => {
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(new File(['disabled'], 'ignored.png', { type: 'image/png' }));
    element.dispatchEvent(
      new DragEvent('dragenter', { bubbles: true, cancelable: true, dataTransfer }),
    );
  });
  await expect(disabledZone).toHaveAttribute('data-kui-drag', 'none');

  const retry = disabledDropzone.getByRole('button', { name: 'Retry', exact: true });
  await expect(retry).toBeEnabled();
  await retry.focus();
  await retry.press('Enter');
  await expect(
    disabledDropzone.getByRole('progressbar', { name: 'Uploading disabled-retry.zip' }),
  ).toBeVisible();
});

test('loads the File Upload translation scope in English and Russian', async ({ page }) => {
  const [englishResponse, russianResponse] = await Promise.all([
    page.request.get('/i18n/file-upload/en.json'),
    page.request.get('/i18n/file-upload/ru.json'),
  ]);
  expect(englishResponse.ok()).toBeTruthy();
  expect(russianResponse.ok()).toBeTruthy();
  const english = (await englishResponse.json()) as FileUploadPageLocale;
  const russian = (await russianResponse.json()) as FileUploadPageLocale;

  const englishStates = page.getByRole('group', {
    name: english.accessibility.states,
    exact: true,
  });
  await expect(englishStates.getByText(english.errors.network, { exact: true })).toBeVisible();
  const englishSizes = page.getByRole('group', {
    name: english.accessibility.sizes,
    exact: true,
  });
  const englishSizeErrors = englishSizes.getByText(english.errors.network, { exact: true });
  await expect(englishSizeErrors).toHaveCount(3);
  await expect(englishSizeErrors.first()).toBeVisible();
  const englishDisabled = page.getByRole('group', {
    name: english.accessibility.disabled,
    exact: true,
  });
  const englishDisabledErrors = englishDisabled.getByText(english.errors.network, { exact: true });
  await expect(englishDisabledErrors).toHaveCount(2);
  await expect(englishDisabledErrors.first()).toBeVisible();

  await page.getByRole('button', { name: 'Switch language to Russian' }).click();
  await expect(
    page.getByRole('heading', { level: 1, name: russian.title, exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('group', { name: russian.accessibility.variants, exact: true }),
  ).toBeVisible();
  await expect(
    page
      .getByRole('group', { name: russian.accessibility.states, exact: true })
      .getByText(russian.errors.network, { exact: true }),
  ).toBeVisible();
  const russianSizes = page.getByRole('group', {
    name: russian.accessibility.sizes,
    exact: true,
  });
  const russianSizeErrors = russianSizes.getByText(russian.errors.network, { exact: true });
  await expect(russianSizeErrors).toHaveCount(3);
  await expect(russianSizeErrors.first()).toBeVisible();
  const russianDisabled = page.getByRole('group', {
    name: russian.accessibility.disabled,
    exact: true,
  });
  const russianDisabledErrors = russianDisabled.getByText(russian.errors.network, { exact: true });
  await expect(russianDisabledErrors).toHaveCount(2);
  await expect(russianDisabledErrors.first()).toBeVisible();
  await expect(englishStates.getByText(english.errors.network, { exact: true })).toHaveCount(0);
  await expect(englishSizes.getByText(english.errors.network, { exact: true })).toHaveCount(0);
  await expect(englishDisabled.getByText(english.errors.network, { exact: true })).toHaveCount(0);
});

test('fits at desktop, tablet, and 320px without page-level horizontal overflow', async ({
  page,
}) => {
  for (const viewport of [
    { width: 1440, height: 1000 },
    { width: 768, height: 1024 },
    mobileViewport,
  ]) {
    await page.setViewportSize(viewport);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
      .toBe(true);
  }
});

test('captures each named File Upload section at desktop and 320px', async ({ page }) => {
  for (const [name, desktopScreenshot] of catalogueExamples) {
    await expect(page.getByRole('group', { name, exact: true })).toHaveScreenshot(
      desktopScreenshot,
    );
  }

  await page.setViewportSize(mobileCatalogueViewport);
  for (const [name, , mobileScreenshot] of catalogueExamples) {
    await expect(page.getByRole('group', { name, exact: true })).toHaveScreenshot(mobileScreenshot);
  }
});

test('captures the default dropzone focus ring reached by keyboard navigation', async ({
  page,
}) => {
  const defaultExample = page.getByRole('group', { name: 'Default file upload', exact: true });
  const dropzone = defaultExample.getByRole('button', { name: /Upload file/ });

  await tabTo(page, dropzone);
  await expect(dropzone).toBeFocused();
  expect(await dropzone.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(defaultExample).toHaveScreenshot('file-upload-focused-dropzone.png');
});

test('captures the dropzone hover produced by pointer interaction', async ({ page }) => {
  const defaultExample = page.getByRole('group', { name: 'Default file upload', exact: true });
  await defaultExample.getByRole('button', { name: /Upload file/ }).hover();
  await expect(defaultExample).toHaveScreenshot('file-upload-hovered-dropzone.png');
});

async function tabTo(page: Page, target: Locator): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;

    await page.keyboard.press('Tab');
  }

  throw new Error('Keyboard navigation did not reach the default File Upload dropzone.');
}
