import { Component, computed, inject, input, ViewEncapsulation } from '@angular/core';

import { KUI_CHEVRON_LEFT_D } from '../../utils/kui-chrome-icon-paths.util';
import { KUI_SPLITTER_CONTEXT } from './kui-splitter-context.token';

/**
 * Internal draggable separator rendered between two `kui-splitter-pane`s. Not exported from the
 * public barrel: `kui-splitter` creates and positions these itself (`ViewContainerRef` +
 * `Renderer2`, the same technique real-world libraries like angular-split use), since Angular
 * content projection has no declarative way to interleave generated elements between individually
 * projected sibling components.
 */
@Component({
  selector: 'kui-splitter-gutter',
  template: `
    <div aria-hidden="true" class="kui-splitter-gutter__line"></div>
    @if (collapseTarget() === null) {
      <div aria-hidden="true" class="kui-splitter-gutter__thumb"></div>
    } @else {
      <button
        type="button"
        class="kui-splitter-gutter__thumb-btn"
        tabindex="-1"
        [attr.aria-label]="collapseLabel()"
        (pointerdown)="$event.stopPropagation()"
        (click)="onCollapseClick()"
      >
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            [attr.transform]="chevronTransform()"
            d="${KUI_CHEVRON_LEFT_D}"
            stroke="currentColor"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    }
  `,
  host: {
    class: 'kui-splitter-gutter',
    role: 'separator',
    '[attr.aria-orientation]': 'ariaOrientation()',
    '[attr.aria-valuenow]': 'ariaValueNow()',
    '[attr.aria-valuemin]': 'ariaValueMin()',
    '[attr.aria-valuemax]': 'ariaValueMax()',
    '[attr.aria-controls]': 'beforePaneId()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.data-kui-orientation]': 'ariaOrientation()',
    '[attr.data-kui-dragging]': 'isDragging() ? "" : null',
    '(pointerdown)': 'onPointerDown($event)',
    '(pointermove)': 'onPointerMove($event)',
    '(pointerup)': 'onPointerUp()',
    '(lostpointercapture)': 'onPointerUp()',
    '(contextmenu)': '$event.preventDefault()',
    '(keydown)': 'onKeyDown($event)',
  },
  encapsulation: ViewEncapsulation.None,
})
/** Draggable separator between two panes. See the class-level example on `kui-splitter`. */
export class KuiSplitterGutterComponent {
  /** Index of this gutter -- fixed at creation; `kui-splitter` recreates gutters on pane changes. */
  readonly index = input.required<number>();

  private readonly context = inject(KUI_SPLITTER_CONTEXT);

  /** True while this specific gutter has the active pointer drag. */
  protected readonly isDragging = computed(() => this.context.draggingIndex() === this.index());

  protected readonly ariaOrientation = computed(() =>
    this.context.orientation() === 'horizontal' ? 'vertical' : 'horizontal',
  );

  protected readonly disabled = computed(() => this.context.disabled());

  private readonly beforePaneIndex = computed(() => this.index());
  private readonly afterPaneIndex = computed(() => this.index() + 1);

  protected readonly beforePaneId = computed(
    () => this.context.panes()[this.beforePaneIndex()]?.id ?? null,
  );

  protected readonly ariaValueNow = computed(() =>
    Math.round(this.context.sizeOf(this.beforePaneIndex())),
  );
  protected readonly ariaValueMin = computed(() =>
    Math.round(this.context.minSizeOf(this.beforePaneIndex())),
  );
  protected readonly ariaValueMax = computed(() =>
    Math.round(100 - this.context.minSizeOf(this.afterPaneIndex())),
  );

  protected readonly collapseTarget = computed(() => this.context.collapseTargetFor(this.index()));

  private readonly targetPaneIndex = computed(() => {
    const target = this.collapseTarget();
    if (target === 'before') return this.beforePaneIndex();
    if (target === 'after') return this.afterPaneIndex();
    return null;
  });

  protected readonly collapsed = computed(() => {
    const target = this.targetPaneIndex();
    return target === null ? false : this.context.isPaneCollapsed(target);
  });

  protected readonly collapseLabel = computed(() =>
    this.collapsed() ? 'Expand pane' : 'Collapse pane',
  );

  /**
   * Reuses the chevron-left chrome path for both axes, matching the design spec's own choice not
   * to add a dedicated "up" glyph: horizontal splitters rotate it 0/180deg (left/right), vertical
   * splitters rotate it 90/270deg (up/down) around the icon's own center.
   */
  protected readonly chevronTransform = computed(() => {
    const vertical = this.context.orientation() === 'vertical';
    const target = this.collapseTarget();
    const collapsed = this.collapsed();

    // "before" collapses toward the start (left/up); "after" collapses toward the end (right/down).
    // The icon points in the direction the click will move the pane, then flips once collapsed.
    let deg: number;
    if (vertical) {
      deg = target === 'before' ? (collapsed ? 90 : 270) : collapsed ? 270 : 90;
    } else {
      deg = target === 'before' ? (collapsed ? 0 : 180) : collapsed ? 180 : 0;
    }

    return `rotate(${deg} 12 12)`;
  });

  protected onCollapseClick(): void {
    const target = this.targetPaneIndex();
    if (target !== null) this.context.toggleCollapse(target);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (this.disabled()) return;
    this.context.onGutterPointerDown(this.index(), event);
  }

  protected onPointerMove(event: PointerEvent): void {
    if (!this.isDragging()) return;
    this.context.onGutterPointerMove(this.index(), event);
  }

  protected onPointerUp(): void {
    if (!this.isDragging()) return;
    this.context.onGutterPointerUp(this.index());
  }

  protected onKeyDown(event: KeyboardEvent): void {
    if (this.disabled()) return;
    this.context.onGutterKeyDown(this.index(), event);
  }
}
