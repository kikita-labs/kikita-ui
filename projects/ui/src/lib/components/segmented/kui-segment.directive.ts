import { Directive, ElementRef, computed, inject, input } from '@angular/core';

import { KUI_SEGMENTED_CONTEXT } from './kui-segmented-context.token';

/**
 * Segment item inside a `kui-segmented` container.
 * Use on `<button>` elements projected into `kui-segmented`.
 *
 * @example
 * ```html
 * <button kuiSegment value="list">List</button>
 * ```
 */
@Directive({
  selector: '[kuiSegment]',
  host: {
    class: 'kui-segment',
    role: 'radio',
    type: 'button',
    '[attr.aria-checked]': 'isSelected()',
    '[attr.tabindex]': 'isSelected() ? 0 : -1',
    '[attr.data-kui-selected]': 'isSelected() ? "" : null',
    '(click)': 'select()',
  },
})
export class KuiSegmentDirective {
  /** Value that identifies this segment. Must be unique within the segmented group. */
  readonly value = input<string>('');

  private readonly context = inject(KUI_SEGMENTED_CONTEXT);
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly isSelected = computed(() => this.context.selected() === this.value());

  /** @internal */
  select(): void {
    this.context.select(this.value());
  }

  /** @internal */
  focusSegment(): void {
    this.el.nativeElement.focus();
  }
}
