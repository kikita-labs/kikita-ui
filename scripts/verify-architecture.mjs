import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const defaultRoot = fileURLToPath(new URL('..', import.meta.url));
const libRoot = 'projects/ui/src/lib';
const baselinePath = 'scripts/architecture-baseline.json';

/*
 * Module groups of the library, lowest first. A module may import its own group and the groups
 * below it; an edge to a higher group is a layer violation. The baseline lists the violations and
 * cycles that already exist, so the audit fails only on new ones and on stale baseline entries.
 */
const groupOf = (module) => {
  if (module === 'root') return 'root';
  if (module.startsWith('components/')) return 'components';
  if (module === 'foundation' || module === 'types' || module === 'utils') return 'foundation';
  return 'core';
};
const groupRank = { foundation: 0, core: 1, components: 2, root: 3 };

/**
 * Builds the module import graph of the library. Only runtime edges count: type-only imports and
 * imports of files that export nothing but types are erased by the compiler and are skipped.
 */
export function buildModuleGraph(root = defaultRoot) {
  const lib = join(root, libRoot);
  const files = collectSourceFiles(lib);
  const known = new Set(files);
  const valueCache = new Map();
  const fileEdges = new Map();

  for (const file of files) {
    const targets = new Set();
    // A barrel only re-exports a module's public surface; it consumes nothing itself.
    if (file.endsWith('index.ts')) {
      fileEdges.set(file, targets);
      continue;
    }
    for (const specifier of readRuntimeSpecifiers(file)) {
      const target = resolveRelative(file, specifier, known);
      if (target && target !== file && exportsValues(target, valueCache)) {
        targets.add(target);
      }
    }
    fileEdges.set(file, targets);
  }

  const moduleEdges = new Map();
  for (const [file, targets] of fileEdges) {
    const from = moduleOf(lib, file);
    if (!moduleEdges.has(from)) moduleEdges.set(from, new Map());
    for (const target of targets) {
      const to = moduleOf(lib, target);
      if (to !== from) {
        const examples = moduleEdges.get(from).get(to) ?? [];
        examples.push(`${toRepoPath(root, file)} -> ${toRepoPath(root, target)}`);
        moduleEdges.get(from).set(to, examples);
      }
    }
  }

  return moduleEdges;
}

/** Strongly connected groups of two or more modules, each sorted, as stable strings. */
export function findModuleCycles(moduleEdges) {
  let counter = 0;
  const index = new Map();
  const low = new Map();
  const onStack = new Set();
  const stack = [];
  const cycles = [];

  const visit = (node) => {
    index.set(node, counter);
    low.set(node, counter);
    counter += 1;
    stack.push(node);
    onStack.add(node);

    for (const next of moduleEdges.get(node)?.keys() ?? []) {
      if (!index.has(next)) {
        visit(next);
        low.set(node, Math.min(low.get(node), low.get(next)));
      } else if (onStack.has(next)) {
        low.set(node, Math.min(low.get(node), index.get(next)));
      }
    }

    if (low.get(node) === index.get(node)) {
      const group = [];
      let member;
      do {
        member = stack.pop();
        onStack.delete(member);
        group.push(member);
      } while (member !== node);
      if (group.length > 1) cycles.push(group.sort().join(' <-> '));
    }
  };

  for (const node of moduleEdges.keys()) {
    if (!index.has(node)) visit(node);
  }

  return cycles.sort();
}

/** Module edges from a lower group to a higher one, as `from -> to` strings. */
export function findLayerViolations(moduleEdges) {
  const violations = [];
  for (const [from, targets] of moduleEdges) {
    for (const to of targets.keys()) {
      if (groupRank[groupOf(from)] < groupRank[groupOf(to)]) {
        violations.push(`${from} -> ${to}`);
      }
    }
  }
  return violations.sort();
}

export function runArchitectureAudit(root = defaultRoot) {
  const failures = [];
  const baselineFile = join(root, baselinePath);
  const baseline = existsSync(baselineFile)
    ? JSON.parse(readFileSync(baselineFile, 'utf8'))
    : { cycles: [], layerViolations: [] };
  const moduleEdges = buildModuleGraph(root);
  const cycles = findModuleCycles(moduleEdges);
  const violations = findLayerViolations(moduleEdges);

  compare(failures, 'module cycle', cycles, baseline.cycles ?? []);
  compare(failures, 'layer violation', violations, baseline.layerViolations ?? [], (entry) => {
    const [from, to] = entry.split(' -> ');
    return (moduleEdges.get(from)?.get(to) ?? []).slice(0, 3).join('; ');
  });

  return failures;
}

export function writeArchitectureBaseline(root = defaultRoot) {
  const moduleEdges = buildModuleGraph(root);
  const baseline = {
    cycles: findModuleCycles(moduleEdges),
    layerViolations: findLayerViolations(moduleEdges),
  };
  writeFileSync(join(root, baselinePath), `${JSON.stringify(baseline, null, 2)}\n`);
  return baseline;
}

function compare(failures, label, actual, allowed, describe = () => '') {
  const allowedSet = new Set(allowed);
  const actualSet = new Set(actual);

  for (const entry of actual) {
    if (!allowedSet.has(entry)) {
      const detail = describe(entry);
      failures.push(`new ${label}: ${entry}${detail ? ` (${detail})` : ''}`);
    }
  }
  for (const entry of allowed) {
    if (!actualSet.has(entry)) {
      failures.push(
        `stale ${label} in ${baselinePath}: ${entry} no longer exists; remove it from the baseline`,
      );
    }
  }
}

function collectSourceFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...collectSourceFiles(path));
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.spec.ts')) {
      files.push(path);
    }
  }
  return files;
}

function moduleOf(lib, file) {
  const parts = relative(lib, file).replaceAll('\\', '/').split('/');
  return parts[0] === 'components' && parts.length > 2 ? `components/${parts[1]}` : parts[0];
}

function readRuntimeSpecifiers(file) {
  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const specifiers = [];

  const visit = (node) => {
    if (ts.isImportDeclaration(node) && ts.isStringLiteral(node.moduleSpecifier)) {
      const clause = node.importClause;
      const bindings = clause?.namedBindings;
      const typeOnly =
        clause?.isTypeOnly ||
        (clause &&
          !clause.name &&
          bindings &&
          ts.isNamedImports(bindings) &&
          bindings.elements.length > 0 &&
          bindings.elements.every((element) => element.isTypeOnly));
      if (!typeOnly) specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isExportDeclaration(node) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    ) {
      const typeOnly =
        node.isTypeOnly ||
        (node.exportClause &&
          ts.isNamedExports(node.exportClause) &&
          node.exportClause.elements.length > 0 &&
          node.exportClause.elements.every((element) => element.isTypeOnly));
      if (!typeOnly) specifiers.push(node.moduleSpecifier.text);
    } else if (
      ts.isCallExpression(node) &&
      node.expression.kind === ts.SyntaxKind.ImportKeyword &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifiers.push(node.arguments[0].text);
    }
    ts.forEachChild(node, visit);
  };

  visit(source);
  return specifiers.filter((specifier) => specifier.startsWith('.'));
}

function resolveRelative(from, specifier, known) {
  const base = resolve(dirname(from), specifier);
  for (const candidate of [`${base}.ts`, join(base, 'index.ts')]) {
    if (known.has(candidate)) return candidate;
  }
  return null;
}

/** True when the file declares or re-exports anything that exists at runtime. */
function exportsValues(file, cache, seen = new Set()) {
  if (cache.has(file)) return cache.get(file);
  if (seen.has(file)) return false;
  seen.add(file);

  const source = ts.createSourceFile(
    file,
    readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  let result = false;

  for (const statement of source.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (!statement.isTypeOnly) {
        result = true;
        break;
      }
      continue;
    }
    if (ts.isExportAssignment(statement)) {
      result = true;
      break;
    }
    const exported = ts.canHaveModifiers(statement)
      ? ts
          .getModifiers(statement)
          ?.some((modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword)
      : false;
    if (
      exported &&
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isVariableStatement(statement) ||
        ts.isEnumDeclaration(statement) ||
        ts.isModuleDeclaration(statement))
    ) {
      result = true;
      break;
    }
  }

  cache.set(file, result);
  return result;
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

if (isMain()) {
  if (process.argv.includes('--write-baseline')) {
    const baseline = writeArchitectureBaseline();
    console.log(
      `Wrote ${baselinePath}: ${baseline.cycles.length} cycle(s), ${baseline.layerViolations.length} layer violation(s).`,
    );
  } else {
    const failures = runArchitectureAudit();
    if (failures.length > 0) {
      console.error(`Architecture audit failed:\n${failures.map((f) => `- ${f}`).join('\n')}`);
      process.exit(1);
    }
    console.log('Architecture audit passed.');
  }
}
