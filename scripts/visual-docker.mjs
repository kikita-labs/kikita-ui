import { spawnSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * Screenshot suites that run in the pinned Playwright Docker image, keyed by the name accepted on
 * the command line. Each suite builds the app it screenshots before running.
 */
export const visualSuites = {
  playground: {
    build: 'pnpm run build:kikita-ui-playground',
    test: 'pnpm exec playwright test --config=playwright.kikita-ui-playground.config.ts --project=visual',
  },
  library: {
    build: 'pnpm run build:playground',
    test: 'pnpm exec playwright test --project=visual',
  },
};

/** Returns the installed `@playwright/test` version, which decides the Docker image tag. */
export function readPlaywrightVersion(root = repoRoot) {
  const manifest = JSON.parse(
    readFileSync(resolve(root, 'node_modules/@playwright/test/package.json'), 'utf8'),
  );

  return manifest.version;
}

/** Returns the official Playwright image whose browsers and fonts match the given version. */
export function playwrightImage(version) {
  return `mcr.microsoft.com/playwright:v${version}-noble`;
}

/**
 * Builds the `docker run` arguments for one visual suite. Linux-only directories (dependencies,
 * build output, caches) live in named volumes so the container never overwrites the host copies.
 */
export function buildDockerArgs({ suite, update, version, root = repoRoot }) {
  const definition = visualSuites[suite];
  if (!definition) {
    throw new Error(
      `Unknown visual suite "${suite}". Use one of: ${Object.keys(visualSuites).join(', ')}.`,
    );
  }

  const test = update ? `${definition.test} --update-snapshots` : definition.test;
  const script = [
    'corepack enable',
    'pnpm config set store-dir /pnpm-store',
    'pnpm install --frozen-lockfile',
    definition.build,
    test,
  ].join(' && ');

  return [
    'run',
    '--rm',
    '--ipc=host',
    '-e',
    'HUSKY=0',
    '-v',
    `${root}:/work`,
    '-v',
    'kikita-ui-node-modules:/work/node_modules',
    '-v',
    'kikita-ui-lib-node-modules:/work/projects/ui/node_modules',
    '-v',
    'kikita-ui-dist:/work/dist',
    '-v',
    'kikita-ui-angular-cache:/work/.angular',
    '-v',
    'kikita-ui-pnpm-store:/pnpm-store',
    '-w',
    '/work',
    playwrightImage(version),
    'bash',
    '-c',
    script,
  ];
}

function main(argv) {
  const [suite, ...flags] = argv;
  const update = flags.includes('--update');
  const args = buildDockerArgs({ suite, update, version: readPlaywrightVersion() });
  const result = spawnSync('docker', args, { stdio: 'inherit' });

  process.exit(result.status ?? 1);
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }
}
