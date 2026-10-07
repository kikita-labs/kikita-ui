import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

import prettier from 'prettier';
import ts from 'typescript';

const defaultRoot = fileURLToPath(new URL('..', import.meta.url));
const libDirectory = 'projects/ui/src/lib';
const themeEntries = ['theme/create-kui-theme.ts', 'theme/default-kui-theme.const.ts'];

export const defaultThemeCssPath = 'projects/ui/src/styles/theme-default.css';

/** Resolves a relative import of a library file to the `.ts` file it names. */
function resolveSource(from, specifier) {
  const base = join(dirname(from), specifier);

  for (const candidate of [`${base}.ts`, join(base, 'index.ts')]) {
    if (existsSync(candidate)) return candidate;
  }

  throw new Error(`Cannot resolve "${specifier}" imported by ${from}`);
}

/**
 * Transpiles the theme generator and every library module it reaches at runtime, keeping their
 * folder layout, and imports the result, without a library build.
 */
async function loadThemeGenerator(root) {
  const lib = join(root, libDirectory);
  const directory = mkdtempSync(join(tmpdir(), 'kui-theme-'));
  const queue = themeEntries.map((entry) => join(lib, entry));
  const done = new Set();

  try {
    while (queue.length > 0) {
      const file = queue.shift();

      if (done.has(file)) continue;
      done.add(file);

      const { outputText } = ts.transpileModule(readFileSync(file, 'utf8'), {
        compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      });
      const output = join(directory, relative(lib, file).replace(/\.ts$/u, '.mjs'));

      mkdirSync(dirname(output), { recursive: true });
      writeFileSync(
        output,
        outputText.replace(/from '(\.\.?\/[^']+)'/gu, (_match, specifier) => {
          const source = resolveSource(file, specifier);

          queue.push(source);

          const target = join(directory, relative(lib, source).replace(/\.ts$/u, '.mjs'));
          const path = relative(dirname(output), target).replaceAll(String.fromCharCode(92), '/');

          return `from '${path.startsWith('.') ? path : `./${path}`}'`;
        }),
      );
    }

    const load = (entry) =>
      import(pathToFileURL(join(directory, entry.replace(/\.ts$/u, '.mjs'))).href);

    return { ...(await load(themeEntries[0])), ...(await load(themeEntries[1])) };
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
