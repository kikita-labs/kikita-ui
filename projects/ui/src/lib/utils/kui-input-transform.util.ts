import { booleanAttribute } from '@angular/core';

/**
 * Coerces an optional boolean input while preserving an omitted value as `undefined`.
 *
 * This is suitable for inputs whose effective value is inherited from another source when the
 * consumer does not provide the attribute.
 */
export function optionalBooleanAttribute(value: unknown): boolean | undefined {
  return value == null ? undefined : booleanAttribute(value);
}
