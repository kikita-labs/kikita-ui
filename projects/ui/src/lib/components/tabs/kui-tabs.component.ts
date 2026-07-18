import type { ElementRef } from '@angular/core';
import {
  afterEveryRender,
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  inject,
  input,
  model,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import type { KuiSize } from '../../types';
import { KUI_CHEVRON_LEFT_D, KUI_CHEVRON_RIGHT_D } from '../../utils/kui-chrome-icon-paths.util';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import { KuiTabDirective } from './kui-tab.directive';
import type { KuiTabsContext } from './kui-tabs-context.token';
import { KUI_TABS_CONTEXT } from './kui-tabs-context.token';

/** Visual treatment used by `kui-tabs`. */
export type KuiTabsVariant = 'line' | 'pill';
/** Layout direction of the tab list. */
export type KuiTabsOrientation = 'horizontal' | 'vertical';

let nextTabsId = 0;

/**
 * Tabs container. Manages selected state and keyboard navigation.
 * Projects `[kuiTab]` into the tablist and `[kuiTabPanel]` below it.
 *
 * @example
 * ```html
 * <kui-tabs selected="general">
 *   <button kuiTab value="general">General</button>
 *   <button kuiTab value="advanced">Advanced</button>
 *   <div kuiTabPanel value="general">General settings</div>
 *   <div kuiTabPanel value="advanced">Advanced settings</div>
 * </kui-tabs>
 * ```
 */
@Component({
  selector: 'kui-tabs',
  template: `
    <div class="kui-tabs__scroll-wrap">
      @if (canScrollLeft()) {
        <button
          class="kui-tabs__scroll-btn kui-tabs__scroll-btn--left"
          type="button"
          (click)="scrollBy(-200)"
          aria-label="Scroll tabs left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="${KUI_CHEVRON_LEFT_D}"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      }
      <div class="kui-tabs__scroll" #scrollEl (scroll)="updateScrollState()">
        <div
          class="kui-tabs__list"
          role="tablist"
          [attr.aria-orientation]="orientation()"
          (keydown)="onKeydown($event)"
        >
          <span class="kui-tab-indicator" #indicator></span>
          <ng-content select="[kuiTab]" />
        </div>
      </div>
      @if (canScrollRight()) {
        <button
          class="kui-tabs__scroll-btn kui-tabs__scroll-btn--right"
          type="button"
          (click)="scrollBy(200)"
          aria-label="Scroll tabs right"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="${KUI_CHEVRON_RIGHT_D}"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      }
    </div>
    <ng-content select="[kuiTabPanel]" />
  `,
  host: {
    class: 'kui-tabs',
    '[attr.data-kui-variant]': 'variant()',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-orientation]': "orientation() === 'vertical' ? 'vertical' : null",
    '[attr.data-kui-inverted]': 'inverted() ? "" : null',
  },
  providers: [
    {
      provide: KUI_TABS_CONTEXT,
      useFactory: () => inject(KuiTabsComponent),
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
/** Coordinates tab triggers and tab panels with accessible selection state. */
export class KuiTabsComponent implements KuiTabsContext {
  /** Tab visual style: underline indicator (line) or pill background (pill). */
  readonly variant = input<KuiTabsVariant>('line');
  /** Tab size. Defaults to md. */
  readonly size = input<KuiSize | undefined>();
  /** Layout direction of the tab list. Defaults to horizontal. */
  readonly orientation = input<KuiTabsOrientation>('horizontal');
  /**
   * Flips the tab list edge: horizontal tabs render panels above and the indicator on top;
   * vertical tabs render panels before the list and the indicator on the start edge.
   */
  readonly inverted = input(false, { transform: booleanAttribute });
  /** Whether tabs should expose `aria-controls` links to projected `kuiTabPanel` elements. */
  readonly controlsPanels = input(true, { transform: booleanAttribute });
  /** Currently selected tab value. */
  readonly selected = model<string>('');

  private readonly tabItems = contentChildren(KuiTabDirective);
  private readonly scrollElRef = viewChild<ElementRef<HTMLElement>>('scrollEl');
  private readonly indicatorRef = viewChild<ElementRef<HTMLSpanElement>>('indicator');
  private readonly destroyRef = inject(DestroyRef);
  private readonly rootDefaultSize = injectKuiRootSizeDefault();
  private readonly idBase = `kui-tabs-${nextTabsId++}`;
  private indicatorFirstRender = true;

  protected readonly canScrollLeft = signal(false);
  protected readonly canScrollRight = signal(false);
  protected readonly effectiveSize = computed(() => this.size() ?? this.rootDefaultSize ?? 'md');

  constructor() {
    afterNextRender(() => {
      const el = this.scrollElRef()?.nativeElement;
      if (!el) return;
      this.updateScrollState();
      const ro = new ResizeObserver(() => this.updateScrollState());
      ro.observe(el);
      this.destroyRef.onDestroy(() => ro.disconnect());
    });

    afterEveryRender(() => this.positionIndicator());
  }

  select(value: string): void {
    this.selected.set(value);
  }

  tabId(value: string): string {
    return `${this.idBase}-tab-${this.safeIdPart(value)}`;
  }

  panelId(value: string): string {
    return `${this.idBase}-panel-${this.safeIdPart(value)}`;
  }

  protected updateScrollState(): void {
    const el = this.scrollElRef()?.nativeElement;
    if (!el) return;
    this.canScrollLeft.set(el.scrollLeft > 0);
    this.canScrollRight.set(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  protected scrollBy(delta: number): void {
    this.scrollElRef()?.nativeElement.scrollBy({ left: delta, behavior: 'smooth' });
  }

  private positionIndicator(): void {
    const indicator = this.indicatorRef()?.nativeElement;
    if (!indicator) return;

    if (this.variant() !== 'line') {
      indicator.style.opacity = '0';
      return;
    }

    const item = this.tabItems().find((t) => t.value() === this.selected());
    if (!item) {
      indicator.style.opacity = '0';
      return;
    }

    const el = item.elementRef.nativeElement;
    const vertical = this.orientation() === 'vertical';
    const size = vertical ? el.offsetHeight : el.offsetWidth;
    const offset = vertical ? el.offsetTop : el.offsetLeft;

    const isFirstRender = this.indicatorFirstRender;
    if (isFirstRender) {
      this.indicatorFirstRender = false;
      indicator.style.transition = 'none';
    }

    if (vertical) {
      indicator.style.height = `${size}px`;
      indicator.style.width = '';
      indicator.style.transform = `translateY(${offset}px)`;
    } else {
      indicator.style.width = `${size}px`;
      indicator.style.height = '';
      indicator.style.transform = `translateX(${offset}px)`;
    }
    indicator.style.opacity = '1';

    if (isFirstRender) {
      requestAnimationFrame(() => {
        indicator.style.transition = '';
      });
    }
  }

  private safeIdPart(value: string): string {
    return value.trim().replace(/[^a-zA-Z0-9_-]+/g, '-') || 'empty';
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    const tabs = this.tabItems();
    if (!tabs.length) return;

    const idx = tabs.findIndex((t) => t.value() === this.selected());
    const nextKey = this.orientation() === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const prevKey = this.orientation() === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

    switch (event.key) {
      case nextKey:
        event.preventDefault();
        tabs[(idx + 1) % tabs.length].focusTab();
        tabs[(idx + 1) % tabs.length].select();
        break;
      case prevKey:
        event.preventDefault();
        tabs[(idx - 1 + tabs.length) % tabs.length].focusTab();
        tabs[(idx - 1 + tabs.length) % tabs.length].select();
        break;
      case 'Home':
        event.preventDefault();
        tabs[0].focusTab();
        tabs[0].select();
        break;
      case 'End':
        event.preventDefault();
        tabs[tabs.length - 1].focusTab();
        tabs[tabs.length - 1].select();
        break;
    }
  }
}
