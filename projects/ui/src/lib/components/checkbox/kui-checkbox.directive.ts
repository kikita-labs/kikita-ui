import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults.service';
import type { KuiSize } from '../../types';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import {
  createKuiControlSize,
  createKuiFieldWiring,
} from '../../utils/kui-field-control-wiring.util';
import { KuiFieldComponent } from '../field';

/** Applies Kikita UI checkbox styling and field ARIA wiring to native checkbox inputs. */
@Directive({
  selector: 'input[type=checkbox][kuiCheckbox]',
  host: {
    class: 'kui-checkbox',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-invalid]': 'invalid() ? "" : null',
    '[attr.id]': 'hostId()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-required]': 'ariaRequired()',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
  },
})
export class KuiCheckboxDirective {
  /** Checkbox size mapped to Kikita UI checkbox tokens. Defaults to `defaults.checkbox.size`, then the parent field, then the global `defaults.size`, then `'md'`. */
  readonly size = input<KuiSize | undefined>();

  /** Marks the checkbox as invalid outside a `kui-field` error state. */
  readonly invalidInput = input(false, { alias: 'invalid', transform: booleanAttribute });

  /** Explicit id override. If omitted inside `kui-field`, the field id is used. */
  readonly id = input<string | undefined>();

  private readonly field = inject(KuiFieldComponent, { optional: true, host: true });
  private readonly checkboxDefaults = inject(KuiDefaults).get('checkbox');
  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  private readonly wiring = createKuiFieldWiring({
    field: this.field,
    id: this.id,
    invalid: this.invalidInput,
  });

  protected readonly hostId = this.wiring.hostId;

  protected readonly effectiveSize = createKuiControlSize({
    field: this.field,
    local: this.size,
    keyDefault: computed(() => this.checkboxDefaults()?.size),
    root: this.rootDefaultSize,
  });

  protected readonly invalid = this.wiring.invalid;

  protected readonly describedBy = this.wiring.describedBy;

  protected readonly ariaRequired = this.wiring.ariaRequired;
}
