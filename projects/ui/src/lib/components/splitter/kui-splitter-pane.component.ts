import {
  booleanAttribute,
  Component,
  computed,
  ElementRef,
  inject,
  input,
  numberAttribute,
} from '@angular/core';

import { KUI_SPLITTER_CONTEXT } from './kui-splitter-context.token';

let nextPaneId = 0;

/**
 * One resizable pane inside `kui-splitter`. Projects arbitrary content; `kui-splitter` itself owns
 * the live size (drag/keyboard both write back through it), so `size` here is only the initial/
 * requested share, not a live-bound value.
 *
 * @example
 * ```html
 * <kui-splitter>
 *   <kui-splitter-pane size="30" [minSize]="15" [collapsible]="true">...</kui-splitter-pane>
 *   <kui-splitter-pane size="70">...</kui-splitter-pane>
 * </kui-splitter>
 * ```
 */
@Component({
  selector: 'kui-splitter-pane',
  template: `<ng-content />`,
  host: {
    class: 'kui-splitter-pane',
  },
})
/** A single resizable pane. See the class-level example above. */
export class KuiSplitterPaneComponent {
  /**
   * Requested initial share of the splitter, as a percentage. Optional -- panes without an
   * explicit `size` split the remaining space evenly among themselves, the same way flex items
   * without an explicit basis share leftover space.
   */
  readonly size = input<number | undefined>(undefined, { transform: numberAttributeOrUndefined });

  /**
   * Minimum share, as a percentage. Defaults to `10`, which is enough to stop an accidental drag
   * or keyboard step from collapsing the pane to nothing; override only when a different floor is
   * actually needed.
   */
  readonly minSize = input(10, { transform: numberAttribute });

  /**
   * Renders a one-touch collapse button on the adjacent gutter. Only meaningful on the first or
   * last pane in the row -- collapsing a middle pane is not supported (matches the design spec's
   * own scope cut; a middle pane's flag is silently ignored).
   */
  readonly collapsible = input(false, { transform: booleanAttribute });

  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly context = inject(KUI_SPLITTER_CONTEXT);

  /** Stable id used for the adjacent gutter's `aria-controls`. */
  readonly id = `kui-splitter-pane-${nextPaneId++}`;

  private readonly index = computed(() => this.context.panes().indexOf(this));

  /** Current live size, as a percentage -- reflects drag/keyboard changes, not just `size()`. */
  readonly currentSize = computed(() => this.context.sizeOf(this.index()));

  /** True while this pane is collapsed to its `minSize` via the one-touch button or Enter/Home/End. */
  readonly collapsed = computed(() => this.context.isPaneCollapsed(this.index()));

  /** Toggles collapse state. No-op when `collapsible` is `false` or this is a middle pane. */
  toggleCollapse(): void {
    this.context.toggleCollapse(this.index());
  }
}

function numberAttributeOrUndefined(value: unknown): number | undefined {
  if (value === undefined || value === null || value === '') return undefined;
  const parsed = typeof value === 'number' ? value : parseFloat(String(value));
  return Number.isNaN(parsed) ? undefined : parsed;
}
