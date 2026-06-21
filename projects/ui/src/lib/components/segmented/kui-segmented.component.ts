import { Component, ViewEncapsulation, contentChildren, inject, model } from '@angular/core';

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
  template: `<ng-content select="[kuiSegment]" />`,
  host: {
    class: 'kui-segmented',
    role: 'radiogroup',
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

  private readonly segmentItems = contentChildren(KuiSegmentDirective);

  select(value: string): void {
    this.selected.set(value);
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
