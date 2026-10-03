import type { KuiSize } from '../../types';

/** Shared defaults for input-like controls composed inside `kui-field`. */
export interface KuiFieldControlOptions {
  /** When true, field controls with clear affordances show a clear button by default. */
  readonly clearable?: boolean;
}

/** Defaults for `kui-field`, set under the `field` key of the component defaults. */
export interface KuiFieldOptions extends KuiFieldControlOptions {
  /** Default `kui-field` size when no local `size` input is provided. */
  readonly size?: KuiSize;

  /** Hides automatically rendered Angular Signal Forms error messages by default. */
  readonly hideErrors?: boolean;
}
