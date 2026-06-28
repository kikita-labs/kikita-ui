import {
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  contentChildren,
  inject,
  input,
  model,
  signal,
  viewChild,
} from '@angular/core';

import { KuiSize } from '../../types';
import { KuiTabDirective } from './kui-tab.directive';
import { KUI_TABS_CONTEXT, KuiTabsContext } from './kui-tabs-context.token';

export type KuiTabsVariant = 'line' | 'pill';

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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M10 12L6 8l4-4"
              stroke="currentColor"
              stroke-width="1.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </button>
      }
      <div class="kui-tabs__scroll" #scrollEl (scroll)="updateScrollState()">
        <div class="kui-tabs__list" role="tablist" (keydown)="onKeydown($event)">
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
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path
              d="M6 4l4 4-4 4"
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
    '[attr.data-kui-size]': 'size()',
  },
  providers: [
    {
      provide: KUI_TABS_CONTEXT,
      useFactory: () => inject(KuiTabsComponent),
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class KuiTabsComponent implements KuiTabsContext {
  /** Tab visual style: underline indicator (line) or pill background (pill). */
  readonly variant = input<KuiTabsVariant>('line');
  /** Tab size. Defaults to md. */
  readonly size = input<KuiSize>('md');
  /** Currently selected tab value. */
  readonly selected = model<string>('');

  private readonly tabItems = contentChildren(KuiTabDirective);
  private readonly scrollElRef = viewChild<ElementRef<HTMLElement>>('scrollEl');
  private readonly destroyRef = inject(DestroyRef);
  private readonly idBase = `kui-tabs-${nextTabsId++}`;

  protected readonly canScrollLeft = signal(false);
  protected readonly canScrollRight = signal(false);

  constructor() {
    afterNextRender(() => {
      const el = this.scrollElRef()?.nativeElement;
      if (!el) return;
      this.updateScrollState();
      const ro = new ResizeObserver(() => this.updateScrollState());
      ro.observe(el);
      this.destroyRef.onDestroy(() => ro.disconnect());
    });
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

  private safeIdPart(value: string): string {
    return value.trim().replace(/[^a-zA-Z0-9_-]+/g, '-') || 'empty';
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    const tabs = this.tabItems();
    if (!tabs.length) return;

    const idx = tabs.findIndex((t) => t.value() === this.selected());

    switch (event.key) {
      case 'ArrowRight':
        event.preventDefault();
        tabs[(idx + 1) % tabs.length].focusTab();
        tabs[(idx + 1) % tabs.length].select();
        break;
      case 'ArrowLeft':
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
