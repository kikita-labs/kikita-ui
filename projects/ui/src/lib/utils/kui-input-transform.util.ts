import { booleanAttribute, numberAttribute } from '@angular/core';

/**
 * Coerces an optional boolean input while preserving an omitted value as `undefined`.
 *
 * This is suitable for inputs whose effective value is inherited from another source when the
 * consumer does not provide the attribute.
 */
export function optionalBooleanAttribute(value: unknown): boolean | undefined {
  return value == null ? undefined : booleanAttribute(value);
}

/** Coerces an input to a positive integer, using `1` for invalid or non-positive values. */
export function positiveIntegerAttribute(value: unknown): number {
  const parsed = numberAttribute(value, 1);
  return Number.isFinite(parsed) && parsed >= 1 ? Math.floor(parsed) : 1;
}
