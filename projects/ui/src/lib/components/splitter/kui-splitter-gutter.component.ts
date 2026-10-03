import type { ElementRef } from '@angular/core';
import { Component, computed, inject, input, viewChild, ViewEncapsulation } from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KUI_GLYPH_CHEVRON_LEFT } from '../icon/kui-chrome-glyphs';
import { KuiGlyphComponent } from '../icon/kui-glyph.component';
import { KUI_SPLITTER_CONTEXT } from './kui-splitter-context.token';

/**
 * Internal draggable separator rendered between two `kui-splitter-pane`s. Not exported from the
 * public barrel: `kui-splitter` creates and positions these itself (`ViewContainerRef` +
 * `Renderer2`, the same technique real-world libraries like angular-split use), since Angular
 * content projection has no declarative way to interleave generated elements between individually
 * projected sibling components.
 */
@Component({
  imports: [KuiGlyphComponent],
  selector: 'kui-splitter-gutter',
  templateUrl: './kui-splitter-gutter.component.html',
  host: {
    class: 'kui-splitter-gutter',
    '[attr.data-kui-orientation]': 'ariaOrientation()',
    '[attr.data-kui-disabled]': 'disabled() ? "" : null',
    '[attr.data-kui-dragging]': 'isDragging() ? "" : null',
  },
  encapsulation: ViewEncapsulation.None,
})
/** Draggable separator between two panes. See the class-level example on `kui-splitter`. */
export class KuiSplitterGutterComponent {
  protected readonly chevronGlyph = KUI_GLYPH_CHEVRON_LEFT;

  /** Index of this gutter -- fixed at creation; `kui-splitter` recreates gutters on pane changes. */
  readonly index = input.required<number>();

  private readonly context = inject(KUI_SPLITTER_CONTEXT);
  private readonly t = injectKuiMessages('splitter');

  private readonly separator = viewChild.required<ElementRef<HTMLElement>>('separator');

  /** True while this specific gutter has the active pointer drag. */
  protected readonly isDragging = computed(() => this.context.draggingIndex() === this.index());

  protected readonly ariaOrientation = computed(() =>
    this.context.effectiveOrientation() === 'horizontal' ? 'vertical' : 'horizontal',
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
    this.collapsed() ? this.t().expandPane : this.t().collapsePane,
  );

  /**
   * Reuses the chevron-left chrome path for both axes, matching the design spec's own choice not
   * to add a dedicated "up" glyph: horizontal splitters rotate it 0/180deg (left/right), vertical
   * splitters rotate it 90/270deg (up/down) around the icon's own center. Rotation is a CSS
   * transform on the `<svg>`, so it works for any glyph.
   */
  protected readonly chevronTransform = computed(() => {
    const vertical = this.context.effectiveOrientation() === 'vertical';
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

    return `rotate(${deg}deg)`;
  });

  protected onCollapseClick(): void {
    const target = this.targetPaneIndex();
    if (target !== null) this.context.toggleCollapse(target);
  }

  protected onPointerDown(event: PointerEvent): void {
    if (this.disabled()) return;

    const separator = this.separator().nativeElement;
    event.preventDefault();
    separator.setPointerCapture?.(event.pointerId);
    separator.focus();
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
