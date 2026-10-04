const { SchematicsException } = require('@angular-devkit/schematics');

const PACKAGE_NAME = '@kikita-labs/ui';
const RENAMES = collectRenames(require('./renames.json'));
const SKIPPED_SEGMENTS = ['/node_modules/', '/dist/', '/.angular/', '/out-tsc/', '/.git/'];

/**
 * 2.0.0 migration: renames the exported symbols listed in `renames.json` in every TypeScript file
 * that imports from `@kikita-labs/ui`. Strings, comments and templates are never touched.
 */
function renameSymbolsV2() {
  return (tree, context) => {
    const ts = loadTypeScript();
    let changedFiles = 0;

    tree.visit((filePath) => {
      if (!isCandidate(filePath)) {
        return;
      }

      const buffer = tree.read(filePath);
      const text = buffer?.toString('utf-8');

      if (!text || !text.includes(PACKAGE_NAME)) {
        return;
      }

      const result = migrateSource(ts, filePath, text);

      for (const warning of result.warnings) {
        context.logger.warn(`${filePath}: ${warning}`);
      }

      if (result.text !== text) {
        tree.overwrite(filePath, result.text);
        changedFiles++;
      }
    });

    context.logger.info(`Kikita UI 2.0: renamed exported symbols in ${changedFiles} file(s).`);
    return tree;
  };
}

function collectRenames(data) {
  return new Map([...Object.entries(data.published), ...Object.entries(data.unreleased)]);
}

function isCandidate(filePath) {
  return (
    filePath.endsWith('.ts') &&
    !filePath.endsWith('.d.ts') &&
    !SKIPPED_SEGMENTS.some((segment) => filePath.includes(segment))
  );
}

function loadTypeScript() {
  const loaders = [
    () => require('typescript'),
    () => require(require.resolve('typescript', { paths: [process.cwd()] })),
  ];

  for (const load of loaders) {
    try {
      return load();
    } catch {
      // Try the next location.
    }
  }

  throw new SchematicsException(
    'The "typescript" package could not be resolved. Install it in the workspace and run the migration again.',
  );
}

function isKikitaModule(ts, specifier) {
  return (
    !!specifier &&
    ts.isStringLiteralLike(specifier) &&
    (specifier.text === PACKAGE_NAME || specifier.text.startsWith(`${PACKAGE_NAME}/`))
  );
}

/** Returns the new source text and the reasons a symbol was skipped. */
function migrateSource(ts, filePath, text) {
  const sourceFile = ts.createSourceFile(filePath, text, ts.ScriptTarget.Latest, true);
  const edits = [];
  const warnings = [];
  const localRenames = new Map();
  const namespaces = new Set();
  const identifiers = new Set();

  collectIdentifiers(ts, sourceFile, identifiers);

  function rename(identifier, local) {
    const next = RENAMES.get(identifier.text);

    if (!next) {
      return false;
    }

    edits.push({ start: identifier.getStart(sourceFile), end: identifier.getEnd(), text: next });

    if (local) {
      localRenames.set(identifier.text, next);
    }

    return true;
  }

  // Pass 1: find out which old names this file takes from the package, to detect conflicts.
  const importedOld = new Set();

  sourceFile.forEachChild((node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      isKikitaModule(ts, node.moduleSpecifier)
    ) {
      const bindings = ts.isImportDeclaration(node)
        ? node.importClause?.namedBindings
        : node.exportClause;

      if (bindings && (ts.isNamedImports(bindings) || ts.isNamedExports(bindings))) {
        for (const element of bindings.elements) {
          const imported = element.propertyName ?? element.name;

          if (RENAMES.has(imported.text)) {
            importedOld.add(imported.text);
          }
        }
      }
    }
  });

  function conflicts(oldName) {
    const next = RENAMES.get(oldName);
    // The new name is free when it is absent or when it is itself an old name renamed in this file.
    return identifiers.has(next) && !importedOld.has(next);
  }

  // Pass 2: imports and re-exports.
  sourceFile.forEachChild((node) => {
    if (!isKikitaModule(ts, node.moduleSpecifier)) {
      return;
    }

    if (ts.isImportDeclaration(node)) {
      const bindings = node.importClause?.namedBindings;

      if (bindings && ts.isNamespaceImport(bindings)) {
        namespaces.add(bindings.name.text);
      } else if (bindings && ts.isNamedImports(bindings)) {
        for (const element of bindings.elements) {
          const imported = element.propertyName ?? element.name;

          if (!RENAMES.has(imported.text)) {
            continue;
          }

          if (conflicts(imported.text)) {
            warnings.push(
              `${imported.text} was not renamed because ${RENAMES.get(imported.text)} is already declared or imported here.`,
            );
            continue;
          }

          rename(imported, !element.propertyName);
        }
      }
    } else if (
      ts.isExportDeclaration(node) &&
      node.exportClause &&
      ts.isNamedExports(node.exportClause)
    ) {
      for (const element of node.exportClause.elements) {
        const exported = element.propertyName ?? element.name;

        if (RENAMES.has(exported.text) && !conflicts(exported.text)) {
          rename(exported, false);
        }
      }
    }
  });

  // Pass 3: uses of the renamed local bindings, namespace members and import types.
  function visit(node) {
    if (ts.isIdentifier(node)) {
      handleIdentifier(node);
    } else if (ts.isImportTypeNode(node)) {
      handleImportType(node);
    }

    ts.forEachChild(node, visit);
  }

  function handleIdentifier(node) {
    const parent = node.parent;

    if (ts.isExportSpecifier(parent) && !parent.parent.parent.moduleSpecifier) {
      handleLocalExport(node, parent);
      return;
    }

    if (ts.isImportSpecifier(parent) || ts.isExportSpecifier(parent) || ts.isImportClause(parent)) {
      return;
    }

    if (ts.isPropertyAccessExpression(parent) && parent.name === node) {
      if (ts.isIdentifier(parent.expression) && namespaces.has(parent.expression.text)) {
        rename(node, false);
      }

      return;
    }

    if (ts.isQualifiedName(parent) && parent.right === node) {
      if (ts.isIdentifier(parent.left) && namespaces.has(parent.left.text)) {
        rename(node, false);
      }

      return;
    }

    if (!localRenames.has(node.text)) {
      return;
    }

    if (isDeclarationName(ts, node, parent)) {
      return;
    }

    if (ts.isShorthandPropertyAssignment(parent)) {
      edits.push({
        start: node.getStart(sourceFile),
        end: node.getEnd(),
        text: `${node.text}: ${localRenames.get(node.text)}`,
      });
      return;
    }

    edits.push({
      start: node.getStart(sourceFile),
      end: node.getEnd(),
      text: localRenames.get(node.text),
    });
  }

  /** `export { Old }` re-exports a renamed local binding: keep the consumer's public name. */
  function handleLocalExport(node, specifier) {
    const local = specifier.propertyName ?? specifier.name;

    if (node !== local || !localRenames.has(node.text)) {
      return;
    }

    const next = localRenames.get(node.text);

    edits.push({
      start: node.getStart(sourceFile),
      end: node.getEnd(),
      text: specifier.propertyName ? next : `${next} as ${node.text}`,
    });
  }

  function handleImportType(node) {
    const argument = node.argument;
    const literal = argument && ts.isLiteralTypeNode(argument) ? argument.literal : undefined;

    if (!literal || !isKikitaModule(ts, literal)) {
      return;
    }

    let qualifier = node.qualifier;

    while (qualifier && ts.isQualifiedName(qualifier)) {
      qualifier = qualifier.left;
    }

    if (qualifier && ts.isIdentifier(qualifier)) {
      rename(qualifier, false);
    }
  }

  visit(sourceFile);

  return { text: applyEdits(text, edits), warnings };
}

function collectIdentifiers(ts, node, into) {
  if (ts.isIdentifier(node)) {
    into.add(node.text);
  }

  ts.forEachChild(node, (child) => collectIdentifiers(ts, child, into));
}

/** True when `node` names a property, member or key rather than referring to the binding. */
function isDeclarationName(ts, node, parent) {
  return (
    (ts.isPropertyAssignment(parent) && parent.name === node) ||
    (ts.isPropertyDeclaration(parent) && parent.name === node) ||
    (ts.isPropertySignature(parent) && parent.name === node) ||
    (ts.isMethodDeclaration(parent) && parent.name === node) ||
    (ts.isMethodSignature(parent) && parent.name === node) ||
    (ts.isGetAccessorDeclaration(parent) && parent.name === node) ||
    (ts.isSetAccessorDeclaration(parent) && parent.name === node) ||
    (ts.isEnumMember(parent) && parent.name === node)
  );
}

function applyEdits(text, edits) {
  const unique = new Map();

  for (const edit of edits) {
    unique.set(`${edit.start}:${edit.end}`, edit);
  }

  return [...unique.values()]
    .sort((a, b) => b.start - a.start)
    .reduce(
      (current, edit) => current.slice(0, edit.start) + edit.text + current.slice(edit.end),
      text,
    );
}

module.exports = { renameSymbolsV2 };
