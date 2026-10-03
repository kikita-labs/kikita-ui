import type { ElementRef } from '@angular/core';
import {
  afterEveryRender,
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  effect,
  inject,
  input,
  model,
  signal,
  viewChild,
  ViewEncapsulation,
} from '@angular/core';

import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { injectKuiRootSizeDefault } from '../../providers/kui-defaults.util';
import type { KuiSize } from '../../types';
import { kuiNextId } from '../../utils/kui-id.util';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_CHEVRON_LEFT, KUI_GLYPH_CHEVRON_RIGHT } from '../icon/kui-chrome-glyphs';
import { KuiGlyphComponent } from '../icon/kui-glyph.component';
import { KuiTabDirective } from './kui-tab.directive';
import type { KuiTabsContext } from './kui-tabs-context.token';
import { KUI_TABS_CONTEXT } from './kui-tabs-context.token';

/** Visual treatment used by `kui-tabs`. */
export type KuiTabsVariant = 'line' | 'pill';
/** Layout direction of the tab list. */
export type KuiTabsOrientation = 'horizontal' | 'vertical';

/**
 * Tabs container. Manages selected state and keyboard navigation.
 * Projects `[kuiTab]` into the tablist and `[kuiTabPanel]` below it.
 *
 * @example
 * ```html
 * <kui-tabs value="general">
 *   <button kuiTab value="general">General</button>
 *   <button kuiTab value="advanced">Advanced</button>
 *   <div kuiTabPanel value="general">General settings</div>
 *   <div kuiTabPanel value="advanced">Advanced settings</div>
 * </kui-tabs>
 * ```
 */
@Component({
  imports: [KuiGlyphComponent],
  selector: 'kui-tabs',
  templateUrl: './kui-tabs.component.html',
  host: {
    class: 'kui-tabs',
    '[attr.data-kui-variant]': 'effectiveVariant()',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-orientation]': "effectiveOrientation() === 'vertical' ? 'vertical' : null",
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
  protected readonly previousGlyph = injectKuiGlyph({
    role: 'previous',
    slot: () => this.tabsDefaults()?.previousIcon,
    fallback: KUI_GLYPH_CHEVRON_LEFT,
  });

  protected readonly nextGlyph = injectKuiGlyph({
    role: 'next',
    slot: () => this.tabsDefaults()?.nextIcon,
    fallback: KUI_GLYPH_CHEVRON_RIGHT,
  });

  /**
   * Tab visual style: underline indicator (line) or pill background (pill). Defaults to
   * `defaults.tabs.variant`, then `line`.
   */
  readonly variant = input<KuiTabsVariant | undefined>();
  /** Tab size. Defaults to `defaults.tabs.size`, then the root size, then md. */
  readonly size = input<KuiSize | undefined>();
  /**
   * Layout direction of the tab list. Defaults to `defaults.tabs.orientation`, then horizontal.
   */
  readonly orientation = input<KuiTabsOrientation | undefined>();
  /**
   * Flips the tab list edge: horizontal tabs render panels above and the indicator on top;
   * vertical tabs render panels before the list and the indicator on the start edge.
   */
  readonly inverted = input(false, { transform: booleanAttribute });
  /** Whether tabs should expose `aria-controls` links to projected `kuiTabPanel` elements. */
  readonly controlsPanels = input(true, { transform: booleanAttribute });
  /** Currently selected tab value. Supports two-way binding via `[(value)]`. */
  readonly value = model<string>('');

  /**
   * Currently selected tab value.
   *
   * @deprecated Use `value` instead. Kept in sync with `value` for markup written before this was
   * renamed; planned for removal in the next major version.
   */
  readonly selected = model<string>('');

  private readonly tabItems = contentChildren(KuiTabDirective);
  private readonly scrollElRef = viewChild<ElementRef<HTMLElement>>('scrollEl');
  private readonly indicatorRef = viewChild<ElementRef<HTMLSpanElement>>('indicator');
  private readonly destroyRef = inject(DestroyRef);
  private readonly rootDefaultSize = injectKuiRootSizeDefault();
  private readonly tabsDefaults = inject(KuiDefaults).get('tabs');
  protected readonly t = injectKuiMessages('tabs');
  private readonly idBase = kuiNextId('kui-tabs');
  private indicatorFirstRender = true;
  private valueEffectSeeded = false;
  private selectedEffectSeeded = false;

  protected readonly canScrollLeft = signal(false);
  protected readonly canScrollRight = signal(false);

  protected readonly effectiveSize = computed(
    () => this.size() ?? this.tabsDefaults()?.size ?? this.rootDefaultSize() ?? 'md',
  );
  protected readonly effectiveVariant = computed(
    () => this.variant() ?? this.tabsDefaults()?.variant ?? 'line',
  );
  protected readonly effectiveOrientation = computed(
    () => this.orientation() ?? this.tabsDefaults()?.orientation ?? 'horizontal',
  );

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

    /**
     * Legacy markup binds only `[selected]`; new markup binds only `[(value)]`. Model inputs
     * aren't applied until after the constructor runs, so their real initial values are only
     * observable once these effects first execute -- seed whichever model is still at its `''`
     * default from the other's real initial value on that first run, before falling through to
     * the ordinary bidirectional sync below. Otherwise the two effects would each see a real value
     * on one side and the unset default on the other and clobber it back to `''` (see the same fix
     * in `kui-segmented`).
     */
    effect(() => {
      const v = this.value();

      if (!this.valueEffectSeeded) {
        this.valueEffectSeeded = true;
        if (!v && this.selected()) this.value.set(this.selected());
        return;
      }

      if (this.selected() !== v) this.selected.set(v);
    });

    effect(() => {
      const s = this.selected();

      if (!this.selectedEffectSeeded) {
        this.selectedEffectSeeded = true;
        if (!s && this.value()) this.selected.set(this.value());
        return;
      }

      if (this.value() !== s) this.value.set(s);
    });
  }

  select(value: string): void {
    this.value.set(value);
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

    if (this.effectiveVariant() !== 'line') {
      indicator.style.opacity = '0';
      return;
    }

    const item = this.tabItems().find((t) => t.value() === this.value());
    if (!item) {
      indicator.style.opacity = '0';
      return;
    }

    const el = item.elementRef.nativeElement;
    const vertical = this.effectiveOrientation() === 'vertical';
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

    const idx = tabs.findIndex((t) => t.value() === this.value());
    const nextKey = this.effectiveOrientation() === 'vertical' ? 'ArrowDown' : 'ArrowRight';
    const prevKey = this.effectiveOrientation() === 'vertical' ? 'ArrowUp' : 'ArrowLeft';

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
