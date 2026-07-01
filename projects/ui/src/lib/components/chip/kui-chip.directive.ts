import {
  Directive,
  ElementRef,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
} from '@angular/core';

import { KuiChipAppearance } from './kui-chip-appearance.type';
import { KuiChipSize } from './kui-chip-size.type';

/** Applies Kikita UI chip styling to selected values, filters, tags, and metadata. */
@Directive({
  selector: '[kuiChip]',
  host: {
    class: 'kui-chip',
    '[attr.data-kui-appearance]': 'appearance()',
    '[attr.data-kui-size]': 'size()',
    '[class.kui-chip--disabled]': 'disabled()',
    '[class.kui-chip--invalid]': 'invalid()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.disabled]': 'disabledAttr()',
  },
})
export class KuiChipDirective {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Visual chip treatment mapped to Kikita UI semantic tokens. */
  readonly appearance = input<KuiChipAppearance>('neutral');

  /** Chip size preset. Use `sm` inside Select and Combobox controls. */
  readonly size = input<KuiChipSize>('md');

  /** Marks the chip disabled and makes its remove action inert. */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** Applies invalid border treatment for context-specific invalid selected values. */
  readonly invalid = input(false, { transform: booleanAttribute });

  /** Emitted when a nested `button[kuiChipRemove]` is activated. */
  readonly removed = output<void>();

  protected readonly disabledAttr = computed(() => {
    const tag = this.elementRef.nativeElement.tagName.toLowerCase();
    return this.disabled() && tag === 'button' ? '' : null;
  });

  /** @internal Emits the public remove event for a nested remove directive. */
  _emitRemoved(): void {
    if (!this.disabled()) {
      this.removed.emit();
    }
  }
}
