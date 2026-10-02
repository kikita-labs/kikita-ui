import type { KuiSize } from '../types';

/** Defaults for `[kuiLoader]`, set under the `loader` key of the component defaults. */
export interface KuiLoaderOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;
}
