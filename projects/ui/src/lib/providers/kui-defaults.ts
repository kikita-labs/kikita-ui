import type { Signal } from '@angular/core';
import { computed, inject, Service, signal } from '@angular/core';

import type { KuiComponentDefaults, KuiDefaultsLayer } from './kui-defaults.interface';
import { KUI_DEFAULTS_SEED } from './kui-defaults.token';
import { mergeKuiDefaultsLayers, resolveKuiDefaultsLayer } from './kui-defaults-layer.util';

/**
 * Reads and changes the component defaults of the current injector level.
 *
 * The root instance is seeded by `provideKikitaUi({ defaults })`; `provideKuiDefaults` adds a nested
 * level for a subtree. A level merges its own layer over the parent's effective defaults, so a
 * parent change reaches the child and a write never touches the parent. All state is held per
 * injector, so server requests never share it.
 */
@Service()
export class KuiDefaults {
  private readonly parent = inject(KuiDefaults, { optional: true, skipSelf: true });
  private readonly seeds = inject(KUI_DEFAULTS_SEED, { optional: true, self: true }) ?? [];

  private readonly layer = signal<KuiDefaultsLayer>(
    this.seeds.reduce<KuiDefaultsLayer>(
      (merged, seed) => mergeKuiDefaultsLayers(merged, typeof seed === 'function' ? seed() : seed),
      {},
    ),
  );

  /** Defaults of this level merged over every parent level. */
  readonly effective: Signal<KuiComponentDefaults> = computed(() =>
    mergeKuiDefaultsLayers(
      this.parent?.effective() ?? {},
      resolveKuiDefaultsLayer<KuiComponentDefaults>(this.layer()),
    ),
  );

  /** Effective defaults of one component key as a signal. */
  get<TKey extends keyof KuiComponentDefaults>(key: TKey): Signal<KuiComponentDefaults[TKey]> {
    return computed(() => this.effective()[key]);
  }

  /**
   * Sets options for a key on this level only.
   *
   * Object options merge into what this level already holds for the key; a `size` value replaces it.
   * Properties may be plain values or signals.
   */
  set<TKey extends keyof KuiDefaultsLayer>(key: TKey, value: KuiDefaultsLayer[TKey]): void {
    this.layer.update((layer) => {
      const current = layer[key];

      return {
        ...layer,
        [key]: isOptions(current) && isOptions(value) ? { ...current, ...value } : value,
      };
    });
  }

  /** Changes the options this level holds for a key, starting from their resolved values. */
  update<TKey extends keyof KuiComponentDefaults>(
    key: TKey,
    change: (current: KuiComponentDefaults[TKey]) => KuiDefaultsLayer[TKey],
  ): void {
    const current = resolveKuiDefaultsLayer<KuiComponentDefaults>(this.layer())[key];

    this.set(key, change(current));
  }
}

function isOptions(value: unknown): value is object {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
