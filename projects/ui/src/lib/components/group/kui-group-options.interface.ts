import type { KuiSize } from '../../types';
import type { KuiGroupOrientation } from './kui-group-orientation.type';

/** Defaults for `[kuiGroup]`, set under the `group` key of the component defaults. */
export interface KuiGroupOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;

  /** Default orientation. */
  readonly orientation?: KuiGroupOrientation;

  /** Removes the gap between grouped controls. */
  readonly collapsed?: boolean;

  /** Rounds the outer corners of the group. */
  readonly rounded?: boolean;
}
