import { computed, signal } from '@angular/core';

import { mergeKuiDefaultsLayers, resolveKuiDefaultsLayer } from './kui-defaults-layer.util';

interface ButtonOptions {
  readonly shape?: 'solid' | 'ghost';
  readonly size?: 'sm' | 'md';
  readonly wrap?: boolean;
}

interface Map {
  readonly button?: ButtonOptions;
  readonly select?: { readonly clearable?: boolean; readonly maxVisibleChips?: number };
  readonly size?: 'sm' | 'md';
  readonly presets?: { readonly sizes?: readonly number[] };
}

describe('resolveKuiDefaultsLayer', () => {
  it('returns an empty map for an undefined layer', () => {
    expect(resolveKuiDefaultsLayer<Map>(undefined)).toEqual({});
  });

  it('reads plain values and signals the same way', () => {
    const shape = signal<'solid' | 'ghost'>('ghost');

    const resolved = resolveKuiDefaultsLayer<Map>({
      button: { shape, size: 'sm' },
      size: signal('md'),
    });

    expect(resolved).toEqual({ button: { shape: 'ghost', size: 'sm' }, size: 'md' });
  });

  it('drops undefined options so they can inherit', () => {
    const resolved = resolveKuiDefaultsLayer<Map>({
      button: { shape: undefined, size: 'sm' },
      select: undefined,
    });

    expect(resolved).toEqual({ button: { size: 'sm' } });
  });

  it('tracks signals when read inside a computed', () => {
    const shape = signal<'solid' | 'ghost'>('solid');
    const layer = { button: { shape } };
    const result = computed(() => resolveKuiDefaultsLayer<Map>(layer));

    expect(result().button?.shape).toBe('solid');

    shape.set('ghost');

    expect(result().button?.shape).toBe('ghost');
  });

  it('does not treat a plain function value as a signal', () => {
    const format = (): string => 'x';
    const resolved = resolveKuiDefaultsLayer<{
      readonly chart?: { readonly format?: () => string };
    }>({
      chart: { format },
    });

    expect(resolved.chart?.format).toBe(format);
  });
});

describe('mergeKuiDefaultsLayers', () => {
  it('lets the child win per property and keeps sibling properties of the parent', () => {
    const merged = mergeKuiDefaultsLayers<Map>(
      { button: { shape: 'ghost', size: 'sm' } },
      { button: { size: 'md' } },
    );

    expect(merged).toEqual({ button: { shape: 'ghost', size: 'md' } });
  });

  it('keeps keys the child does not mention', () => {
    const merged = mergeKuiDefaultsLayers<Map>(
      { button: { shape: 'ghost' }, select: { clearable: true } },
      { button: { wrap: true } },
    );

    expect(merged).toEqual({
      button: { shape: 'ghost', wrap: true },
      select: { clearable: true },
    });
  });

  it('treats false, 0 and empty values as real overrides', () => {
    const merged = mergeKuiDefaultsLayers<Map>(
      { select: { clearable: true, maxVisibleChips: 3 }, button: { wrap: true } },
      { select: { clearable: false, maxVisibleChips: 0 }, button: { wrap: false } },
    );

    expect(merged.select).toEqual({ clearable: false, maxVisibleChips: 0 });
    expect(merged.button).toEqual({ wrap: false });
  });

  it('inherits when the child value is undefined', () => {
    const merged = mergeKuiDefaultsLayers<Map>(
      { size: 'sm', select: { clearable: true } },
      { size: undefined, select: { clearable: undefined } },
    );

    expect(merged).toEqual({ size: 'sm', select: { clearable: true } });
  });

  it('replaces arrays as a whole', () => {
    const merged = mergeKuiDefaultsLayers<Map>(
      { presets: { sizes: [10, 25] } },
      { presets: { sizes: [5] } },
    );

    expect(merged.presets?.sizes).toEqual([5]);
  });

  it('does not mutate either argument', () => {
    const parent: Map = { button: { shape: 'ghost' } };
    const child: Map = { button: { size: 'sm' } };

    mergeKuiDefaultsLayers(parent, child);

    expect(parent).toEqual({ button: { shape: 'ghost' } });
    expect(child).toEqual({ button: { size: 'sm' } });
  });

  it('reacts when a parent signal changes once both steps run in a computed', () => {
    const parentShape = signal<'solid' | 'ghost'>('solid');
    const parentLayer = { button: { shape: parentShape } };
    const childLayer = { button: { size: 'sm' as const } };

    const effective = computed(() =>
      mergeKuiDefaultsLayers(
        resolveKuiDefaultsLayer<Map>(parentLayer),
        resolveKuiDefaultsLayer<Map>(childLayer),
      ),
    );

    expect(effective().button).toEqual({ shape: 'solid', size: 'sm' });

    parentShape.set('ghost');

    expect(effective().button).toEqual({ shape: 'ghost', size: 'sm' });
  });
});
