import type { Signal } from '@angular/core';
import { isSignal } from '@angular/core';

/**
 * Makes every property of an options interface accept a plain value or a `Signal` of that value.
 *
 * Option interfaces declare plain values only; this wrapper is applied by the provider input so
 * consumers can pass `'ghost'` or `computed(() => ...)` for the same property.
 */
export type KuiReactive<T> = { readonly [K in keyof T]?: T[K] | Signal<T[K]> };

/**
 * One configuration layer as written by a consumer: a map of component key to its reactive options.
 *
 * A key whose options are an object accepts {@link KuiReactive} properties; any other key accepts a
 * plain value or a `Signal` of it.
 */
export type KuiDefaultsInput<TMap> = {
  readonly [K in keyof TMap]?: NonNullable<TMap[K]> extends object
    ? KuiReactive<NonNullable<TMap[K]>>
    : TMap[K] | Signal<TMap[K]>;
};

/** Reads a plain value or a signal. Reading a signal inside `computed` tracks it. */
function unwrap<T>(value: T | Signal<T>): T {
  return isSignal(value) ? value() : value;
}

function isOptionsObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Turns one input layer into plain values by reading every signal it holds.
 *
 * Call it inside `computed` so the result updates when a signal inside the layer changes. Entries
 * whose value is `undefined` are dropped, so they inherit when layers are merged.
 */
export function resolveKuiDefaultsLayer<TMap>(layer: KuiDefaultsInput<TMap> | undefined): TMap {
  const resolved: Record<string, unknown> = {};

  for (const [key, entry] of Object.entries(layer ?? {})) {
    const value = unwrap(entry);

    if (value === undefined) {
      continue;
    }

    if (isOptionsObject(value)) {
      const options: Record<string, unknown> = {};

      for (const [name, optionValue] of Object.entries(value)) {
        const resolvedOption = unwrap(optionValue);

        if (resolvedOption !== undefined) {
          options[name] = resolvedOption;
        }
      }

      resolved[key] = options;
    } else {
      resolved[key] = value;
    }
  }

  return resolved as TMap;
}

/**
 * Merges two resolved layers: the child layer wins per component key and per property.
 *
 * `undefined` inherits from the parent, while `false`, `0`, `''` and `null` are real values.
 * Arrays and functions are replaced as a whole. Neither argument is mutated.
 */
export function mergeKuiDefaultsLayers<TMap>(parent: TMap, child: TMap): TMap {
  const merged: Record<string, unknown> = { ...(parent as Record<string, unknown>) };

  for (const [key, childValue] of Object.entries(child as Record<string, unknown>)) {
    if (childValue === undefined) {
      continue;
    }

    const parentValue = merged[key];

    merged[key] =
      isOptionsObject(parentValue) && isOptionsObject(childValue)
        ? mergeOptions(parentValue, childValue)
        : childValue;
  }

  return merged as TMap;
}

function mergeOptions(
  parent: Record<string, unknown>,
  child: Record<string, unknown>,
): Record<string, unknown> {
  const merged = { ...parent };

  for (const [name, value] of Object.entries(child)) {
    if (value !== undefined) {
      merged[name] = value;
    }
  }

  return merged;
}
