import type { KuiChipSize } from '../components/chip/kui-chip-size.type';

/** Defaults for `[kuiChip]`, set under the `chip` key of the component defaults. */
export interface KuiChipOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiChipSize;
}
