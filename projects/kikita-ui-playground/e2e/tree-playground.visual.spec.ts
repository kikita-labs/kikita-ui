import type { Locator, Page } from '@playwright/test';

import { expect, test } from './support/fixtures';
import { kuiMessage, loadKuiCatalogue } from './support/kui-catalogue';

const desktopViewport = { width: 1440, height: 1000 };
const mobileViewport = { width: 320, height: 1024 };

test.beforeEach(async ({ page }) => {
  await page.setViewportSize(desktopViewport);
  await page.goto('/components/tree');
});

test('server-renders the localized Tree catalogue and captures its desktop sections @visual', async ({
  page,
}) => {
  const response = await page.request.get('/components/tree');

  expect(response.ok()).toBe(true);
  const serverMarkup = await response.text();
  expect(serverMarkup).toContain('Tree');
  expect(serverMarkup).toContain('Workspace');

  await expect(page.getByRole('heading', { level: 1, name: 'Tree' })).toBeVisible();

  const defaultExample = getGroup(page, 'Default tree example');
  const defaultTree = getTree(defaultExample, 'Workspace tree');
  await expect(getTreeItem(defaultTree, 'Workspace')).toBeVisible();
  await expect(defaultTree).toHaveAttribute('data-kui-size', 'md');
  await expect(defaultTree).not.toHaveAttribute('data-kui-mobile');
  await expect(defaultExample).toHaveScreenshot('tree-default-desktop.png', {
    animations: 'disabled',
  });

  const sizes = getGroup(page, 'Tree size examples');
  for (const size of ['sm', 'md', 'lg']) {
    const sizeExample = getGroup(sizes, `Size ${size} example`);
    await expect(sizeExample.getByRole('tree')).toHaveAttribute('data-kui-size', size);
  }
  await expect(sizes).toHaveScreenshot('tree-sizes-desktop.png', { animations: 'disabled' });

  const checkable = getGroup(page, 'Checkable tree example');
  const checkableTree = getTree(checkable, 'Checkable files tree');
  await expect(getTreeItem(checkableTree, 'Project files Project files')).toHaveAttribute(
    'aria-checked',
    'mixed',
  );
  await expect(checkableTree.locator('input.kui-checkbox[aria-label="Overview"]')).toBeChecked();
  await expect(
    checkableTree.locator('input.kui-checkbox[aria-label="Archived file"]'),
  ).toBeDisabled();
  await expect(checkable).toHaveScreenshot('tree-checkable-desktop.png', {
    animations: 'disabled',
  });

  const lazy = getGroup(page, 'Lazy loading tree example');
  await expect(getTree(lazy, 'Lazy loading tree')).toBeVisible();
  await expect(lazy).toHaveScreenshot('tree-lazy-idle-desktop.png', {
    animations: 'disabled',
  });

  const mobileTargets = getGroup(page, 'Mobile target examples');
  const mobileTree = getTree(mobileTargets, 'Mobile size md tree');
  await expect(mobileTree).toHaveAttribute('data-kui-size', 'md');
  await expect(mobileTree).toHaveAttribute('data-kui-mobile', '');
  await expect(mobileTargets).toHaveScreenshot('tree-mobile-md-desktop.png', {
    animations: 'disabled',
  });
});

test('captures the real row hover state @visual', async ({ page }) => {
  const example = getGroup(page, 'Default tree example');
  const tree = getTree(example, 'Workspace tree');
  const workspace = getTreeItem(tree, 'Workspace');
  const idleBackground = await workspace.evaluate(
    (element) => getComputedStyle(element).backgroundColor,
  );

  await workspace.hover();
  expect(await workspace.evaluate((element) => element.matches(':hover'))).toBe(true);
  await expect
    .poll(() => workspace.evaluate((element) => getComputedStyle(element).backgroundColor))
    .not.toBe(idleBackground);
  await expect(example).toHaveScreenshot('tree-hover-desktop.png', {
    animations: 'disabled',
  });
});

test('uses display-tree keyboard navigation and the value model @visual', async ({ page }) => {
  const example = getGroup(page, 'Default tree example');
  const tree = getTree(example, 'Workspace tree');
  const workspace = getTreeItem(tree, 'Workspace');

  await tabTo(page, workspace);
  expect(await workspace.evaluate((element) => element.matches(':focus-visible'))).toBe(true);

  await page.keyboard.press('ArrowRight');
  await expect(workspace).toHaveAttribute('aria-expanded', 'true');
  const documents = getTreeItem(tree, 'Documents');
  await expect(documents.locator('.kui-tree-label')).toHaveText('Documents');
  await expect(documents).toBeVisible();

  await page.keyboard.press('ArrowDown');
  await expect(documents).toBeFocused();
  await page.keyboard.press('ArrowLeft');
  await expect(workspace).toBeFocused();

  await page.keyboard.press('End');
  const license = getTreeItem(tree, 'License');
  await expect(license).toBeFocused();
  await page.keyboard.press('Home');
  await expect(workspace).toBeFocused();

  await page.keyboard.press('l');
  await expect(license).toBeFocused();
  await page.keyboard.press('Home');
  await expect(workspace).toBeFocused();

  await page.keyboard.press('Enter');
  await expect(workspace).toHaveAttribute('aria-selected', 'true');
  await expect(example.getByRole('status')).toHaveText('Selected: Workspace');
  expect(await workspace.evaluate((element) => element.matches(':focus-visible'))).toBe(true);
  await expect(example).toHaveScreenshot('tree-selected-focus-visible-desktop.png', {
    animations: 'disabled',
  });

  await page.keyboard.press('Space');
  await expect(workspace).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('Space');
  await expect(workspace).toHaveAttribute('aria-expanded', 'true');
});

test('supports checkable mixed state, keyboard cascade, and a disabled leaf', async ({ page }) => {
  const example = getGroup(page, 'Checkable tree example');
  const tree = getTree(example, 'Checkable files tree');
  const parent = getTreeItem(tree, 'Project files Project files');
  const checkedLeaf = getTreeItem(tree, /Overview/);
  const openLeaf = getTreeItem(tree, /Roadmap/);
  const disabledLeaf = getTreeItem(tree, /Archived file/);
  const disabledCheckbox = tree.locator('input.kui-checkbox[aria-label="Archived file"]');
  const expansionStatus = example.getByRole('status', {
    name: 'Expanded branch status',
    exact: true,
  });

  await expect(parent).toHaveAttribute('aria-checked', 'mixed');
  await expect(parent).toHaveAttribute('aria-expanded', 'true');
  await expect(expansionStatus).toHaveText('Project files branch expanded.');
  await expect(checkedLeaf).toHaveAttribute('aria-checked', 'true');
  await expect(openLeaf).toHaveAttribute('aria-checked', 'false');
  await expect(disabledLeaf).toHaveAttribute('aria-disabled', 'true');
  await expect(disabledCheckbox).toBeDisabled();

  await tabTo(page, parent);
  await page.keyboard.press('ArrowLeft');
  await expect(parent).toHaveAttribute('aria-expanded', 'false');
  await expect(expansionStatus).toHaveText('Project files branch collapsed.');
  await page.keyboard.press('ArrowRight');
  await expect(parent).toHaveAttribute('aria-expanded', 'true');
  await expect(expansionStatus).toHaveText('Project files branch expanded.');

  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('ArrowDown');
  await expect(openLeaf).toBeFocused();
  await page.keyboard.press('Space');
  await expect(parent).toHaveAttribute('aria-checked', 'true');
  await expect(openLeaf).toHaveAttribute('aria-checked', 'true');

  await page.keyboard.press('ArrowDown');
  await expect(disabledLeaf).toBeFocused();
  await page.keyboard.press('Space');
  await expect(disabledLeaf).toHaveAttribute('aria-checked', 'false');
  await expect(disabledCheckbox).not.toBeChecked();
});

test('loads seeded lazy children once and reports the resolved state @visual', async ({ page }) => {
  const example = getGroup(page, 'Lazy loading tree example');
  const tree = getTree(example, 'Lazy loading tree');
  const folder = getTreeItem(tree, 'Loaded on demand');
  const clockStart = new Date('2026-01-01T00:00:00.000Z');
  await page.clock.install({ time: clockStart });

  await expect(folder).toHaveAttribute('aria-expanded', 'false');
  await tabTo(page, folder);
  await page.keyboard.press('ArrowRight');
  const loadingStatus = tree.getByRole('status', { name: 'Loading', exact: true });
  await expect(loadingStatus).toBeVisible();
  const pauseTime = await page.evaluate(() => Date.now() + 20);
  await page.clock.pauseAt(new Date(pauseTime));
  await expect(example).toHaveScreenshot('tree-lazy-loading-desktop.png', {
    animations: 'disabled',
  });
  await page.clock.runFor(120);
  const firstLoadedChild = getTreeItem(tree, 'Generated report');
  await expect(firstLoadedChild).toBeVisible();
  await expect(firstLoadedChild.locator('.kui-tree-label')).toHaveText('Generated report');
  const secondLoadedChild = getTreeItem(tree, 'Release notes');
  await expect(secondLoadedChild).toBeVisible();
  await expect(secondLoadedChild.locator('.kui-tree-label')).toHaveText('Release notes');
  await expect(folder).toHaveAttribute('aria-expanded', 'true');
  await expect(example.getByRole('status', { name: 'Lazy loading status' })).toHaveText(
    'Children loaded.',
  );
  await expect(example).toHaveScreenshot('tree-lazy-loaded-desktop.png', {
    animations: 'disabled',
  });

  await page.clock.resume();
  await page.keyboard.press('ArrowLeft');
  await expect(folder).toHaveAttribute('aria-expanded', 'false');
  await page.keyboard.press('ArrowRight');
  await expect(tree.getByRole('status', { name: 'Loading', exact: true })).toHaveCount(0);
  await expect(firstLoadedChild).toBeVisible();
});

test('keeps the documented medium mobile toggle target at 44px', async ({ page }) => {
  const example = getGroup(page, 'Mobile target examples');
  const tree = getTree(example, 'Mobile size md tree');
  const workspace = getTreeItem(tree, 'Workspace');
  const toggle = workspace.locator('button[aria-hidden="true"]');

  const rowHeight = await workspace.evaluate((element) => element.getBoundingClientRect().height);
  const toggleSize = await toggle.evaluate((element) => {
    const bounds = element.getBoundingClientRect();

    return { width: bounds.width, height: bounds.height };
  });

  expect(rowHeight).toBe(44);
  expect(toggleSize).toEqual({ width: 44, height: 44 });
});

test('shows localized labels and the translated loading name in Russian', async ({ page }) => {
  const kui = await loadKuiCatalogue(page, 'ru');
  const localeResponse = await page.request.get('/i18n/tree/ru.json');
  expect(localeResponse.ok()).toBe(true);
  const russian = (await localeResponse.json()) as {
    title: string;
    accessibility: {
      default: string;
      defaultTree: string;
      checkable: string;
      checkableTree: string;
      lazy: string;
      lazyTree: string;
      lazyStatus: string;
      expansionStatus: string;
    };
    nodes: { workspace: string; checkGroup: string; lazyFolder: string; lazyChildOne: string };
    status: { lazyLoaded: string; checkGroupExpanded: string; checkGroupCollapsed: string };
  };

  await page
    .getByRole('banner')
    .getByRole('button', { name: 'Switch language to Russian', exact: true })
    .click();

  await expect(page.getByRole('heading', { level: 1, name: russian.title })).toBeVisible();
  const defaultExample = getGroup(page, russian.accessibility.default);
  const defaultTree = getTree(defaultExample, russian.accessibility.defaultTree);
  const workspace = getTreeItem(defaultTree, russian.nodes.workspace);
  await expect(workspace.locator('.kui-tree-label')).toHaveText(russian.nodes.workspace);

  const checkableExample = getGroup(page, russian.accessibility.checkable);
  const checkableTree = getTree(checkableExample, russian.accessibility.checkableTree);
  const checkGroup = getTreeItem(checkableTree, new RegExp(russian.nodes.checkGroup));
  const expansionStatus = checkableExample.getByRole('status', {
    name: russian.accessibility.expansionStatus,
    exact: true,
  });
  await expect(expansionStatus).toHaveText(russian.status.checkGroupExpanded);
  await tabTo(page, checkGroup);
  await page.keyboard.press('ArrowLeft');
  await expect(expansionStatus).toHaveText(russian.status.checkGroupCollapsed);
  await page.keyboard.press('ArrowRight');
  await expect(expansionStatus).toHaveText(russian.status.checkGroupExpanded);

  const lazyExample = getGroup(page, russian.accessibility.lazy);
  const lazyTree = getTree(lazyExample, russian.accessibility.lazyTree);
  const lazyFolder = getTreeItem(lazyTree, russian.nodes.lazyFolder);
  await expect(lazyFolder.locator('.kui-tree-label')).toHaveText(russian.nodes.lazyFolder);
  await page.clock.install();
  await tabTo(page, lazyFolder);
  await page.keyboard.press('ArrowRight');
  await expect(
    lazyTree.getByRole('status', { name: kuiMessage(kui, 'common', 'loading'), exact: true }),
  ).toBeVisible();
  await page.clock.fastForward(120);
  await expect(getTreeItem(lazyTree, russian.nodes.lazyChildOne)).toBeVisible();
  await expect(
    lazyExample.getByRole('status', { name: russian.accessibility.lazyStatus }),
  ).toHaveText(russian.status.lazyLoaded);
});

test('keeps the named Tree catalogue within tablet and 320px layouts @visual', async ({ page }) => {
  for (const viewport of [
    { width: 768, height: 1024, name: 'tablet-768' },
    { ...mobileViewport, name: 'mobile-320' },
  ]) {
    await page.setViewportSize(viewport);
    await collapseMobileNavigation(page);
    await expectNoHorizontalOverflow(page);
    await expect(page.getByRole('heading', { level: 1, name: 'Tree' })).toBeVisible();

    const sizes = getGroup(page, 'Tree size examples');
    await expect(sizes).toHaveScreenshot(`tree-sizes-${viewport.name}.png`, {
      animations: 'disabled',
    });

    const checkable = getGroup(page, 'Checkable tree example');
    await expect(checkable).toHaveScreenshot(`tree-checkable-${viewport.name}.png`, {
      animations: 'disabled',
    });

    const mobileTargets = getGroup(page, 'Mobile target examples');
    await expect(mobileTargets).toHaveScreenshot(`tree-mobile-md-${viewport.name}.png`, {
      animations: 'disabled',
    });
  }
});

function getGroup(container: Page | Locator, accessibleName: string): Locator {
  return container.getByRole('group', { name: accessibleName, exact: true });
}

function getTree(container: Page | Locator, accessibleName: string): Locator {
  return container.getByRole('tree', { name: accessibleName, exact: true });
}

function getTreeItem(tree: Locator, accessibleName: string | RegExp): Locator {
  if (typeof accessibleName === 'string') {
    return tree.getByRole('treeitem', { name: accessibleName, exact: true });
  }

  return tree.getByRole('treeitem', { name: accessibleName });
}

async function tabTo(page: Page, target: Locator): Promise<void> {
  for (let attempt = 0; attempt < 200; attempt += 1) {
    if (await target.evaluate((element) => element === document.activeElement)) return;

    await page.keyboard.press('Tab');
  }

  throw new Error('Keyboard navigation did not reach the named Tree item.');
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

  await navigation
    .getByRole('button', { name: 'Data and identity', exact: true })
    .scrollIntoViewIfNeeded();
}

async function expectNoHorizontalOverflow(page: Page): Promise<void> {
  await expect
    .poll(() => page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth))
    .toBe(true);
}
