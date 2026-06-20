const { SchematicsException } = require('@angular-devkit/schematics');

const STYLE_ENTRYPOINT = '@kikita-labs/ui/styles';
const PROVIDER_IMPORT = "import { provideKikitaUi } from '@kikita-labs/ui';";

function ngAdd(options = {}) {
  return (tree, context) => {
    const workspace = readWorkspace(tree);
    const projectName = resolveProjectName(workspace, options.project);
    const project = workspace.projects[projectName];

    if (!project) {
      throw new SchematicsException(`Project "${projectName}" was not found.`);
    }

    if (project.projectType !== 'application') {
      throw new SchematicsException(`Project "${projectName}" is not an application.`);
    }

    if (!options.skipStyles) {
      addStyles(tree, workspace, projectName);
    }

    if (!options.skipProvider) {
      addProvider(tree, project, context);
    }

    return tree;
  };
}

function readWorkspace(tree) {
  const path = '/angular.json';

  if (!tree.exists(path)) {
    throw new SchematicsException('Could not find angular.json.');
  }

  const content = tree.readText(path);
  return JSON.parse(content);
}

function resolveProjectName(workspace, requestedProject) {
  if (requestedProject) {
    return requestedProject;
  }

  if (workspace.defaultProject) {
    return workspace.defaultProject;
  }

  return Object.entries(workspace.projects).find(([, project]) => {
    return project.projectType === 'application';
  })?.[0];
}

function addStyles(tree, workspace, projectName) {
  const project = workspace.projects[projectName];
  const buildTarget = project.targets?.build ?? project.architect?.build;

  if (!buildTarget) {
    throw new SchematicsException(`Project "${projectName}" does not have a build target.`);
  }

  const options = (buildTarget.options ??= {});
  const styles = normalizeStyles(options.styles);

  if (!styles.includes(STYLE_ENTRYPOINT)) {
    styles.push(STYLE_ENTRYPOINT);
  }

  options.styles = styles;
  tree.overwrite('/angular.json', `${JSON.stringify(workspace, null, 2)}\n`);
}

function normalizeStyles(styles) {
  if (!styles) {
    return [];
  }

  return styles.map((style) => {
    return typeof style === 'string' ? style : style.input;
  });
}

function addProvider(tree, project, context) {
  const sourceRoot = project.sourceRoot ?? `${project.root}/src`;
  const appConfigPath = normalizePath(`${sourceRoot}/app/app.config.ts`);

  if (!tree.exists(appConfigPath)) {
    context.logger.warn(`Could not find ${appConfigPath}; add provideKikitaUi() manually.`);
    return;
  }

  const original = tree.readText(appConfigPath);
  let updated = original;

  if (!updated.includes(PROVIDER_IMPORT)) {
    updated = `${PROVIDER_IMPORT}\n${updated}`;
  }

  if (updated.includes('provideKikitaUi()')) {
    tree.overwrite(appConfigPath, updated);
    return;
  }

  updated = addProviderToProvidersArray(updated);
  tree.overwrite(appConfigPath, updated);
}

function addProviderToProvidersArray(source) {
  const providersMatch = /providers\s*:\s*\[/.exec(source);

  if (!providersMatch) {
    throw new SchematicsException(
      'Could not find providers array in app.config.ts; add provideKikitaUi() manually.',
    );
  }

  const insertAt = providersMatch.index + providersMatch[0].length;
  return `${source.slice(0, insertAt)}provideKikitaUi(), ${source.slice(insertAt)}`;
}

function normalizePath(path) {
  return path.replace(/\\/g, '/').replace(/^\/?/, '/');
}

exports.ngAdd = ngAdd;
