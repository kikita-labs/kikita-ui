import type { KuiSize } from '../types';

/** Defaults for `textarea[kuiTextarea]`, set under the `textarea` key of the component defaults. */
export interface KuiTextareaOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;
}
