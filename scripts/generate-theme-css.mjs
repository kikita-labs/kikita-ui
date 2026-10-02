import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import prettier from 'prettier';
import ts from 'typescript';

const defaultRoot = fileURLToPath(new URL('..', import.meta.url));
const themeDirectory = 'projects/ui/src/lib/theme';
const themeModules = ['create-kui-theme', 'default-kui-theme.const', 'kui-theme-color-math'];

export const defaultThemeCssPath = 'projects/ui/src/styles/theme-default.css';

/** Transpiles the value modules of the theme generator and imports them, without a library build. */
async function loadThemeGenerator(root) {
  const directory = mkdtempSync(join(tmpdir(), 'kui-theme-'));

  try {
    for (const name of themeModules) {
      const source = readFileSync(join(root, themeDirectory, `${name}.ts`), 'utf8');
      const { outputText } = ts.transpileModule(source, {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      });

      writeFileSync(
        join(directory, `${name}.mjs`),
        outputText.replace(/from '(\.\/[^']+)'/gu, "from '$1.mjs'"),
      );
    }

    return await import(pathToFileURL(join(directory, 'create-kui-theme.mjs')).href).then(
      async (generator) => ({
        ...generator,
        ...(await import(pathToFileURL(join(directory, 'default-kui-theme.const.mjs')).href)),
      }),
    );
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

/** The theme of the default seeds as a style sheet, formatted like the rest of the repository. */
export async function renderDefaultThemeCss(root = defaultRoot) {
  const { createKuiTheme, createKuiThemeStyleSheet, DEFAULT_KUI_THEME } =
    await loadThemeGenerator(root);
  const stylesheet = createKuiThemeStyleSheet(createKuiTheme(DEFAULT_KUI_THEME));
  const source = [
    '/* stylelint-disable */',
    '/* Generated from DEFAULT_KUI_THEME by scripts/generate-theme-css.mjs. Do not edit; run',
    '   `pnpm generate:theme-css`. The default theme works from this file alone; provideKikitaUi()',
    '   adds the theme of custom seeds on top of it. */',
    stylesheet,
    '',
  ].join('\n');
  const options = await prettier.resolveConfig(join(root, defaultThemeCssPath));

  return prettier.format(source, { ...options, parser: 'css' });
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const target = join(defaultRoot, defaultThemeCssPath);
  const expected = await renderDefaultThemeCss();

  if (process.argv.includes('--check')) {
    const current = readFileSync(target, 'utf8');

    if (current !== expected) {
      console.error(`${defaultThemeCssPath} is stale; run pnpm generate:theme-css.`);
      process.exitCode = 1;
    }
  } else {
    writeFileSync(target, expected);
    console.log(`Wrote ${defaultThemeCssPath}.`);
  }
}
