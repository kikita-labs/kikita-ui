import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const collectionPath = 'projects/ui/schematics/collection.json';

describe('ng-add schematic', () => {
  it('adds styles and provideKikitaUi() to the default application', async () => {
    const runner = new SchematicTestRunner('@kikita-labs/ui', collectionPath);
    const tree = createWorkspaceTree({
      styles: ['src/styles.css'],
      appConfig: `import { ApplicationConfig } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [],
};
`,
    });

    const result = await runner.runSchematic('ng-add', {}, tree);
    const workspace = JSON.parse(result.readContent('/angular.json'));
    const appConfig = result.readContent('/src/app/app.config.ts');

    expect(workspace.projects.app.architect.build.options.styles).toEqual([
      'src/styles.css',
      'node_modules/@kikita-labs/ui/styles/kikita-ui.css',
    ]);
    expect(appConfig).toContain("import { provideKikitaUi } from '@kikita-labs/ui';");
    expect(appConfig).toContain('providers: [provideKikitaUi()]');
  });

  it('preserves object style entries when adding the style entrypoint', async () => {
    const runner = new SchematicTestRunner('@kikita-labs/ui', collectionPath);
    const existingStyle = {
      input: 'src/legacy-theme.css',
      bundleName: 'legacy-theme',
      inject: false,
    };
    const tree = createWorkspaceTree({
      styles: [existingStyle],
    });

    const result = await runner.runSchematic('ng-add', { skipProvider: true }, tree);
    const workspace = JSON.parse(result.readContent('/angular.json'));

    expect(workspace.projects.app.architect.build.options.styles).toEqual([
      existingStyle,
      'node_modules/@kikita-labs/ui/styles/kikita-ui.css',
    ]);
  });

  it('does not duplicate styles or provider registration', async () => {
    const runner = new SchematicTestRunner('@kikita-labs/ui', collectionPath);
    const tree = createWorkspaceTree({
      styles: ['src/styles.css', 'node_modules/@kikita-labs/ui/styles/kikita-ui.css'],
      appConfig: `import { ApplicationConfig } from '@angular/core';
import { provideKikitaUi } from '@kikita-labs/ui';

export const appConfig: ApplicationConfig = {
  providers: [provideKikitaUi()],
};
`,
    });

    const result = await runner.runSchematic('ng-add', {}, tree);
    const workspace = JSON.parse(result.readContent('/angular.json'));
    const appConfig = result.readContent('/src/app/app.config.ts');

    expect(workspace.projects.app.architect.build.options.styles).toEqual([
      'src/styles.css',
      'node_modules/@kikita-labs/ui/styles/kikita-ui.css',
    ]);
    expect(appConfig.match(/provideKikitaUi/g)).toHaveLength(2);
  });

  it('supports skipStyles and skipProvider', async () => {
    const runner = new SchematicTestRunner('@kikita-labs/ui', collectionPath);
    const tree = createWorkspaceTree({
      styles: ['src/styles.css'],
    });

    const result = await runner.runSchematic(
      'ng-add',
      { skipStyles: true, skipProvider: true },
      tree,
    );
    const workspace = JSON.parse(result.readContent('/angular.json'));
    const appConfig = result.readContent('/src/app/app.config.ts');

    expect(workspace.projects.app.architect.build.options.styles).toEqual(['src/styles.css']);
    expect(appConfig).not.toContain('provideKikitaUi');
  });

  it('can scaffold the default theme seed configuration', async () => {
    const runner = new SchematicTestRunner('@kikita-labs/ui', collectionPath);
    const tree = createWorkspaceTree({
      styles: ['src/styles.css'],
    });

    const result = await runner.runSchematic('ng-add', { theme: true }, tree);
    const appConfig = result.readContent('/src/app/app.config.ts');

    expect(appConfig).toContain('provideKikitaUi({');
    expect(appConfig).toContain("primary: 'oklch(0.52 0.25 285)'");
    expect(appConfig).toContain("density: 'regular'");
  });
});

function createWorkspaceTree(options: { styles: unknown[]; appConfig?: string }): EmptyTree {
  const tree = new EmptyTree();
  const workspace = {
    version: 1,
    defaultProject: 'app',
    projects: {
      app: {
        projectType: 'application',
        root: '',
        sourceRoot: 'src',
        architect: {
          build: {
            options: {
              styles: options.styles,
            },
          },
        },
      },
    },
  };

  tree.create('/angular.json', `${JSON.stringify(workspace, null, 2)}\n`);
  tree.create(
    '/src/app/app.config.ts',
    options.appConfig ??
      `import { ApplicationConfig } from '@angular/core';

export const appConfig: ApplicationConfig = {
  providers: [],
};
`,
  );

  return tree;
}
