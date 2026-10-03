import { execFile } from 'node:child_process';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

import { librarySources } from '../tools/library-build-sources.mjs';
import { checkBuildFreshness } from './assert-fresh-build.mjs';

const run = promisify(execFile);
const defaultRoot = fileURLToPath(new URL('..', import.meta.url));
const budgetsPath = 'scripts/bundle-budgets.json';
const fesmPath = 'dist/ui/fesm2022/kikita-labs-ui.mjs';

/**
 * Per-export bundle cost of the built library.
 *
 * Every runtime export is imported alone into an empty Angular application, built with the real
 * application builder (`optimization: true`), and the bytes of Kikita code in the output are read
 * from the build stats. That is the cost a consumer pays for using that one export, including
 * everything it pulls in. Run it against a fresh `dist/ui` (`pnpm build`).
 */

/** Runtime export names of the flat FESM bundle. */
export function listRuntimeExports(fesmText) {
  const start = fesmText.lastIndexOf('export {');
  const end = fesmText.indexOf('}', start);
  if (start < 0 || end < 0) throw new Error('No export list found in the FESM bundle.');

  return fesmText
    .slice(start + 'export {'.length, end)
    .split(',')
    .map((entry) =>
      entry
        .trim()
        .split(/\s+as\s+/)
        .pop(),
    )
    .filter(Boolean);
}

/**
 * Bytes of Kikita code a page loads up front: the `main.js` output plus every chunk it imports
 * statically. A lazily imported chunk is not counted, because an application only pays for it when
 * the code runs.
 */
export function kikitaBytes(stats) {
  const outputs = stats.outputs ?? {};
  const mainName = Object.keys(outputs).find((name) => name.endsWith('main.js'));
  if (!mainName) throw new Error('The build stats have no main.js output.');

  const initial = new Set();
  const queue = [mainName];
  while (queue.length > 0) {
    const name = queue.shift();
    if (initial.has(name) || !outputs[name]) continue;
    initial.add(name);
    for (const imported of outputs[name].imports ?? []) {
      if (imported.kind === 'import-statement') queue.push(imported.path);
    }
  }

  let bytes = 0;
  const inputs = [];
  for (const name of initial) {
    for (const [input, detail] of Object.entries(outputs[name].inputs ?? {})) {
      inputs.push(input);
      if (input.includes('kikita-labs-ui')) bytes += detail.bytesInOutput;
    }
  }
  if (bytes === 0) {
    throw new Error(
      `No Kikita code reached the initial chunks; the library file names may have changed. Inputs: ${inputs.slice(0, 12).join(', ')}`,
    );
  }
  return bytes;
}

/**
 * Compares measured sizes with the committed budgets.
 *
 * `limitBytes` is the enforced ceiling (a ratchet that only moves down as slices land);
 * `targetBytes` is the goal and is only reported.
 */
export function evaluateBudgets(measured, budgets) {
  const failures = [];
  const notes = [];

  for (const [name, bytes] of Object.entries(measured)) {
    const budget = budgets.exports?.[name];
    if (!budget) {
      failures.push(`${name} has no budget; run \`pnpm audit:bundle --write-baseline\``);
      continue;
    }
    if (bytes > budget.limitBytes) {
      failures.push(
        `${name} is ${formatKb(bytes)} kB, over its limit of ${formatKb(budget.limitBytes)} kB`,
      );
    } else if (bytes < budget.limitBytes * 0.95) {
      notes.push(
        `${name} is ${formatKb(bytes)} kB, below its limit of ${formatKb(budget.limitBytes)} kB: ratchet it down`,
      );
    }
    if (budget.targetBytes && bytes > budget.targetBytes) {
      notes.push(
        `${name} is ${formatKb(bytes)} kB, above its target of ${formatKb(budget.targetBytes)} kB`,
      );
    }
  }

  return { failures, notes };
}

/** New budgets from a measurement: limits only move down unless `allowIncrease` is set. */
export function ratchetBudgets(measured, budgets, { allowIncrease = false } = {}) {
  const tolerance = 1 + (budgets.tolerancePercent ?? 3) / 100;
  const next = { ...budgets, exports: { ...budgets.exports } };

  for (const [name, bytes] of Object.entries(measured)) {
    const limit = Math.ceil((bytes * tolerance) / 16) * 16;
    const current = next.exports[name];
    next.exports[name] = {
      ...current,
      baselineBytes: bytes,
      limitBytes: current && !allowIncrease ? Math.min(current.limitBytes, limit) : limit,
    };
  }

  return next;
}

function formatKb(bytes) {
  return (bytes / 1024).toFixed(1);
}

async function measureExports(root, names, parallel) {
  const results = {};
  const queue = [...names];
  const workers = Array.from({ length: Math.min(parallel, names.length) }, () =>
    createWorkspace(root),
  );

  try {
    await Promise.all(
      workers.map(async (workspace) => {
        while (queue.length > 0) {
          const name = queue.shift();
          results[name] = await buildOne(root, workspace, name);
          console.log(`${formatKb(results[name]).padStart(7)} kB  ${name}`);
        }
      }),
    );
  } finally {
    for (const workspace of workers) removeWorkspace(workspace);
  }

  return results;
}

function createWorkspace(root) {
  const dir = mkdtempSync(join(tmpdir(), 'kui-bundle-'));
  const library = join(root, 'dist/ui').replaceAll('\\', '/');

  mkdirSync(join(dir, 'src'));
  writeFileSync(
    join(dir, 'angular.json'),
    JSON.stringify({
      version: 1,
      cli: { analytics: false },
      projects: {
        app: {
          projectType: 'application',
          root: '',
          sourceRoot: 'src',
          architect: {
            build: {
              builder: '@angular/build:application',
              options: {
                browser: 'src/main.ts',
                tsConfig: 'tsconfig.json',
                outputPath: 'dist',
                aot: true,
                optimization: true,
                outputHashing: 'none',
              },
            },
          },
        },
      },
    }),
  );
  writeFileSync(
    join(dir, 'tsconfig.json'),
    JSON.stringify({
      compilerOptions: {
        strict: true,
        target: 'ES2022',
        module: 'preserve',
        moduleResolution: 'bundler',
        skipLibCheck: true,
        paths: { '@kikita-labs/ui': [library] },
      },
      files: ['src/main.ts'],
    }),
  );
  writeFileSync(
    join(dir, 'src/index.html'),
    '<!doctype html><html><body><app-root></app-root></body></html>\n',
  );
  symlinkSync(join(root, 'node_modules'), join(dir, 'node_modules'), 'junction');

  return dir;
}

function removeWorkspace(dir) {
  const link = join(dir, 'node_modules');

  // Remove the link first and check it is gone: a recursive delete must never follow it into the
  // repository's node_modules.
  rmSync(link, { force: true });
  if (existsSync(link) || safeLstat(link)) {
    console.warn(`Left ${dir} in place: could not remove its node_modules link.`);
    return;
  }
  rmSync(dir, { recursive: true, force: true });
}

function safeLstat(path) {
  try {
    return lstatSync(path);
  } catch {
    return null;
  }
}

async function buildOne(root, workspace, name) {
  writeFileSync(
    join(workspace, 'src/main.ts'),
    `import { ${name} } from '@kikita-labs/ui';\n(globalThis as any).__x = ${name};\n`,
  );
  rmSync(join(workspace, 'dist'), { recursive: true, force: true });

  try {
    await run(
      process.execPath,
      [join(root, 'node_modules/@angular/cli/bin/ng.js'), 'build', '--stats-json'],
      { cwd: workspace, maxBuffer: 64 * 1024 * 1024 },
    );
  } catch (error) {
    throw new Error(`The build for ${name} failed:\n${error.stdout ?? ''}${error.stderr ?? ''}`);
  }

  return kikitaBytes(JSON.parse(readFileSync(join(workspace, 'dist/stats.json'), 'utf8')));
}

function parseArguments(argv) {
  const options = {
    all: false,
    names: null,
    writeBaseline: false,
    allowIncrease: false,
    parallel: 3,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--all') options.all = true;
    else if (argument === '--write-baseline') options.writeBaseline = true;
    else if (argument === '--allow-increase') options.allowIncrease = true;
    else if (argument === '--export') options.names = argv[++index].split(',');
    else if (argument === '--parallel') options.parallel = Number(argv[++index]);
    else throw new Error(`Unknown argument ${argument}`);
  }

  return options;
}

async function main() {
  const root = defaultRoot;
  const options = parseArguments(process.argv.slice(2));
  const freshness = checkBuildFreshness({
    name: 'Library',
    outputs: [fesmPath],
    sources: librarySources,
    buildCommand: 'pnpm build',
    root,
  });
  if (freshness.stale) throw new Error(freshness.message);

  const budgets = JSON.parse(readFileSync(join(root, budgetsPath), 'utf8'));
  const allNames = listRuntimeExports(readFileSync(join(root, fesmPath), 'utf8'));
  const names =
    options.names ?? (options.all || options.writeBaseline ? allNames : budgets.gateExports);

  for (const name of names) {
    if (!allNames.includes(name)) throw new Error(`${name} is not a runtime export of dist/ui.`);
  }

  const measured = await measureExports(root, names, options.parallel);

  mkdirSync(join(root, 'output'), { recursive: true });
  writeFileSync(
    join(root, 'output/bundle-sweep.csv'),
    `export,kikita_bytes\n${Object.entries(measured)
      .sort((a, b) => b[1] - a[1])
      .map(([name, bytes]) => `${name},${bytes}`)
      .join('\n')}\n`,
  );

  if (options.writeBaseline) {
    const next = ratchetBudgets(measured, budgets, { allowIncrease: options.allowIncrease });
    writeFileSync(join(root, budgetsPath), `${JSON.stringify(next, null, 2)}\n`);
    console.log(`Updated ${budgetsPath} for ${names.length} export(s).`);
    return;
  }

  const { failures, notes } = evaluateBudgets(measured, budgets);
  for (const note of notes) console.log(`note: ${note}`);
  if (failures.length > 0) {
    console.error(`Bundle audit failed:\n${failures.map((failure) => `- ${failure}`).join('\n')}`);
    process.exit(1);
  }
  console.log(`Bundle audit passed for ${names.length} export(s).`);
}

function isMain() {
  return (
    process.argv[1] &&
    process.argv[1].replaceAll('\\', '/') === fileURLToPath(import.meta.url).replaceAll('\\', '/')
  );
}

if (isMain()) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
