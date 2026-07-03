import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));

const failures = [];

const ignoredDirs = new Set([
  '.angular',
  '.git',
  '.idea',
  '.local-notes',
  '.playwright-cli',
  '.playwright-mcp',
  '.pnpm-store',
  '.vscode',
  'dist',
  'node_modules',
  'output',
]);

const trackedRoots = ['AGENTS.md', 'angular.json', 'docs', 'package.json', 'projects', 'scripts'];
const textExtensions = new Set(['.css', '.html', '.json', '.md', '.mjs', '.scss', '.ts', '.txt']);

const routeCoverageExclusions = new Set(['/tokens', '/theme', '/forms']);

runCheck('tracked text has no Cyrillic characters', checkNoCyrillic);
runCheck('all public style files are imported by kikita-ui.css', checkStyleImports);
runCheck('playground primitive routes are listed in state coverage', checkRouteCoverage);

if (failures.length > 0) {
  console.error('\nStatic audit failed:\n');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log('Static audit passed.');
}

function runCheck(name, check) {
  try {
    check();
  } catch (error) {
    failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function checkNoCyrillic() {
  for (const file of collectTextFiles(trackedRoots.map((entry) => join(root, entry)))) {
    const text = readFileSync(file, 'utf8');
    const match = /[\u0401\u0410-\u044f\u0451]/u.exec(text);

    if (match) {
      failures.push(`${toRepoPath(file)} contains Cyrillic text near index ${match.index}`);
    }
  }
}

function checkStyleImports() {
  const stylesDir = join(root, 'projects/ui/src/styles');
  const entrypoint = readFileSync(join(stylesDir, 'kikita-ui.css'), 'utf8');
  const styleFiles = readdirSync(stylesDir)
    .filter((file) => file.endsWith('.css') && file !== 'kikita-ui.css')
    .sort();

  for (const file of styleFiles) {
    const importLine = `@import './${file}';`;

    if (!entrypoint.includes(importLine)) {
      failures.push(`projects/ui/src/styles/${file} is not imported by kikita-ui.css`);
    }
  }
}

function checkRouteCoverage() {
  const appSource = readFileSync(join(root, 'projects/playground/src/app/app.ts'), 'utf8');
  const stateCoverage = readFileSync(join(root, 'docs/state-coverage.md'), 'utf8');
  const routeMatches = [...appSource.matchAll(/\{\s*path:\s*'([^']+)'/g)];
  const routes = routeMatches.map((match) => match[1]).filter((route) => route.startsWith('/'));

  for (const route of routes) {
    if (routeCoverageExclusions.has(route)) {
      continue;
    }

    if (!stateCoverage.includes(`| \`${route}\``) && !stateCoverage.includes(`| ${route}`)) {
      failures.push(`${route} is missing from docs/state-coverage.md`);
    }
  }
}

function collectTextFiles(entries) {
  const files = [];

  for (const entry of entries) {
    if (!exists(entry)) {
      continue;
    }

    const stats = statSync(entry);

    if (stats.isDirectory()) {
      const name = entry.split(/[\\/]/).at(-1);

      if (ignoredDirs.has(name)) {
        continue;
      }

      for (const child of readdirSync(entry)) {
        files.push(...collectTextFiles([join(entry, child)]));
      }

      continue;
    }

    if (isTextFile(entry)) {
      files.push(entry);
    }
  }

  return files;
}

function exists(path) {
  try {
    statSync(path);
    return true;
  } catch {
    return false;
  }
}

function isTextFile(file) {
  return textExtensions.has(file.slice(file.lastIndexOf('.')));
}

function toRepoPath(file) {
  return relative(root, file).replaceAll('\\', '/');
}
