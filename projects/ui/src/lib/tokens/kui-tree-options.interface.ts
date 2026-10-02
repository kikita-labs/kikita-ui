import type { KuiTreeMode } from '../components/tree/kui-tree-node.interface';
import type { KuiSize } from '../types';

/** Defaults for `kui-tree`, set under the `tree` key of the component defaults. */
export interface KuiTreeOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;

  /** Default mode. */
  readonly mode?: KuiTreeMode;
}
