import { Directive, booleanAttribute, computed, inject, input } from '@angular/core';

import { KuiSize } from '../../types';
import { KuiFieldComponent } from '../field';

/** Applies Kikita UI radio styling and field ARIA wiring to native radio inputs. */
@Directive({
  selector: 'input[type=radio][kuiRadio]',
  host: {
    class: 'kui-radio',
    '[attr.data-kui-size]': 'size()',
    '[attr.data-kui-invalid]': 'invalid() ? "" : null',
    '[attr.id]': 'hostId()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
  },
})
export class KuiRadioDirective {
  /** Radio size mapped to Kikita UI radio tokens. */
  readonly size = input<KuiSize>('md');

  /** Marks the radio as invalid outside a `kui-field` error state. */
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
