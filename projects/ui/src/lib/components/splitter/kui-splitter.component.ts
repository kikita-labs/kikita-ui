import type { ComponentRef } from '@angular/core';
import {
  afterNextRender,
  booleanAttribute,
  Component,
  contentChildren,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  output,
  Renderer2,
  signal,
  ViewContainerRef,
  ViewEncapsulation,
} from '@angular/core';

import type { KuiSplitterCollapseTarget, KuiSplitterContext } from './kui-splitter-context.token';
import { KUI_SPLITTER_CONTEXT } from './kui-splitter-context.token';
import { KuiSplitterGutterComponent } from './kui-splitter-gutter.component';
import type { KuiSplitterOrientation } from './kui-splitter-orientation.type';
import { KuiSplitterPaneComponent } from './kui-splitter-pane.component';

const DEFAULT_GUTTER_PX = 8;
const ARROW_STEP = 2;
const ARROW_STEP_LARGE = 10;

/**
 * Draggable multi-pane layout: two or more `kui-splitter-pane`s separated by keyboard- and
 * pointer-resizable gutters, following the W3C ARIA APG Window Splitter Pattern. New pattern (not
 * among the kit's pre-existing primitives), built from Claude Design spec `08 Splitter.dc.html`.
 *
 * Gutters are not written by the consumer -- `kui-splitter` creates one `KuiSplitterGutterComponent`
 * per pair of adjacent panes and inserts it between their native elements with `Renderer2`
 * (`ViewContainerRef.createComponent` + `insertBefore`), the same technique real-world libraries
 * like angular-split use: Angular's content projection has no declarative way to interleave
 * generated elements between individually projected sibling components. Pane sizes are percentages
 * of the splitter's own immediate container, computed via `calc()` against the gutters' fixed pixel
 * width so panes and gutters always sum to exactly 100% with no drift; nesting one splitter inside
 * another pane needs no special API since each splitter only ever measures its own container.
 *
 * A custom thumb via a `[kuiSplitterThumb]` marker (projected inside a pane, replacing the default
 * grip/chevron) is not implemented in this iteration -- it would require relocating a projected DOM
 * node into the adjacent gutter, deferred as a documented gap.
 *
 * Gutters are only ever created in the browser, after the first render (`afterNextRender`), never
 * during SSR and never synchronously in the constructor: the server-rendered DOM has no gutters at
 * all (the template projects only panes), and inserting them any earlier than `afterNextRender`
 * makes Angular's hydration reconciliation see gutter elements where it expected only the projected
 * panes it rendered server-side, throwing `NG0500`. Pane sizes/`flex-basis`, unlike the gutters
 * themselves, are computed on both server and client so panes are correctly sized before hydration
 * -- only the imperative gutter DOM insertion is deferred.
 *
 * @example
 * ```html
 * <kui-splitter orientation="horizontal" (sizesChange)="onResize($event)">
 *   <kui-splitter-pane size="30" [minSize]="15" [collapsible]="true">
 *     <app-file-tree />
 *   </kui-splitter-pane>
 *   <kui-splitter-pane size="70" [minSize]="30">
 *     <app-editor />
 *   </kui-splitter-pane>
 * </kui-splitter>
 * ```
 */
@Component({
  selector: 'kui-splitter',
  template: `<ng-content />`,
  host: {
    class: 'kui-splitter',
    '[attr.data-kui-orientation]': 'orientation()',
    '[attr.data-kui-disabled]': 'disabled() ? "" : null',
  },
  providers: [
    {
      provide: KUI_SPLITTER_CONTEXT,
      useFactory: () => inject(KuiSplitterComponent),
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
/** Multi-pane resizable layout. See the class-level example above. */
export class KuiSplitterComponent implements KuiSplitterContext {
  /** Panel layout direction. Defaults to `horizontal`. */
  readonly orientation = input<KuiSplitterOrientation>('horizontal');

  /** Disables every gutter: removed from tab order and ignores drag. Defaults to `false`. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Emits the full sizes array (percentages) on every drag or keyboard resize. */
  readonly sizesChange = output<readonly number[]>();

  readonly panes = contentChildren(KuiSplitterPaneComponent);

  private readonly viewContainerRef = inject(ViewContainerRef);
  private readonly renderer = inject(Renderer2);
  private readonly hostRef = inject<ElementRef<HTMLElement>>(ElementRef);
  /**
   * `inject(ViewContainerRef)` in a component constructor anchors on the component's own position
   * in its *parent's* view, not inside its own element injector -- creating the gutter through it
   * without an explicit injector would build the gutter's injector chain from the splitter's
   * parent, never seeing `KUI_SPLITTER_CONTEXT` from this component's own `providers`. Passing this
   * (this component's own local injector) to `createComponent` fixes that.
   */
  private readonly injector = inject(Injector);
  private readonly destroyRef = inject(DestroyRef);

  readonly sizes = signal<readonly number[]>([]);
  readonly draggingIndex = signal<number | null>(null);

  private gutterRefs: ComponentRef<KuiSplitterGutterComponent>[] = [];
  private lastSizesPaneCount = -1;
  private lastGutterPaneCount = -1;
  private canManageGutters = false;
  private readonly collapsedSet = signal<ReadonlySet<number>>(new Set());
  private readonly prevSizeBeforeCollapse = new Map<number, number>();
  private dragStartSizes: readonly number[] = [];
  private dragStartClientPos = 0;
  private dragAvailablePx = 0;

  constructor() {
    // Runs on both server and client so panes have correct flex-basis before hydration -- see the
    // class-level doc comment for why gutter creation itself is deferred separately below.
    effect(() => {
      const panes = this.panes();
      if (panes.length === this.lastSizesPaneCount) return;
      this.lastSizesPaneCount = panes.length;
      this.sizes.set(this.computeInitialSizes(panes));
    });

    afterNextRender(() => {
      this.canManageGutters = true;
      this.syncGutters(this.panes());
    });

    effect(() => {
      const panes = this.panes();
      if (!this.canManageGutters || panes.length === this.lastGutterPaneCount) return;
      this.syncGutters(panes);
    });

    effect(() => {
      const sizes = this.sizes();
      const panes = this.panes();
      const gutterCount = Math.max(0, panes.length - 1);

      panes.forEach((pane, i) => {
        const size = sizes[i] ?? 0;
        const basis = `calc((100% - ${gutterCount} * var(--kui-splitter-gutter-size)) * ${size / 100})`;
        const el = pane.elementRef.nativeElement;
        this.renderer.setStyle(el, 'flex-basis', basis);
        this.renderer.setStyle(el, 'flex-grow', '0');
        this.renderer.setStyle(el, 'flex-shrink', '0');
      });
    });

    this.destroyRef.onDestroy(() => this.destroyGutters());
  }

  private syncGutters(panes: readonly KuiSplitterPaneComponent[]): void {
    this.lastGutterPaneCount = panes.length;
    this.rebuildGutters(panes);
  }

  sizeOf(paneIndex: number): number {
    return this.sizes()[paneIndex] ?? 0;
  }

  minSizeOf(paneIndex: number): number {
    return this.panes()[paneIndex]?.minSize() ?? 0;
  }

  collapseTargetFor(gutterIndex: number): KuiSplitterCollapseTarget {
    const panes = this.panes();
    if (panes.length < 2) return null;
    if (gutterIndex === 0 && panes[0]?.collapsible()) return 'before';
    if (gutterIndex === panes.length - 2 && panes[panes.length - 1]?.collapsible()) return 'after';
    return null;
  }

  isPaneCollapsed(paneIndex: number): boolean {
    return this.collapsedSet().has(paneIndex);
  }

  toggleCollapse(paneIndex: number): void {
    const panes = this.panes();
    const pane = panes[paneIndex];
    const isFirst = paneIndex === 0;
    const isLast = paneIndex === panes.length - 1;
    if (!pane?.collapsible() || panes.length < 2 || (!isFirst && !isLast)) return;

    const gutterIndex = isFirst ? 0 : panes.length - 2;
    const collapsing = !this.collapsedSet().has(paneIndex);

    if (collapsing) {
      this.prevSizeBeforeCollapse.set(paneIndex, this.sizeOf(paneIndex));
      if (isFirst) {
        this.resizeAdjacentPair(gutterIndex, this.minSizeOf(0) - this.sizeOf(0));
      } else {
        const rightIndex = gutterIndex + 1;
        this.resizeAdjacentPair(gutterIndex, this.sizeOf(rightIndex) - this.minSizeOf(rightIndex));
      }
    } else {
      const prev = this.prevSizeBeforeCollapse.get(paneIndex) ?? this.minSizeOf(paneIndex);
      this.prevSizeBeforeCollapse.delete(paneIndex);
      if (isFirst) {
        this.resizeAdjacentPair(gutterIndex, prev - this.sizeOf(0));
      } else {
        const rightIndex = gutterIndex + 1;
        this.resizeAdjacentPair(gutterIndex, this.sizeOf(rightIndex) - prev);
      }
    }

    this.collapsedSet.update((set) => {
      const next = new Set(set);
      if (collapsing) next.add(paneIndex);
      else next.delete(paneIndex);
      return next;
    });
  }

  onGutterPointerDown(gutterIndex: number, event: PointerEvent): void {
    if (this.disabled()) return;

    const gutterEl = this.gutterRefs[gutterIndex]?.location.nativeElement as
      | HTMLElement
      | undefined;
    if (!gutterEl) return;

    event.preventDefault();
    gutterEl.setPointerCapture?.(event.pointerId);
    gutterEl.focus();

    this.dragStartSizes = [...this.sizes()];
    this.dragStartClientPos = this.orientation() === 'horizontal' ? event.clientX : event.clientY;
    this.dragAvailablePx = this.measureAvailablePx();
    this.draggingIndex.set(gutterIndex);
  }

  onGutterPointerMove(gutterIndex: number, event: PointerEvent): void {
    if (this.draggingIndex() !== gutterIndex || this.dragAvailablePx <= 0) return;

    const pos = this.orientation() === 'horizontal' ? event.clientX : event.clientY;
    const deltaPx = pos - this.dragStartClientPos;
    const deltaPercent = (deltaPx / this.dragAvailablePx) * 100;
    this.applyDeltaFromDragStart(gutterIndex, deltaPercent);
  }

  onGutterPointerUp(gutterIndex: number): void {
    if (this.draggingIndex() !== gutterIndex) return;
    this.draggingIndex.set(null);
  }

  onGutterKeyDown(gutterIndex: number, event: KeyboardEvent): void {
    if (this.disabled()) return;

    const vertical = this.orientation() === 'vertical';
    const decreaseKey = vertical ? 'ArrowUp' : 'ArrowLeft';
    const increaseKey = vertical ? 'ArrowDown' : 'ArrowRight';
    const step = event.shiftKey ? ARROW_STEP_LARGE : ARROW_STEP;
    const rightIndex = gutterIndex + 1;

    switch (event.key) {
      case decreaseKey:
        event.preventDefault();
        this.resizeAdjacentPair(gutterIndex, -step);
        break;
      case increaseKey:
        event.preventDefault();
        this.resizeAdjacentPair(gutterIndex, step);
        break;
      case 'Home':
        event.preventDefault();
        this.resizeAdjacentPair(
          gutterIndex,
          this.minSizeOf(gutterIndex) - this.sizeOf(gutterIndex),
        );
        break;
      case 'End':
        event.preventDefault();
        this.resizeAdjacentPair(gutterIndex, this.sizeOf(rightIndex) - this.minSizeOf(rightIndex));
        break;
      case 'Enter': {
        event.preventDefault();
        const target = this.collapseTargetFor(gutterIndex);
        if (target === 'before') this.toggleCollapse(gutterIndex);
        else if (target === 'after') this.toggleCollapse(rightIndex);
        break;
      }
      case 'Escape':
        if (this.draggingIndex() === gutterIndex) {
          event.preventDefault();
          this.sizes.set([...this.dragStartSizes]);
          this.draggingIndex.set(null);
        }
        break;
    }
  }

  private applyDeltaFromDragStart(gutterIndex: number, deltaPercent: number): void {
    const start = this.dragStartSizes;
    const left = gutterIndex;
    const right = gutterIndex + 1;
    if (start[left] === undefined || start[right] === undefined) return;

    const leftMin = this.minSizeOf(left);
    const rightMin = this.minSizeOf(right);
    const delta = Math.min(Math.max(deltaPercent, leftMin - start[left]), start[right] - rightMin);

    const sizes = [...this.sizes()];
    sizes[left] = start[left] + delta;
    sizes[right] = start[right] - delta;
    this.sizes.set(sizes);
    this.sizesChange.emit(sizes);
  }

  private resizeAdjacentPair(gutterIndex: number, requestedDelta: number): void {
    const current = this.sizes();
    const left = gutterIndex;
    const right = gutterIndex + 1;
    if (current[left] === undefined || current[right] === undefined) return;

    const leftMin = this.minSizeOf(left);
    const rightMin = this.minSizeOf(right);
    const delta = Math.min(
      Math.max(requestedDelta, leftMin - current[left]),
      current[right] - rightMin,
    );
    if (delta === 0) return;

    const sizes = [...current];
    sizes[left] += delta;
    sizes[right] -= delta;
    this.sizes.set(sizes);
    this.sizesChange.emit(sizes);
  }

  private computeInitialSizes(panes: readonly KuiSplitterPaneComponent[]): number[] {
    const explicit = panes.map((p) => p.size());
    const explicitSum = explicit.reduce((sum: number, v) => sum + (v ?? 0), 0);
    const autoCount = explicit.filter((v) => v === undefined).length;
    const remaining = Math.max(0, 100 - explicitSum);
    const autoShare = autoCount > 0 ? remaining / autoCount : 0;
    return explicit.map((v) => v ?? autoShare);
  }

  private measureAvailablePx(): number {
    const hostEl = this.hostRef.nativeElement;
    const total = this.orientation() === 'horizontal' ? hostEl.clientWidth : hostEl.clientHeight;
    const gutterCount = Math.max(0, this.panes().length - 1);
    const gutterPx = this.resolveGutterSizePx(hostEl);
    return total - gutterCount * gutterPx;
  }

  private resolveGutterSizePx(hostEl: HTMLElement): number {
    const raw = getComputedStyle(hostEl).getPropertyValue('--kui-splitter-gutter-size');
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : DEFAULT_GUTTER_PX;
  }

  private rebuildGutters(panes: readonly KuiSplitterPaneComponent[]): void {
    this.destroyGutters();

    const hostEl = this.hostRef.nativeElement;
    for (let i = 0; i < panes.length - 1; i++) {
      const ref = this.viewContainerRef.createComponent(KuiSplitterGutterComponent, {
        injector: this.injector,
      });
      ref.setInput('index', i);
      ref.changeDetectorRef.detectChanges();
      this.renderer.insertBefore(
        hostEl,
        ref.location.nativeElement,
        panes[i + 1].elementRef.nativeElement,
      );
      this.gutterRefs.push(ref);
    }
  }

  private destroyGutters(): void {
    this.gutterRefs.forEach((ref) => ref.destroy());
    this.gutterRefs = [];
  }
}
