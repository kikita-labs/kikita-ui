import {
  Component,
  ElementRef,
  ViewChild,
  ViewEncapsulation,
  afterEveryRender,
  contentChildren,
  inject,
  input,
  model,
} from '@angular/core';

import { KuiSize } from '../../types';
import { KuiSegmentDirective } from './kui-segment.directive';
import { KUI_SEGMENTED_CONTEXT, KuiSegmentedContext } from './kui-segmented-context.token';

/**
 * Segmented control for selecting one option from a compact horizontal set.
 * Projects `[kuiSegment]` buttons inside a `role="radiogroup"` container.
 *
 * @example
 * ```html
 * <kui-segmented [(selected)]="view" aria-label="View mode">
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
    '[attr.data-kui-size]': 'size()',
    '(keydown)': 'onKeydown($event)',
  },
  providers: [
    {
      provide: KUI_SEGMENTED_CONTEXT,
      useFactory: () => inject(KuiSegmentedComponent),
    },
  ],
  encapsulation: ViewEncapsulation.None,
})
export class KuiSegmentedComponent implements KuiSegmentedContext {
  /** Currently selected segment value. */
  readonly selected = model<string>('');

  /** Control size. Defaults to md. */
  readonly size = input<KuiSize>('md');

  @ViewChild('thumb', { static: true })
  private thumbRef!: ElementRef<HTMLSpanElement>;

  private readonly segmentItems = contentChildren(KuiSegmentDirective);
  private firstRender = true;

  constructor() {
    afterEveryRender(() => this.positionThumb());
  }

  select(value: string): void {
    this.selected.set(value);
  }

  private positionThumb(): void {
    const thumb = this.thumbRef?.nativeElement;
    if (!thumb) return;

    const items = this.segmentItems();
    const item = items.find((s) => s.value() === this.selected());

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

    const idx = items.findIndex((s) => s.value() === this.selected());

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
