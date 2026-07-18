import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const defaultRoot = fileURLToPath(new URL('..', import.meta.url));

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
  'test-results',
  'playwright-report',
]);

const trackedRoots = [
  'AGENTS.md',
  '.agents',
  'angular.json',
  'docs',
  'package.json',
  'playwright.config.ts',
  'projects',
  'scripts',
  'tests',
];
const textExtensions = new Set([
  '.css',
  '.html',
  '.json',
  '.md',
  '.mjs',
  '.scss',
  '.ts',
  '.txt',
  '.yaml',
  '.yml',
]);
const routeCoverageExclusions = new Set(['/tokens', '/theme', '/forms']);
const disallowedTopLevelGlobals =
  /(?:=\s*(window|document|navigator|localStorage|sessionStorage)\b|\b(window|document|navigator|localStorage|sessionStorage)\.)/;

if (isMain()) {
  const failures = runStaticAudit(defaultRoot);

  if (failures.length > 0) {
    console.error('\nStatic audit failed:\n');
    for (const failure of failures) {
      console.error(`- ${failure}`);
    }
    process.exitCode = 1;
  } else {
    console.log('Static audit passed.');
  }
}

export function runStaticAudit(root = defaultRoot) {
  const failures = [];
  runCheck(failures, 'tracked text has no Cyrillic characters', () => checkNoCyrillic(root));
  runCheck(failures, 'all public style files are imported by kikita-ui.css', () =>
    checkStyleImports(root),
  );
  runCheck(failures, 'playground primitive routes are listed in state coverage', () =>
    checkRouteCoverage(root),
  );
  runCheck(failures, 'agent and docs links point at tracked files', () => checkTrackedLinks(root));
  runCheck(failures, 'repo skills are valid', () => checkSkills(root));
  runCheck(failures, 'public component docs exist', () => checkComponentDocs(root));
  runCheck(failures, 'public component folders have unit tests', () => checkComponentSpecs(root));
  runCheck(failures, 'public barrels do not export internal context tokens', () =>
    checkPublicBarrelContextExports(root),
  );
  runCheck(failures, 'library internals do not import the public package barrel', () =>
    checkLibraryInternalPackageImports(root),
  );
  runCheck(failures, 'public exports have nearby JSDoc', () => checkPublicJSDoc(root));
  runCheck(failures, 'library files avoid top-level browser globals', () =>
    checkTopLevelBrowserGlobals(root),
  );
  return failures;
}

function runCheck(failures, name, check) {
  try {
    const result = check();

    if (Array.isArray(result)) {
      failures.push(...result);
    }
  } catch (error) {
    failures.push(`${name}: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function checkNoCyrillic(root) {
  const failures = [];

  for (const file of collectTextFiles(
    root,
    trackedRoots.map((entry) => join(root, entry)),
  )) {
    const text = readFileSync(file, 'utf8');
    const match = /[\u0401\u0410-\u044f\u0451]/u.exec(text);

    if (match) {
      failures.push(`${toRepoPath(root, file)} contains Cyrillic text near index ${match.index}`);
    }
  }

  return failures;
}

function checkStyleImports(root) {
  const failures = [];
  const stylesDir = join(root, 'projects/ui/src/styles');

  if (!existsSync(stylesDir)) {
    return failures;
  }

  const entrypointPath = join(stylesDir, 'kikita-ui.css');
  const entrypoint = readFileSync(entrypointPath, 'utf8');
  const styleFiles = readdirSync(stylesDir)
    .filter((file) => file.endsWith('.css') && file !== 'kikita-ui.css')
    .sort();

  for (const file of styleFiles) {
    const importLine = `@import './${file}';`;

    if (!entrypoint.includes(importLine)) {
      failures.push(`projects/ui/src/styles/${file} is not imported by kikita-ui.css`);
    }
  }

  return failures;
}

function checkRouteCoverage(root) {
  const appPath = join(root, 'projects/playground/src/app/app.ts');
  const coveragePath = join(root, 'docs/state-coverage.md');

  if (!existsSync(appPath) || !existsSync(coveragePath)) {
    return [];
  }

  const failures = [];
  const appSource = readFileSync(appPath, 'utf8');
  const stateCoverage = readFileSync(coveragePath, 'utf8');
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

  return failures;
}

function checkTrackedLinks(root) {
  const failures = [];
  const files = collectTextFiles(root, [
    join(root, 'AGENTS.md'),
    join(root, '.agents'),
    join(root, 'docs'),
  ]).filter((file) => file.endsWith('.md'));
  const markdownLinkPattern = /\]\(([^)#][^)]+)\)/g;
  const inlinePathPattern = /`((?:\.agents|docs|projects|scripts)\/[^`]+)`/g;

  for (const file of files) {
    const text = readFileSync(file, 'utf8');
    const candidates = [];

    for (const match of text.matchAll(markdownLinkPattern)) {
      candidates.push(match[1]);
    }

    for (const match of text.matchAll(inlinePathPattern)) {
      candidates.push(match[1]);
    }

    for (const candidate of candidates) {
      if (candidate.startsWith('http') || candidate.startsWith('mailto:')) {
        continue;
      }

      const clean = candidate.split('#')[0].replaceAll('\\', '/');

      if (clean.length === 0 || clean.includes('*') || clean.includes('<')) {
        continue;
      }

      const target =
        clean.startsWith('.agents/') ||
        clean.startsWith('docs/') ||
        clean.startsWith('projects/') ||
        clean.startsWith('scripts/')
          ? join(root, clean)
          : join(file, '..', clean);

      if (!existsSync(target)) {
        failures.push(`${toRepoPath(root, file)} links to missing ${candidate}`);
      }
    }
  }

  return failures;
}

function checkSkills(root) {
  const failures = [];
  const skillsDir = join(root, '.agents/skills');

  if (!existsSync(skillsDir)) {
    failures.push('.agents/skills is missing');
    return failures;
  }

  const skills = readdirSync(skillsDir)
    .filter((entry) => statSync(join(skillsDir, entry)).isDirectory())
    .sort();

  for (const skill of skills) {
    if (!/^[a-z0-9-]+$/.test(skill)) {
      failures.push(`.agents/skills/${skill} is not lowercase hyphen-case`);
      continue;
    }

    const skillPath = join(skillsDir, skill, 'SKILL.md');
    if (!existsSync(skillPath)) {
      failures.push(`.agents/skills/${skill}/SKILL.md is missing`);
      continue;
    }

    const text = readFileSync(skillPath, 'utf8');
    const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text);

    if (!frontmatter) {
      failures.push(`.agents/skills/${skill}/SKILL.md has no YAML frontmatter`);
      continue;
    }

    const lines = frontmatter[1].split(/\r?\n/);
    const keys = lines.map((line) => line.split(':')[0]).filter(Boolean);

    if (!lines.includes(`name: ${skill}`)) {
      failures.push(`.agents/skills/${skill}/SKILL.md name does not match folder`);
    }

    if (!keys.includes('description')) {
      failures.push(`.agents/skills/${skill}/SKILL.md description is missing`);
    }

    for (const key of keys) {
      if (key !== 'name' && key !== 'description') {
        failures.push(`.agents/skills/${skill}/SKILL.md frontmatter has unsupported key ${key}`);
      }
    }
  }

  return failures;
}

function checkComponentDocs(root) {
  const failures = [];
  const componentsDir = join(root, 'projects/ui/src/lib/components');

  if (!existsSync(componentsDir)) {
    return failures;
  }

  const primitives = readdirSync(componentsDir)
    .filter((entry) => statSync(join(componentsDir, entry)).isDirectory())
    .sort();

  for (const primitive of primitives) {
    if (!existsSync(join(root, 'docs', `${primitive}.md`))) {
      failures.push(`docs/${primitive}.md is missing for public primitive ${primitive}`);
    }
  }

  return failures;
}

function checkComponentSpecs(root) {
  const failures = [];
  const componentsDir = join(root, 'projects/ui/src/lib/components');

  if (!existsSync(componentsDir)) {
    return failures;
  }

  const primitives = readdirSync(componentsDir)
    .filter((entry) => statSync(join(componentsDir, entry)).isDirectory())
    .sort();

  for (const primitive of primitives) {
    const primitiveDir = join(componentsDir, primitive);
    const hasSpec = collectTextFiles(root, [primitiveDir]).some((file) =>
      file.endsWith('.spec.ts'),
    );

    if (!hasSpec) {
      failures.push(`projects/ui/src/lib/components/${primitive} has no unit spec`);
    }
  }

  return failures;
}

function checkPublicBarrelContextExports(root) {
  const failures = [];
  const componentsDir = join(root, 'projects/ui/src/lib/components');
  const allowedPublicContextPrimitives = new Set(['dialog', 'drawer']);

  if (!existsSync(componentsDir)) {
    return failures;
  }

  const primitives = readdirSync(componentsDir)
    .filter((entry) => statSync(join(componentsDir, entry)).isDirectory())
    .sort();

  for (const primitive of primitives) {
    if (allowedPublicContextPrimitives.has(primitive)) {
      continue;
    }

    const indexPath = join(componentsDir, primitive, 'index.ts');

    if (!existsSync(indexPath)) {
      continue;
    }

    const text = readFileSync(indexPath, 'utf8');

    if (/KUI_[A-Z0-9_]*(?:_CONTEXT|_CTX)\b/.test(text)) {
      failures.push(
        `projects/ui/src/lib/components/${primitive}/index.ts exports an internal context token`,
      );
    }

    if (/Kui[A-Za-z0-9]*Context\b/.test(text) && text.includes('context.token')) {
      failures.push(
        `projects/ui/src/lib/components/${primitive}/index.ts exports an internal context type`,
      );
    }
  }

  return failures;
}

function checkLibraryInternalPackageImports(root) {
  const failures = [];
  const libDir = join(root, 'projects/ui/src/lib');

  if (!existsSync(libDir)) {
    return failures;
  }

  const files = collectTextFiles(root, [libDir]).filter(
    (file) => file.endsWith('.ts') && !file.endsWith('.spec.ts'),
  );
  const packageImportPattern =
    /^\s*(?:import|export)\s+(?:type\s+)?(?:[\s\S]*?\s+from\s+)?['"]@kikita-labs\/ui(?:\/[^'"]*)?['"]/gm;

  for (const file of files) {
    const text = readFileSync(file, 'utf8');

    if (packageImportPattern.test(text)) {
      failures.push(
        `${toRepoPath(root, file)} imports @kikita-labs/ui from inside the library source`,
      );
    }
  }

  return failures;
}

function checkPublicJSDoc(root) {
  const failures = [];
  const publicFiles = collectTextFiles(root, [
    join(root, 'projects/ui/src/lib/components'),
    join(root, 'projects/ui/src/lib/providers'),
    join(root, 'projects/ui/src/lib/theme'),
    join(root, 'projects/ui/src/lib/tokens'),
    join(root, 'projects/ui/src/lib/types'),
  ]).filter(
    (file) => file.endsWith('.ts') && !file.endsWith('.spec.ts') && !file.endsWith('index.ts'),
  );

  const exportPattern =
    /^\s*export\s+(?:declare\s+)?(?:abstract\s+)?(?:class|interface|type|const|function)\s+([A-Z][A-Za-z0-9_]*)/gm;

  for (const file of publicFiles) {
    const text = readFileSync(file, 'utf8');

    for (const match of text.matchAll(exportPattern)) {
      const before = text.slice(0, match.index);
      const recent = before.split(/\r?\n/).slice(-30).join('\n');

      if (!recent.includes('/**')) {
        failures.push(`${toRepoPath(root, file)} export ${match[1]} is missing nearby JSDoc`);
      }
    }
  }

  return failures;
}

function checkTopLevelBrowserGlobals(root) {
  const failures = [];
  const libDir = join(root, 'projects/ui/src/lib');

  if (!existsSync(libDir)) {
    return failures;
  }

  const files = collectTextFiles(root, [libDir]).filter(
    (file) => file.endsWith('.ts') && !file.endsWith('.spec.ts'),
  );

  for (const file of files) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/);

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index];

      if (/^\S/.test(line) && disallowedTopLevelGlobals.test(stripLineComment(line))) {
        failures.push(
          `${toRepoPath(root, file)}:${index + 1} has a top-level browser global reference`,
        );
      }
    }
  }

  return failures;
}

function collectTextFiles(root, entries) {
  const files = [];

  for (const entry of entries) {
    if (!existsSync(entry)) {
      continue;
    }

    const stats = statSync(entry);

    if (stats.isDirectory()) {
      const name = entry.split(/[\\/]/).at(-1);

      if (ignoredDirs.has(name)) {
        continue;
      }

      for (const child of readdirSync(entry)) {
        files.push(...collectTextFiles(root, [join(entry, child)]));
      }

      continue;
    }

    if (isTextFile(entry)) {
      files.push(entry);
    }
  }

  return files;
}

function isTextFile(file) {
  return textExtensions.has(file.slice(file.lastIndexOf('.')));
}

function stripLineComment(line) {
  return line.replace(/\/\/.*$/, '');
}

function toRepoPath(root, file) {
  return relative(root, file).replaceAll('\\', '/');
}

function isMain() {
  return (
    process.argv[1] &&
    process.argv[1].replaceAll('\\', '/') === fileURLToPath(import.meta.url).replaceAll('\\', '/')
  );
}
