import type { Signal } from '@angular/core';
import { computed } from '@angular/core';

import type { KuiSize } from '../types';

/**
 * What a control reads from its ancestor `kui-field`. `KuiFieldComponent` satisfies it; the
 * structural type keeps shared helpers from importing a component.
 */
export interface KuiFieldWiringSource {
  /** Id the field label points at. */
  readonly controlId: string;

  /** Size set explicitly on the field. */
  readonly size: Signal<KuiSize | undefined>;

  /** Size the field resolves after its own defaults. */
  readonly effectiveSize: Signal<KuiSize>;

  /** Validity as the field shows it, already gated by the touched state of a Signal Forms field. */
  readonly invalid: Signal<boolean>;

  /** Whether a Signal Forms `[formField]` is projected into the field. */
  readonly hasSignalFormField: Signal<boolean>;

  /** Space-separated ids of the hint and error elements, or `null`. */
  readonly describedBy: Signal<string | null>;

  /** `'true'` when the field is required, otherwise `null`. */
  readonly ariaRequired: Signal<'true' | null>;
}

/** Options for {@link createKuiFieldWiring}. */
export interface KuiFieldWiringOptions {
  /** The ancestor field, or `null` when the control is used on its own. */
  readonly field: KuiFieldWiringSource | null;

  /** The control's explicit `id` input. */
  readonly id: Signal<string | undefined>;

  /**
   * The control's own invalid flag: the `invalid` input of a manual control, which Signal Forms
   * also writes when `[formField]` is bound.
   */
  readonly invalid: Signal<boolean>;
}

/** Field-derived host values of a form control. */
export interface KuiFieldWiring {
  /** Explicit id, else the id the field label points at, else `null`. */
  readonly hostId: Signal<string | null>;

  /**
   * Whether the control shows its invalid state. Inside a field with a Signal Forms `[formField]`
   * only the field's own touched-gated validity counts, because Signal Forms writes the raw,
   * untouched validity into the `invalid` input of a bound control. Otherwise the manual flag or
   * the field's validity.
   */
  readonly invalid: Signal<boolean>;

  /** Hint and error ids to expose through `aria-describedby`, or `null`. */
  readonly describedBy: Signal<string | null>;

  /** Value for `aria-required`: `'true'` when the ancestor field is required, otherwise `null`. */
  readonly ariaRequired: Signal<'true' | null>;
}

/**
 * Derives the host id, invalid state, `aria-describedby` and `aria-required` of a control from its
 * ancestor `kui-field`. Shared by the native controls so they keep one definition of each.
 */
export function createKuiFieldWiring(options: KuiFieldWiringOptions): KuiFieldWiring {
  const { field, id, invalid } = options;

  return {
    hostId: computed(() => id() ?? field?.controlId ?? null),
    invalid: computed(() =>
      field?.hasSignalFormField()
        ? Boolean(field.invalid())
        : invalid() || Boolean(field?.invalid()),
    ),
    describedBy: computed(() => field?.describedBy() ?? null),
    ariaRequired: computed(() => field?.ariaRequired() ?? null),
  };
}

/** Options for {@link createKuiControlSize}. */
export interface KuiControlSizeOptions<TSize extends string = KuiSize> {
  /** The ancestor field, or `null` when the control is used on its own. */
  readonly field: KuiFieldWiringSource | null;

  /** The control's own `size` input. */
  readonly local: Signal<TSize | undefined>;

  /** The size of the control's own `defaults.<key>`. */
  readonly keyDefault: Signal<TSize | undefined>;

  /** The global `defaults.size`, limited to the sizes the control supports. */
  readonly root: Signal<TSize | undefined>;
}

/**
 * Resolves a control size: its own input, the size set on the field, the control's own defaults key,
 * the field's resolved size, the global default, then `md`.
 */
export function createKuiControlSize(options: KuiControlSizeOptions): Signal<KuiSize> {
  const { field, local, keyDefault, root } = options;

  return computed(
    () => local() ?? field?.size() ?? keyDefault() ?? field?.effectiveSize() ?? root() ?? 'md',
  );
}
