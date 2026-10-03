import type { KuiSize } from '../../types';
import type { KuiIconGlyph } from '../icon/kui-icon-glyph.type';
import type { KuiTreeMode } from './kui-tree-node.interface';

/** Defaults for `kui-tree`, set under the `tree` key of the component defaults. */
export interface KuiTreeOptions {
  /** Component size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiSize;

  /** Default mode. */
  readonly mode?: KuiTreeMode;
  /** Icon of the node toggle. Takes precedence over `defaults.icons.disclosure`. */
  readonly disclosureIcon?: KuiIconGlyph;
}
