import { Directive, booleanAttribute, computed, inject, input } from '@angular/core';

import { KuiSize } from '../../types';
import { KuiFieldComponent } from '../field';

/** Applies Kikita UI multiline control styling and field ARIA wiring to native textarea elements. */
@Directive({
  selector: 'textarea[kuiTextarea]',
  host: {
    class: 'kui-input kui-textarea',
    '[attr.data-kui-size]': 'size()',
    '[attr.data-kui-invalid]': 'invalid() ? "" : null',
    '[attr.id]': 'hostId()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
  },
})
export class KuiTextareaDirective {
  /** Textarea size mapped to Kikita UI control height and spacing tokens. */
  readonly size = input<KuiSize>('md');

  /** Marks the textarea as invalid outside a `kui-field` error state. */
  readonly invalidInput = input(false, { alias: 'invalid', transform: booleanAttribute });

  /** Explicit id override. If omitted inside `kui-field`, the field id is used. */
  readonly id = input<string | undefined>();

  private readonly field = inject(KuiFieldComponent, { optional: true, host: true });

  protected readonly hostId = computed(() => this.id() ?? this.field?.controlId ?? null);

  protected readonly invalid = computed(
    () => this.invalidInput() || Boolean(this.field?.invalid()),
  );

  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);
}
