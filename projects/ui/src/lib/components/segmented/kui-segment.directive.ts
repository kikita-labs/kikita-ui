import { booleanAttribute, computed, Directive, ElementRef, inject, input } from '@angular/core';

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
  selector: 'button[kuiSegment]',
  host: {
    class: 'kui-segment',
    role: 'radio',
    type: 'button',
    '[attr.aria-checked]': 'isSelected()',
    '[attr.aria-disabled]': 'isDisabled() ? "true" : null',
    '[attr.disabled]': 'isDisabled() ? "" : null',
    '[attr.tabindex]': 'isDisabled() ? -1 : isSelected() ? 0 : -1',
    '[attr.data-kui-selected]': 'isSelected() ? "" : null',
    '[class.kui-segment--disabled]': 'isDisabled()',
    '(click)': 'select()',
  },
})
export class KuiSegmentDirective {
  /** Value that identifies this segment. Must be unique within the segmented group. */
  readonly value = input<string>('');
  /** Whether this segment is disabled and skipped by keyboard navigation. */
  readonly disabled = input(false, { transform: booleanAttribute });

  private readonly context = inject(KUI_SEGMENTED_CONTEXT);
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly isDisabled = computed(
    () => this.disabled() || this.elementRef.nativeElement.hasAttribute('disabled'),
  );
  protected readonly isSelected = computed(() => this.context.selected() === this.value());

  /** @internal */
  select(): void {
    if (this.isDisabled()) return;
    this.context.select(this.value());
  }

  /** @internal */
  focusSegment(): void {
    this.elementRef.nativeElement.focus();
  }
}
