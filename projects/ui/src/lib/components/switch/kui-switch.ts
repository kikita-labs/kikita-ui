import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults';
import { injectKuiRootSizeDefault } from '../../providers/kui-defaults.util';
import type { KuiSize } from '../../types';
import {
  createKuiControlSize,
  createKuiFieldWiring,
} from '../../utils/kui-field-control-wiring.util';
import { KUI_FIELD } from '../field/kui-field-host.token';

/** Applies Kikita UI switch styling and field ARIA wiring to native checkbox inputs. */
@Directive({
  selector: 'input[type=checkbox][kuiSwitch]',
  host: {
    class: 'kui-switch',
    role: 'switch',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-invalid]': 'invalid() ? "" : null',
    '[attr.id]': 'hostId()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-required]': 'ariaRequired()',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
  },
})
export class KuiSwitch {
  /** Switch size mapped to Kikita UI switch tokens. Defaults to `defaults.switch.size`, then the parent field, then the global `defaults.size`, then `'md'`. */
  readonly size = input<KuiSize | undefined>();

  /** Marks the switch as invalid outside a `kui-field` error state. */
  readonly invalidInput = input(false, { alias: 'invalid', transform: booleanAttribute });

  /** Explicit id override. If omitted inside `kui-field`, the field id is used. */
  readonly id = input<string | undefined>();

  private readonly field = inject(KUI_FIELD, { optional: true, host: true });
  private readonly switchDefaults = inject(KuiDefaults).get('switch');
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
    keyDefault: computed(() => this.switchDefaults()?.size),
    root: this.rootDefaultSize,
  });

  protected readonly invalid = this.wiring.invalid;

  protected readonly describedBy = this.wiring.describedBy;

  protected readonly ariaRequired = this.wiring.ariaRequired;
}
