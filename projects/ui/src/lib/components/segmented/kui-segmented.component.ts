import type { ElementRef } from '@angular/core';
import {
  afterEveryRender,
  Component,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  model,
  output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import type {
  FormValueControl,
  ValidationError,
  WithOptionalFieldTree,
} from '@angular/forms/signals';

import type { KuiSize } from '../../types';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import { KuiSegmentDirective } from './kui-segment.directive';
import type { KuiSegmentedContext } from './kui-segmented-context.token';
import { KUI_SEGMENTED_CONTEXT } from './kui-segmented-context.token';

/**
 * Segmented control for selecting one option from a compact horizontal set.
 * Projects `[kuiSegment]` buttons inside a `role="radiogroup"` container.
 *
 * Implements {@link FormValueControl} for Signal Forms integration via `[formField]` on
 * `kui-segmented` itself. For standalone use, bind `[(value)]` directly.
 *
 * @example
 * ```html
 * <kui-segmented [(value)]="view" aria-label="View mode">
 *   <button kuiSegment value="list">List</button>
 *   <button kuiSegment value="grid">Grid</button>
 * </kui-segmented>
 * ```
 */
@Component({
  selector: 'kui-segmented',
  template: `<span class="kui-segmented__thumb" #thumb></span><ng-content select="[kuiSegment]" />`,
  host: {
    class: 'kui-segmented',
    role: 'radiogroup',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
    '(keydown)': 'onKeydown($event)',
  },
  providers: [{ provide: KUI_SEGMENTED_CONTEXT, useFactory: () => inject(KuiSegmentedComponent) }],
  encapsulation: ViewEncapsulation.None,
})
export class KuiSegmentedComponent implements KuiSegmentedContext, FormValueControl<string> {
  /** Currently selected segment value. Bound by `[formField]` or `[(value)]`. */
  readonly value = model<string>('');

  /**
   * Currently selected segment value.
   *
   * @deprecated Use `value` instead -- required to satisfy `FormValueControl` for `[formField]`
   * integration. Kept in sync with `value` for markup written before this existed; planned for
   * removal in the next major version.
   */
  readonly selected = model<string>('');

  /** Control size. Defaults to md. */
  readonly size = input<KuiSize | undefined>();

  /** Whether every segment is disabled. Set by `[formField]` or `[disabled]` directly. */
  readonly disabled = input(false);
  /** Whether the control has validation errors. Set by `[formField]`. */
  readonly invalid = input(false);
  /** Current validation errors. Set by `[formField]`. */
  readonly errors = input<readonly WithOptionalFieldTree<ValidationError>[]>([]);
  /** Whether the control has been touched. Set by `[formField]`. */
  readonly touched = input(false);
  /** Emitted when a segment is selected; marks the control as touched in the form system. */
  readonly touch = output<void>();

  @ViewChild('thumb', { static: true })
  private readonly thumbRef!: ElementRef<HTMLSpanElement>;

  private readonly segmentItems = contentChildren(KuiSegmentDirective);
  private readonly rootDefaultSize = injectKuiRootSizeDefault();
  private firstRender = true;
  private valueEffectSeeded = false;
  private selectedEffectSeeded = false;

  protected readonly effectiveSize = computed(() => this.size() ?? this.rootDefaultSize ?? 'md');

  readonly groupDisabled = computed(() => this.disabled());

  constructor() {
    afterEveryRender(() => this.positionThumb());

    /**
     * Legacy markup binds only `[selected]`; new markup binds only `[(value)]`/`[formField]`. Model
     * inputs aren't applied until after the constructor runs, so their real initial values are only
     * observable once these effects first execute -- seed whichever model is still at its `''`
     * default from the other's real initial value on that first run, before falling through to the
     * ordinary bidirectional sync below. Otherwise the two effects would each see a real value on
     * one side and the unset default on the other and clobber it back to `''`.
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
    if (this.disabled()) return;
    this.value.set(value);
    this.touch.emit();
  }

  private positionThumb(): void {
    const thumb = this.thumbRef?.nativeElement;
    if (!thumb) return;

    const items = this.segmentItems().filter((item) => !item.isDisabled());
    const item = items.find((s) => s.value() === this.value());

    if (!item) {
      thumb.style.opacity = '0';
      return;
    }

    const el = item.elementRef.nativeElement;

    if (this.firstRender) {
      this.firstRender = false;
      thumb.style.transition = 'none';
      thumb.style.width = `${el.offsetWidth}px`;
      thumb.style.transform = `translateX(${el.offsetLeft}px)`;
      thumb.style.opacity = '1';
      requestAnimationFrame(() => {
        thumb.style.transition = '';
      });
    } else {
      thumb.style.width = `${el.offsetWidth}px`;
      thumb.style.transform = `translateX(${el.offsetLeft}px)`;
      thumb.style.opacity = '1';
    }
  }

  /** @internal */
  protected onKeydown(event: KeyboardEvent): void {
    const items = this.segmentItems();
    if (!items.length) return;

    const idx = items.findIndex((s) => s.value() === this.value());

    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        items[(idx + 1) % items.length].focusSegment();
        items[(idx + 1) % items.length].select();
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        items[(idx - 1 + items.length) % items.length].focusSegment();
        items[(idx - 1 + items.length) % items.length].select();
        break;
      case 'Home':
        event.preventDefault();
        items[0].focusSegment();
        items[0].select();
        break;
      case 'End':
        event.preventDefault();
        items[items.length - 1].focusSegment();
        items[items.length - 1].select();
        break;
    }
  }
}
