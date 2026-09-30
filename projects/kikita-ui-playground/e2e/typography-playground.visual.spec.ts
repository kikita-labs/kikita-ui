import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { openWithHeldScripts } from './support/ssr';

const desktopViewport = { width: 1440, height: 1000 };
const tabletViewport = { width: 768, height: 1024 };
const mobileViewport = { width: 320, height: 844 };
const captureDesktopViewport = { width: 1440, height: 1600 };
const captureMobileViewport = { width: 320, height: 2600 };

const roles = [
  ['Display role', 'Settings and preferences', 'display', '36px', '41.4px', '700'],
  ['Heading large role', 'Workspace overview', 'heading-lg', '28px', '33.6px', '700'],
  ['Heading medium role', 'Edit team member', 'heading-md', '22px', '27.5px', '600'],
  ['Heading small role', 'Billing history', 'heading-sm', '18px', '23.4px', '600'],
  ['Title role', 'Notification preferences', 'title', '14px', '19.6px', '600'],
  [
    'Body large role',
    'Relaxed paragraph text where space allows.',
    'body-lg',
    '15px',
    '24px',
    '400',
  ],
  ['Body role', 'Manage members, billing, and integrations.', 'body', '14px', '21px', '400'],
  ['Body small role', 'Dense description for table rows.', 'body-sm', '13px', '19.5px', '400'],
  ['Caption role', 'Updated 2 minutes ago', 'caption', '11px', '16.5px', '400'],
  ['Overline role', 'Group label', 'overline', '9px', '12.6px', '600'],
  ['Code role', 'workspace.slug', 'code', '13px', '19.5px', '400'],
] as const;

const tones = [
  ['default', 'Default', '--kui-color-text'],
  ['muted', 'Muted', '--kui-color-text-secondary'],
  ['disabled', 'Disabled', '--kui-color-text-disabled'],
  ['primary', 'Primary', '--kui-color-primary-soft-text'],
  ['success', 'Success', '--kui-color-success-soft-text'],
  ['warning', 'Warning', '--kui-color-warning-soft-text'],
  ['danger', 'Danger', '--kui-color-danger-soft-text'],
] as const;

const matrixVariants = ['heading-sm', 'body', 'caption', 'overline', 'code'];

/** Resolves a color token to the computed rgb value inside the element's own scope. */
function resolveToken(target: Locator, token: string): Promise<string> {
  return target.evaluate((element, name) => {
    const probe = document.createElement('span');
    probe.style.color = `var(${name})`;
    element.append(probe);
    const color = getComputedStyle(probe).color;
    probe.remove();

    return color;
  }, token);
}

function readType(target: Locator) {
  return target.evaluate((element) => {
    const style = getComputedStyle(element);

    return {
      fontSize: style.fontSize,
      lineHeight: style.lineHeight,
      fontWeight: style.fontWeight,
      fontFamily: style.fontFamily,
      textTransform: style.textTransform,
      color: style.color,
    };
  });
}

async function expectNoPageOverflow(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}

async function captureGroup(page: Page, name: string, file: string): Promise<void> {
  const group = page.getByRole('group', { name, exact: true });

  // The workspace owns scrolling, so tall groups need a tall viewport to be captured whole.
  await page.setViewportSize(captureDesktopViewport);
  await group.scrollIntoViewIfNeeded();
  await expect(group).toHaveScreenshot(`${file}-desktop.png`);

  await page.setViewportSize(captureMobileViewport);
  await expectNoPageOverflow(page);
  await group.scrollIntoViewIfNeeded();
  await expect(group).toHaveScreenshot(`${file}-320.png`);
}

test.describe('catalogue', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize(desktopViewport);
    await page.goto('/components/typography');
    await expect(
      page.getByRole('heading', { level: 1, name: 'Typography', exact: true }),
    ).toBeVisible();
  });

  test('renders the minimal default body text with token-driven metrics', async ({ page }) => {
    const example = page.getByRole('group', { name: 'Default typography example', exact: true });
    const text = example.getByText('Manage members, billing, and integrations.', { exact: true });

    await expect(text).toHaveAttribute('data-kui-text-variant', 'body');
    await expect(text).toHaveAttribute('data-kui-text-tone', 'default');
    expect(await text.evaluate((element) => element.tagName)).toBe('P');

    const type = await readType(text);

    expect([type.fontSize, type.lineHeight, type.fontWeight]).toEqual(['14px', '21px', '400']);
    expect(type.color).toBe(await resolveToken(text, '--kui-color-text'));
  });

  test('applies the documented size, line height, and weight to every role', async ({ page }) => {
    for (const [groupName, sample, variant, size, lineHeight, weight] of roles) {
      const group = page.getByRole('group', { name: groupName, exact: true });
      const text = group.getByText(sample, { exact: true });

      await expect(text, groupName).toHaveAttribute('data-kui-text-variant', variant);

      const type = await readType(text);

      expect([type.fontSize, type.lineHeight, type.fontWeight], groupName).toEqual([
        size,
        lineHeight,
        weight,
      ]);
      expect(type.textTransform, groupName).toBe(variant === 'overline' ? 'uppercase' : 'none');
      expect(type.fontFamily.includes('mono'), groupName).toBe(variant === 'code');
    }
  });

  test('applies every tone as a color-only token on any role', async ({ page }) => {
    const examples = page.getByRole('group', { name: 'Tone examples', exact: true });
    const colors: string[] = [];

    for (const [tone, label, token] of tones) {
      const text = examples.getByText(`${label} text`, { exact: true });

      await expect(text).toHaveAttribute('data-kui-text-tone', tone);

      const color = (await readType(text)).color;

      expect(color, tone).toBe(await resolveToken(text, token));
      colors.push(color);
    }

    expect(new Set(colors).size).toBe(tones.length);

    for (const [tone, label, token] of tones) {
      const row = page.getByRole('group', { name: `${label} tone across roles`, exact: true });
      const cells = row.locator('[data-kui-text-variant]');

      await expect(cells).toHaveCount(matrixVariants.length);
      await expect
        .poll(() =>
          cells.evaluateAll((items) =>
            items.map((item) => item.getAttribute('data-kui-text-variant')),
          ),
        )
        .toEqual(matrixVariants);

      for (let index = 0; index < matrixVariants.length; index += 1) {
        const cell = cells.nth(index);

        await expect(cell).toHaveAttribute('data-kui-text-tone', tone);
        expect((await readType(cell)).color, `${tone} ${matrixVariants[index]}`).toBe(
          await resolveToken(cell, token),
        );
      }
    }
  });

  test('keeps documented native host elements and their semantics', async ({ page }) => {
    const hosts = page.getByRole('group', { name: 'Semantic host examples', exact: true });
    const headings = [
      [3, 'Heading level 3', 'heading-md'],
      [4, 'Heading level 4', 'heading-sm'],
      [5, 'Heading level 5', 'title'],
    ] as const;

    for (const [level, name, variant] of headings) {
      await expect(hosts.getByRole('heading', { level, name, exact: true })).toHaveAttribute(
        'data-kui-text-variant',
        variant,
      );
    }

    const elements = [
      ['Paragraph element', 'P'],
      ['Small element', 'SMALL'],
      ['Span element', 'SPAN'],
      ['code.element', 'CODE'],
    ] as const;

    for (const [text, tag] of elements) {
      const host = hosts.getByText(text, { exact: true });

      expect(await host.evaluate((element) => element.tagName), text).toBe(tag);
      await expect(host).not.toHaveAttribute('role');
    }

    await expect(hosts.getByRole('code')).toHaveText('code.element');
  });

  test('gives the directive and plain CSS classes identical computed styles', async ({ page }) => {
    const group = page.getByRole('group', {
      name: 'Directive and CSS class examples',
      exact: true,
    });
    const pairs = [
      ['Directive body', 'Class body'],
      ['Directive caption', 'Class caption'],
      ['directive.code', 'class.code'],
    ] as const;

    for (const [directive, plain] of pairs) {
      const directiveType = await readType(group.getByText(directive, { exact: true }));
      const plainType = await readType(group.getByText(plain, { exact: true }));

      expect(directiveType, directive).toEqual(plainType);
    }

    const inherit = group.getByRole('group', { name: 'Inherited color examples', exact: true });
    const inheritedFromParent = await readType(
      inherit.getByText('Class inside a muted parent', { exact: true }),
    );
    const directiveInside = await readType(
      inherit.getByText('Directive inside a muted parent', { exact: true }),
    );
    const muted = await resolveToken(inherit, '--kui-color-text-secondary');
    const text = await resolveToken(inherit, '--kui-color-text');

    expect(inheritedFromParent.color).toBe(muted);
    expect(directiveInside.color).toBe(text);
    expect(muted).not.toBe(text);
  });

  test('follows size, line height, and weight tokens overridden on an ancestor', async ({
    page,
  }) => {
    const example = page.getByRole('group', { name: 'Default typography example', exact: true });
    const text = example.getByText('Manage members, billing, and integrations.', { exact: true });

    await text.evaluate((element) => {
      element.parentElement?.style.setProperty('--kui-type-body-size', '20px');
      element.parentElement?.style.setProperty('--kui-type-body-line-height', '2');
      element.parentElement?.style.setProperty('--kui-type-body-weight', '700');
    });

    const overridden = await readType(text);

    expect([overridden.fontSize, overridden.lineHeight, overridden.fontWeight]).toEqual([
      '20px',
      '40px',
      '700',
    ]);

    await text.evaluate((element) => {
      element.parentElement?.style.removeProperty('--kui-type-body-size');
      element.parentElement?.style.removeProperty('--kui-type-body-line-height');
      element.parentElement?.style.removeProperty('--kui-type-body-weight');
    });

    const restored = await readType(text);

    expect([restored.fontSize, restored.lineHeight, restored.fontWeight]).toEqual([
      '14px',
      '21px',
      '400',
    ]);
  });

  test('wraps long text and lets the container own truncation', async ({ page }) => {
    const group = page.getByRole('group', {
      name: 'Wrapping and truncation examples',
      exact: true,
    });
    const paragraph = group.getByText(/^Long paragraph text wraps cleanly/);
    const token = group.getByText('a_very_long_environment_variable_name_that_overflows', {
      exact: true,
    });

    const wrapped = await paragraph.evaluate((element) => ({
      height: element.getBoundingClientRect().height,
      fits: element.scrollWidth <= element.clientWidth,
    }));

    expect(wrapped.height).toBeGreaterThan(21 * 2);
    expect(wrapped.fits).toBe(true);

    const truncated = await token.evaluate((element) => ({
      overflows: element.scrollWidth > element.clientWidth,
      textOverflow: getComputedStyle(element).textOverflow,
      overflow: getComputedStyle(element).overflow,
    }));

    expect(truncated).toEqual({ overflows: true, textOverflow: 'ellipsis', overflow: 'clip' });
    await expectNoPageOverflow(page);
  });

  test('re-evaluates tone tokens inside light and dark theme scopes', async ({ page }) => {
    const light = page.getByRole('region', { name: 'Light theme scope', exact: true });
    const dark = page.getByRole('region', { name: 'Dark theme scope', exact: true });

    await expect(light).toHaveAttribute('data-kui-theme', 'light');
    await expect(dark).toHaveAttribute('data-kui-theme', 'dark');

    for (const [label, token] of [
      ['2 members need action', '--kui-color-danger-soft-text'],
      ['3 pending invitations', '--kui-color-text-secondary'],
    ] as const) {
      const lightText = light.getByText(label, { exact: true });
      const darkText = dark.getByText(label, { exact: true });
      const lightColor = (await readType(lightText)).color;
      const darkColor = (await readType(darkText)).color;

      expect(lightColor, label).toBe(await resolveToken(lightText, token));
      expect(darkColor, label).toBe(await resolveToken(darkText, token));
      expect(lightColor, label).not.toBe(darkColor);
    }
  });

  test('changes tone colors when the shell theme switches', async ({ page }) => {
    const example = page.getByRole('group', { name: 'Default typography example', exact: true });
    const text = example.getByText('Manage members, billing, and integrations.', { exact: true });
    const darkColor = (await readType(text)).color;

    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Switch to light theme', exact: true })
      .click();
    await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'light');

    const lightColor = (await readType(text)).color;

    expect(lightColor).toBe(await resolveToken(text, '--kui-color-text'));
    expect(lightColor).not.toBe(darkColor);
  });

  test('loads the Typography scope and switches its names to Russian', async ({ page }) => {
    const localeResponse = await page.request.get('/i18n/typography/ru.json');
    expect(localeResponse.ok()).toBeTruthy();
    const translations = await localeResponse.json();

    await page.getByRole('button', { name: 'Switch language to Russian', exact: true }).click();

    await expect(page.locator('html')).toHaveAttribute('lang', 'ru');
    await expect(
      page.getByRole('heading', { level: 1, name: translations.title, exact: true }),
    ).toBeVisible();

    const overline = page
      .getByRole('group', { name: translations.roles.overline, exact: true })
      .getByText(translations.samples.overline, { exact: true });

    await expect(overline).toBeVisible();
    expect((await readType(overline)).textTransform).toBe('uppercase');
    await expect(
      page.getByRole('group', { name: translations.accessibility.roles, exact: true }),
    ).toBeVisible();
  });

  test('fits the desktop, tablet, and 320px viewports without page overflow', async ({ page }) => {
    for (const viewport of [desktopViewport, tabletViewport, mobileViewport]) {
      await page.setViewportSize(viewport);
      await expectNoPageOverflow(page);
    }
  });

  test('captures the default and tone examples @visual', async ({ page }) => {
    await captureGroup(page, 'Default typography example', 'typography-default');
    await captureGroup(page, 'Tone examples', 'typography-tones');
  });

  test('captures every type role @visual', async ({ page }) => {
    await captureGroup(page, 'Type role examples', 'typography-roles');
  });

  test('captures semantic hosts and the directive next to CSS classes @visual', async ({
    page,
  }) => {
    await captureGroup(page, 'Semantic host examples', 'typography-hosts');
    await captureGroup(page, 'Directive and CSS class examples', 'typography-classes');
  });

  test('captures every tone combined with representative roles @visual', async ({ page }) => {
    await captureGroup(page, 'Tone and role combinations', 'typography-matrix');
  });

  test('captures wrapping, truncation, and compositions @visual', async ({ page }) => {
    await captureGroup(page, 'Wrapping and truncation examples', 'typography-wrapping');
    await captureGroup(page, 'Typography composition examples', 'typography-compositions');
  });

  test('captures light and dark theme scopes and the light shell theme @visual', async ({
    page,
  }) => {
    await captureGroup(page, 'Theme scope examples', 'typography-scopes');
    await page.setViewportSize(captureDesktopViewport);

    await page
      .getByRole('banner')
      .getByRole('button', { name: 'Switch to light theme', exact: true })
      .click();
    await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'light');

    const tones = page.getByRole('group', { name: 'Tone examples', exact: true });

    await expect(tones).toHaveScreenshot('typography-tones-light.png');
  });
});

test.describe('server rendering', () => {
  test('server-renders the catalogue and keeps it through hydration', async ({ page }) => {
    const held = await openWithHeldScripts(page, '/components/typography');

    expect(held.serverHtml).toContain('ng-server-context="ssr"');
    expect(held.serverHtml).toMatch(/<h1\b[^>]*>\s*Typography\s*<\/h1>/);
    expect(held.serverHtml).toContain('Settings and preferences');
    expect(held.serverHtml).toContain('data-kui-text-variant="display"');

    const title = page.getByRole('heading', { level: 1, name: 'Typography', exact: true });

    await expect(title).toBeVisible();
    await title.evaluate((element) => element.setAttribute('data-server-marker', 'kept'));
    held.release();

    await expect(async () => {
      await page
        .getByRole('banner')
        .getByRole('button', { name: 'Switch to light theme', exact: true })
        .click({ timeout: 1_000 });
      await expect(page.locator('html')).toHaveAttribute('data-kui-theme', 'light', {
        timeout: 1_000,
      });
    }).toPass();
    await expect(title).toHaveAttribute('data-server-marker', 'kept');
  });
});
