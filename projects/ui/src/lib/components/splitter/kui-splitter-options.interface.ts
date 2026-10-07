import type { KuiSplitterOrientation } from './kui-splitter-orientation.type';

/** Defaults for `kui-splitter` and its panes, set under the `splitter` key of the component defaults. */
export interface KuiSplitterOptions {
  /** Panel layout direction. */
  readonly orientation?: KuiSplitterOrientation;

  /** Minimum share of a pane, as a percentage from 0 to 100. */
  readonly minSize?: number;
}
