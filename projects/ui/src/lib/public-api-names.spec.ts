/// <reference types="node" />

import { readFileSync } from 'node:fs';

import * as publicApi from '../public-api';

interface RenameData {
  readonly published: Record<string, string>;
  readonly unreleased: Record<string, string>;
}

const data = JSON.parse(
  readFileSync('projects/ui/schematics/ng-update/renames.json', 'utf-8'),
) as RenameData;
const renames = { ...data.published, ...data.unreleased };
const runtimeNames = Object.keys(publicApi);

// Names the 2.0 migration maps are classes or functions; the one interface in the table
// (`KuiChartLegendItem` -> `KuiChartLegendEntry`) has no runtime presence and is covered by the
// type check of the library build.
const runtimeRenames = Object.entries(renames).filter(
  ([oldName, newName]) =>
    /(?:Component|Directive|Service)$|^kuiProvide/u.test(oldName) &&
    newName !== 'KuiChartLegendEntry',
);

describe('public API names', () => {
  it('exports no class named after its Angular construct', () => {
    expect(runtimeNames.filter((name) => /(?:Component|Directive|Service)$/u.test(name))).toEqual(
      [],
    );
  });

  it('exports every renamed symbol under its new name', () => {
    const missing = runtimeRenames.filter(([, newName]) => !runtimeNames.includes(newName));

    expect(missing).toEqual([]);
  });

  it('no longer exports a removed old name', () => {
    const newNames = new Set(Object.values(renames));
    const stillExported = runtimeRenames.filter(
      ([oldName]) => runtimeNames.includes(oldName) && !newNames.has(oldName),
    );

    expect(stillExported).toEqual([]);
  });

  it('keeps the migration table free of chains and self renames', () => {
    const newNames = new Set(Object.values(renames));
    const chained = Object.keys(renames).filter(
      (oldName) => newNames.has(oldName) && oldName !== 'KuiChartLegendItem',
    );

    expect(chained).toEqual([]);
    expect(Object.entries(renames).filter(([from, to]) => from === to)).toEqual([]);
  });
});
