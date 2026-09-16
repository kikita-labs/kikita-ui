import type { Signal } from '@angular/core';
import { InjectionToken } from '@angular/core';

import type { KuiSplitterOrientation } from './kui-splitter-orientation.type';
import type { KuiSplitterPaneComponent } from './kui-splitter-pane.component';

/** Which adjacent pane a gutter's one-touch collapse button controls, if any. */
export type KuiSplitterCollapseTarget = 'before' | 'after' | null;

/** Shared context injected by KuiSplitterComponent into its internal gutter components. */
export interface KuiSplitterContext {
  readonly orientation: Signal<KuiSplitterOrientation>;
  readonly disabled: Signal<boolean>;
  readonly panes: Signal<readonly KuiSplitterPaneComponent[]>;
  readonly sizes: Signal<readonly number[]>;
  readonly draggingIndex: Signal<number | null>;

  sizeOf(paneIndex: number): number;
  minSizeOf(paneIndex: number): number;
  collapseTargetFor(gutterIndex: number): KuiSplitterCollapseTarget;
  isPaneCollapsed(paneIndex: number): boolean;

  onGutterPointerDown(gutterIndex: number, event: PointerEvent): void;
  onGutterPointerMove(gutterIndex: number, event: PointerEvent): void;
  onGutterPointerUp(gutterIndex: number): void;
  onGutterKeyDown(gutterIndex: number, event: KeyboardEvent): void;
  toggleCollapse(paneIndex: number): void;
}

/** Injection token used by internal gutter components to access their parent splitter state. */
export const KUI_SPLITTER_CONTEXT = new InjectionToken<KuiSplitterContext>('KuiSplitterContext');
