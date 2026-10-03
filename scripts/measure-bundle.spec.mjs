import { describe, expect, it } from 'vitest';

import {
  evaluateBudgets,
  kikitaBytes,
  listRuntimeExports,
  ratchetBudgets,
} from './measure-bundle.mjs';

const budgets = {
  tolerancePercent: 3,
  exports: {
    KuiButtonDirective: { baselineBytes: 26000, limitBytes: 26800, targetBytes: 12288 },
    KuiBadgeDirective: { baselineBytes: 5000, limitBytes: 5152 },
  },
};

describe('measure-bundle', () => {
  it('reads the runtime export names, resolving aliases', () => {
    const text =
      'const a = 1;\nexport { KuiBadgeDirective, internal as kuiToast, provideKikitaUi };\n//# map\n';

    expect(listRuntimeExports(text)).toEqual(['KuiBadgeDirective', 'kuiToast', 'provideKikitaUi']);
  });

  it('fails when the bundle has no export list', () => {
    expect(() => listRuntimeExports('const a = 1;')).toThrow('No export list');
  });

  it('sums Kikita inputs of main.js and the chunks it imports statically', () => {
    const stats = {
      outputs: {
        'lazy.js': { inputs: { 'x/kikita-labs-ui-lazy.mjs': { bytesInOutput: 999 } }, imports: [] },
        'shared.js': {
          inputs: { 'dist/ui/fesm2022/kikita-labs-ui-core.mjs': { bytesInOutput: 700 } },
          imports: [],
        },
        'main.js': {
          inputs: {
            'node_modules/@angular/core/core.mjs': { bytesInOutput: 5000 },
            'dist/ui/fesm2022/kikita-labs-ui.mjs': { bytesInOutput: 500 },
          },
          imports: [
            { path: 'shared.js', kind: 'import-statement' },
            { path: 'lazy.js', kind: 'dynamic-import' },
          ],
        },
      },
    };

    expect(kikitaBytes(stats)).toBe(1200);
  });

  it('fails when no Kikita code reaches the initial chunks', () => {
    const stats = {
      outputs: {
        'main.js': { inputs: { 'node_modules/x.mjs': { bytesInOutput: 1 } }, imports: [] },
      },
    };

    expect(() => kikitaBytes(stats)).toThrow('No Kikita code reached');
  });

  it('passes an export under its limit and reports a target miss as a note', () => {
    const result = evaluateBudgets({ KuiButtonDirective: 26500, KuiBadgeDirective: 5100 }, budgets);

    expect(result.failures).toEqual([]);
    expect(result.notes).toEqual([expect.stringContaining('above its target of 12.0 kB')]);
  });

  it('fails an export over its limit', () => {
    const result = evaluateBudgets({ KuiBadgeDirective: 6000 }, budgets);

    expect(result.failures).toEqual(['KuiBadgeDirective is 5.9 kB, over its limit of 5.0 kB']);
  });

  it('fails an export without a budget', () => {
    const result = evaluateBudgets({ KuiNewDirective: 100 }, budgets);

    expect(result.failures).toEqual([expect.stringContaining('KuiNewDirective has no budget')]);
  });

  it('suggests lowering a limit once an export shrinks', () => {
    const result = evaluateBudgets({ KuiButtonDirective: 12000 }, budgets);

    expect(result.notes).toEqual([expect.stringContaining('ratchet it down')]);
  });

  it('ratchets limits down and keeps targets', () => {
    const next = ratchetBudgets({ KuiButtonDirective: 12000 }, budgets);

    expect(next.exports.KuiButtonDirective).toEqual({
      baselineBytes: 12000,
      limitBytes: 12368,
      targetBytes: 12288,
    });
  });

  it('refuses to raise a limit unless asked', () => {
    const kept = ratchetBudgets({ KuiBadgeDirective: 9000 }, budgets);
    const raised = ratchetBudgets({ KuiBadgeDirective: 9000 }, budgets, { allowIncrease: true });

    expect(kept.exports.KuiBadgeDirective.limitBytes).toBe(5152);
    expect(raised.exports.KuiBadgeDirective.limitBytes).toBe(9280);
  });
});
