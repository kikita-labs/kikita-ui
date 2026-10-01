import { execFileSync } from 'node:child_process';
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
const routeCoverageExclusions = new Set();
const playgroundRouteEnumPath =
  'projects/kikita-ui-playground/src/app/enums/playground-route.enum.ts';
const playgroundLocaleDirectory = 'projects/kikita-ui-playground/public/i18n';
const localeCataloguePathPattern =
  /^projects\/kikita-ui-playground\/public\/i18n\/(?:[^/]+\/)?[a-z]{2,3}(?:-[a-zA-Z0-9]{2,8})*\.json$/u;
const paletteTokenConsumerRoots = ['projects/ui/src', 'projects/kikita-ui-playground/src'];
const paletteTokenGeneratorDirectory = 'projects/ui/src/lib/theme/';
const paletteTokenExtensions = new Set(['.css', '.html', '.scss', '.ts']);
// Reviewed exceptions: repository-relative path -> reason. Keep this empty unless a consumer
// genuinely needs a raw palette step; document the owner and follow-up in the reason.
const paletteTokenExceptions = new Map();
const palettePattern =
  /--kui-(?:(?:primary|neutral|success|warning|danger|info)-\d+|seed-[a-z]+)(?![\w-])/u;
// Style files that are themselves the semantic layer and may read colour roles directly.
const colorHookExceptions = new Map([
  ['projects/ui/src/styles/typography.css', 'tone classes are the semantic text-colour API'],
]);
const colorRolePattern =
  /^--kui-color-(?:bg|surface(?:-[a-z]+)?|border(?:-[a-z]+)?|text(?:-[a-z]+)?|on-fill|(?:primary|success|warning|danger|info)-[a-z-]+)$/u;
// Public tokens that a component or a layout deliberately assigns to the elements it contains (parent
// to child APIs, density and group size maps). Every other component default must be private.
const parentAssignedTokens = new Set([
  '--kui-btn-ghost-bg-act',
  '--kui-btn-ghost-bg-hov',
  '--kui-btn-ghost-fg',
  '--kui-btn-height',
  '--kui-btn-px',
  '--kui-checkbox-size',
  '--kui-field-action-size',
  '--kui-field-grid-rows',
  '--kui-field-hint-size',
  '--kui-input-height',
  '--kui-input-px',
  '--kui-loader-fill',
  '--kui-loader-track',
  '--kui-skeleton-radius',
  '--kui-skeleton-radius-pill',
  '--kui-splitter-gutter-size',
  '--kui-type-caption-weight',
]);
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
  runCheck(failures, 'tracked text has no unexpected Cyrillic characters', () =>
    checkNoCyrillic(root),
  );
  runCheck(failures, 'playground locale catalogues parse and share key paths', () =>
    checkPlaygroundLocaleCatalogues(root),
  );
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
  runCheck(failures, 'components keep their defaults in private variables', () =>
    checkPublicTokenDefinitions(root),
  );
  runCheck(failures, 'component colours are read through a component token', () =>
    checkComponentColorHooks(root),
  );
  runCheck(
    failures,
    'styles consume semantic tokens instead of raw palette or seed variables',
    () => checkNoRawPaletteConsumption(root),
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
    if (isLocaleCatalogue(root, file) || isIgnoredByGit(root, file)) {
      continue;
    }

    const text = readFileSync(file, 'utf8');
    const match = /[\u0401\u0410-\u044f\u0451]/u.exec(text);

    if (match) {
      failures.push(`${toRepoPath(root, file)} contains Cyrillic text near index ${match.index}`);
    }
  }

  return failures;
}

function isLocaleCatalogue(root, file) {
  return localeCataloguePathPattern.test(toRepoPath(root, file));
}

function checkPlaygroundLocaleCatalogues(root) {
  const directory = join(root, playgroundLocaleDirectory);

  if (!existsSync(directory)) {
    return [];
  }

  const failures = [];
  const catalogueDirectories = [
    directory,
    ...readdirSync(directory, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => join(directory, entry.name)),
  ];
  let rootCatalogueNames = [];

  for (const catalogueDirectory of catalogueDirectories) {
    const cataloguePath = toRepoPath(root, catalogueDirectory);
    const catalogues = new Map();
    const fileNames = readdirSync(catalogueDirectory, { withFileTypes: true })
      .filter(
        (entry) =>
          entry.isFile() && localeCataloguePathPattern.test(`${cataloguePath}/${entry.name}`),
      )
      .map((entry) => entry.name)
      .sort();

    if (catalogueDirectory === directory) {
      rootCatalogueNames = fileNames;
    } else if (
      rootCatalogueNames.length > 0 &&
      fileNames.join('\n') !== rootCatalogueNames.join('\n')
    ) {
      failures.push(
        `${cataloguePath} does not contain the same language catalogues as ${playgroundLocaleDirectory}`,
      );
    }

    for (const fileName of fileNames) {
      const file = join(catalogueDirectory, fileName);

      try {
        catalogues.set(fileName, JSON.parse(readFileSync(file, 'utf8')));
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        failures.push(`${cataloguePath}/${fileName} is not valid JSON: ${reason}`);
      }
    }

    if (catalogues.size < 2) {
      continue;
    }

    const referenceFile = catalogues.has('en.json') ? 'en.json' : [...catalogues.keys()][0];
    const referenceKeys = flattenTranslationKeys(catalogues.get(referenceFile)).join('\n');

    for (const [fileName, catalogue] of catalogues) {
      if (fileName === referenceFile) {
        continue;
      }

      if (flattenTranslationKeys(catalogue).join('\n') !== referenceKeys) {
        failures.push(
          `${cataloguePath}/${fileName} does not have the same key paths as ${cataloguePath}/${referenceFile}`,
        );
      }
    }
  }

  return failures;
}

function flattenTranslationKeys(value, prefix = '') {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return [prefix.slice(0, -1)];
  }

  return Object.entries(value)
    .flatMap(([key, child]) => flattenTranslationKeys(child, `${prefix}${key}.`))
    .sort();
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
  const enumPath = join(root, playgroundRouteEnumPath);
  const coveragePath = join(root, 'docs/state-coverage.md');

  if (!existsSync(enumPath)) {
    return [`${playgroundRouteEnumPath} is missing, so route coverage cannot be checked`];
  }

  if (!existsSync(coveragePath)) {
    return ['docs/state-coverage.md is missing, so route coverage cannot be checked'];
  }

  const failures = [];
  const enumSource = readFileSync(enumPath, 'utf8');
  const stateCoverage = readFileSync(coveragePath, 'utf8');
  const segments = [...enumSource.matchAll(/^\s+\w+\s*=\s*'([^']*)'/gm)].map((match) => match[1]);
  const routes = segments
    .filter((segment) => segment.length > 0 && !segment.startsWith(':'))
    .filter((segment) => segment !== 'components')
    .map((segment) => `/components/${segment}`);

  if (routes.length === 0) {
    return [`${playgroundRouteEnumPath} lists no component routes`];
  }

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
  ])
    .filter((file) => file.endsWith('.md'))
    .filter((file) => !isIgnoredByGit(root, file));
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
    .filter((entry) => {
      const skillPath = join(skillsDir, entry, 'SKILL.md');

      return statSync(join(skillsDir, entry)).isDirectory() && !isIgnoredByGit(root, skillPath);
    })
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

function checkNoRawPaletteConsumption(root) {
  const failures = [];
  const files = collectTextFiles(
    root,
    paletteTokenConsumerRoots.map((entry) => join(root, entry)),
  ).filter(
    (file) =>
      paletteTokenExtensions.has(file.slice(file.lastIndexOf('.'))) &&
      !/\.spec\.(?:ts|mjs)$/u.test(file),
  );

  for (const file of files) {
    const repoPath = toRepoPath(root, file);

    if (
      repoPath.startsWith(paletteTokenGeneratorDirectory) ||
      paletteTokenExceptions.has(repoPath)
    ) {
      continue;
    }

    const lines = readFileSync(file, 'utf8').split(/\r?\n/);

    for (let index = 0; index < lines.length; index += 1) {
      const line = lines[index].trim();

      if (/^(?:\/\/|\/\*|\*)/u.test(line)) {
        continue;
      }

      const match = palettePattern.exec(line);

      if (match) {
        failures.push(
          `${repoPath}:${index + 1} reads ${match[0]} directly; use a semantic or component token`,
        );
      }
    }
  }

  return failures;
}

function checkPublicTokenDefinitions(root) {
  const failures = [];
  const stylesRoot = join(root, 'projects/ui/src');
  const files = collectTextFiles(root, [stylesRoot]).filter((file) => file.endsWith('.css'));

  for (const file of files) {
    const repoPath = toRepoPath(root, file);
    const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//gu, (comment) =>
      comment.replace(/[^\n]/gu, ' '),
    );
    const definition = /(?:^|[;{}\s])(--kui-[\w-]+)\s*:/gu;
    let match;

    while ((match = definition.exec(text))) {
      const name = match[1];

      if (parentAssignedTokens.has(name)) {
        continue;
      }

      const line = text.slice(0, match.index + match[0].indexOf(name)).split('\n').length;

      failures.push(
        `${repoPath}:${line} defines the public token ${name} on a component; define a private --_${name.slice(2)} default and read var(${name}, var(--_${name.slice(2)}))`,
      );
    }
  }

  return failures;
}

function checkComponentColorHooks(root) {
  const failures = [];
  const stylesRoot = join(root, 'projects/ui/src');
  const files = collectTextFiles(root, [stylesRoot]).filter((file) => file.endsWith('.css'));

  for (const file of files) {
    const repoPath = toRepoPath(root, file);

    if (colorHookExceptions.has(repoPath)) {
      continue;
    }

    const text = readFileSync(file, 'utf8').replace(/\/\*[\s\S]*?\*\//gu, (comment) =>
      comment.replace(/[^\n]/gu, ' '),
    );
    const declaration = /([\w-]+)\s*:\s*([^;{}]+);/gu;
    let match;

    while ((match = declaration.exec(text))) {
      if (match[1].startsWith('--')) {
        continue;
      }

      const valueStart = match.index + match[0].indexOf(match[2]);

      for (const read of bareColorRoleReads(match[2])) {
        const line = text.slice(0, valueStart + read.index).split('\n').length;

        failures.push(
          `${repoPath}:${line} reads ${read.name} without a component token; use var(--kui-<component>-<part>-<property>, var(${read.name}))`,
        );
      }
    }
  }

  return failures;
}

// Returns reads of colour roles that are not inside the fallback of a component token.
function bareColorRoleReads(value, insideHook = false, offset = 0, reads = []) {
  let index = 0;

  while (index < value.length) {
    const start = value.indexOf('var(', index);

    if (start === -1) {
      break;
    }

    let depth = 0;
    let end = start + 3;

    for (; end < value.length; end += 1) {
      if (value[end] === '(') {
        depth += 1;
      } else if (value[end] === ')') {
        depth -= 1;

        if (depth === 0) {
          break;
        }
      }
    }

    const body = value.slice(start + 4, end);
    const comma = firstTopLevelComma(body);
    const name = (comma === -1 ? body : body.slice(0, comma)).trim();
    const isRole = colorRolePattern.test(name);

    if (isRole && !insideHook) {
      reads.push({ name, index: offset + start });
    }

    if (comma !== -1) {
      const hook = insideHook || (name.startsWith('--kui-') && !isRole);

      bareColorRoleReads(body.slice(comma + 1), hook, offset + start + 4 + comma + 1, reads);
    }

    index = end + 1;
  }

  return reads;
}

function firstTopLevelComma(text) {
  let depth = 0;

  for (let index = 0; index < text.length; index += 1) {
    if (text[index] === '(') {
      depth += 1;
    } else if (text[index] === ')') {
      depth -= 1;
    } else if (text[index] === ',' && depth === 0) {
      return index;
    }
  }

  return -1;
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

function isIgnoredByGit(root, file) {
  if (!existsSync(join(root, '.git'))) {
    return false;
  }

  try {
    execFileSync('git', ['check-ignore', '--quiet', '--', toRepoPath(root, file)], {
      cwd: root,
      stdio: 'ignore',
    });
    return true;
  } catch {
    return false;
  }
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
