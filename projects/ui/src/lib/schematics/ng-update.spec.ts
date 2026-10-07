import { EmptyTree } from '@angular-devkit/schematics';
import { SchematicTestRunner } from '@angular-devkit/schematics/testing';

const collectionPath = 'projects/ui/schematics/migration.json';

async function migrate(files: Record<string, string>): Promise<{
  read: (path: string) => string;
  warnings: string[];
}> {
  const runner = new SchematicTestRunner('@kikita-labs/ui', collectionPath);
  const warnings: string[] = [];
  runner.logger.subscribe((entry) => {
    if (entry.level === 'warn') {
      warnings.push(entry.message);
    }
  });

  const tree = new EmptyTree();

  for (const [path, content] of Object.entries(files)) {
    tree.create(path, content);
  }

  const result = await runner.runSchematic('rename-symbols-v2', {}, tree);
  return { read: (path) => result.readContent(path), warnings };
}

describe('rename-symbols-v2 migration', () => {
  it('renames named imports and every use of the binding', async () => {
    const { read } = await migrate({
      '/src/app/page.ts': `import { Component } from '@angular/core';
import { KuiButtonDirective, KuiTabsComponent } from '@kikita-labs/ui';

@Component({
  selector: 'app-page',
  imports: [KuiButtonDirective, KuiTabsComponent],
  template: '',
})
export class Page {
  protected readonly tabs = viewChild(KuiTabsComponent);
  protected readonly kinds = { KuiButtonDirective };
}
`,
    });

    const output = read('/src/app/page.ts');
    expect(output).toContain("import { KuiButton, KuiTabs } from '@kikita-labs/ui';");
    expect(output).toContain('imports: [KuiButton, KuiTabs]');
    expect(output).toContain('viewChild(KuiTabs)');
    expect(output).toContain('{ KuiButtonDirective: KuiButton }');
    expect(output).not.toMatch(/KuiButtonDirective,|KuiTabsComponent/);
  });

  it('renames only the imported name of an aliased import', async () => {
    const { read } = await migrate({
      '/src/a.ts': `import { KuiInputDirective as Input } from '@kikita-labs/ui';
export const imports = [Input];
`,
    });

    expect(read('/src/a.ts')).toBe(`import { KuiInput as Input } from '@kikita-labs/ui';
export const imports = [Input];
`);
  });

  it('renames namespace members in value and type positions', async () => {
    const { read } = await migrate({
      '/src/ns.ts': `import * as kui from '@kikita-labs/ui';
export const slot = kui.KuiSeparatorDirective;
export type Ref = kui.KuiTabsComponent;
export type Lazy = import('@kikita-labs/ui').KuiCardDirective;
`,
    });

    const output = read('/src/ns.ts');
    expect(output).toContain('kui.KuiSeparator;');
    expect(output).toContain('kui.KuiTabs;');
    expect(output).toContain("import('@kikita-labs/ui').KuiCard;");
  });

  it('renames re-exports and keeps the public name of a local re-export', async () => {
    const { read } = await migrate({
      '/src/reexport.ts': `export { KuiBadgeDirective } from '@kikita-labs/ui';
export { KuiChipDirective as Chip } from '@kikita-labs/ui';
`,
      '/src/local.ts': `import { KuiLoaderDirective } from '@kikita-labs/ui';
export { KuiLoaderDirective };
`,
    });

    expect(read('/src/reexport.ts')).toBe(`export { KuiBadge } from '@kikita-labs/ui';
export { KuiChip as Chip } from '@kikita-labs/ui';
`);
    expect(read('/src/local.ts')).toBe(`import { KuiLoader } from '@kikita-labs/ui';
export { KuiLoader as KuiLoaderDirective };
`);
  });

  it('handles type-only imports and sub-path style specifiers', async () => {
    const { read } = await migrate({
      '/src/types.ts': `import type { KuiFieldComponent } from '@kikita-labs/ui';
let field: KuiFieldComponent | undefined;
`,
    });

    expect(read('/src/types.ts')).toBe(`import type { KuiField } from '@kikita-labs/ui';
let field: KuiField | undefined;
`);
  });

  it('applies the toast, provider-function and chart legend special cases', async () => {
    const { read } = await migrate({
      '/src/special.ts': `import {
  KuiChartLegendItem,
  KuiChartLegendItemDirective,
  kuiProvideLocale,
  KuiToastService,
} from '@kikita-labs/ui';

export const providers = [kuiProvideLocale('ru-RU')];
export const toast = inject(KuiToastService);
export const directive = KuiChartLegendItemDirective;
export type Item = KuiChartLegendItem;
`,
    });

    const output = read('/src/special.ts');
    expect(output).toContain(
      'KuiChartLegendEntry,\n  KuiChartLegendItem,\n  provideKuiLocale,\n  KuiToast,',
    );
    expect(output).toContain("[provideKuiLocale('ru-RU')]");
    expect(output).toContain('inject(KuiToast)');
    expect(output).toContain('directive = KuiChartLegendItem;');
    expect(output).toContain('type Item = KuiChartLegendEntry;');
  });

  it('leaves strings, comments, templates and unrelated files untouched', async () => {
    const own = `import { KuiButtonDirective } from '@kikita-labs/ui';

// KuiButtonDirective stays in comments.
export const label = 'KuiButtonDirective';
export const use = KuiButtonDirective;
`;
    const unrelated = `export class KuiButtonDirective {}
`;
    const { read } = await migrate({
      '/src/own.ts': own,
      '/src/unrelated.ts': unrelated,
      '/src/page.html': '<button kuiButton>KuiButtonDirective</button>',
      '/node_modules/x/index.ts': `import { KuiButtonDirective } from '@kikita-labs/ui';`,
    });

    expect(read('/src/own.ts')).toBe(`import { KuiButton } from '@kikita-labs/ui';

// KuiButtonDirective stays in comments.
export const label = 'KuiButtonDirective';
export const use = KuiButton;
`);
    expect(read('/src/unrelated.ts')).toBe(unrelated);
    expect(read('/src/page.html')).toBe('<button kuiButton>KuiButtonDirective</button>');
    expect(read('/node_modules/x/index.ts')).toContain('KuiButtonDirective');
  });

  it('skips a symbol and warns when the new name is already declared', async () => {
    const source = `import { KuiButtonDirective } from '@kikita-labs/ui';
import { KuiButton } from './my-button';

export const both = [KuiButtonDirective, KuiButton];
`;
    const { read, warnings } = await migrate({ '/src/conflict.ts': source });

    expect(read('/src/conflict.ts')).toBe(source);
    expect(warnings.some((message) => message.includes('KuiButtonDirective was not renamed'))).toBe(
      true,
    );
  });

  it('is idempotent', async () => {
    const first = await migrate({
      '/src/a.ts': `import { KuiSelectDirective } from '@kikita-labs/ui';
export const imports = [KuiSelectDirective];
`,
    });
    const migrated = first.read('/src/a.ts');
    const second = await migrate({ '/src/a.ts': migrated });

    expect(second.read('/src/a.ts')).toBe(migrated);
    expect(migrated).toContain('KuiSelect');
  });
});
