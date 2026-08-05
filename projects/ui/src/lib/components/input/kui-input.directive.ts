import { booleanAttribute, computed, Directive, inject, input } from '@angular/core';

import type { KuiSize } from '../../types';
import { injectKuiRootSizeDefault } from '../../utils/kui-defaults.util';
import { KuiFieldComponent } from '../field';

/** Applies Kikita UI input styling and field ARIA wiring to native input elements. */
@Directive({
  selector: 'input[kuiInput]',
  host: {
    class: 'kui-input',
    '[attr.data-kui-size]': 'effectiveSize()',
    '[attr.data-kui-invalid]': 'invalid() ? "" : null',
    '[attr.id]': 'hostId()',
    '[attr.aria-describedby]': 'describedBy()',
    '[attr.aria-invalid]': 'invalid() ? "true" : null',
  },
})
export class KuiInputDirective {
  /** Input size mapped to Kikita UI control height tokens. */
  readonly size = input<KuiSize | undefined>();

  /** Marks the input as invalid outside a `kui-field` error state. */
  readonly invalidInput = input(false, { alias: 'invalid', transform: booleanAttribute });

  /** Explicit id override. If omitted inside `kui-field`, the field id is used. */
  readonly id = input<string | undefined>();

  private readonly field = inject(KuiFieldComponent, { optional: true, host: true });
  private readonly rootDefaultSize = injectKuiRootSizeDefault();

  protected readonly hostId = computed(() => this.id() ?? this.field?.controlId ?? null);

  protected readonly effectiveSize = computed(
    () => this.size() ?? this.field?.effectiveSize() ?? this.rootDefaultSize ?? 'md',
  );

  /**
   * Signal Forms' native-control interop auto-wires this directive's `invalid` input straight
   * from the bound field's raw (untouched-gated) state whenever `[formField]` is present -- see
   * `KuiFieldComponent.hasSignalFormField`. In that case `invalidInput()` no longer reflects a
   * deliberate manual override, so it's ignored in favor of the field's own gated `invalid()`.
   */
  protected readonly invalid = computed(() =>
    this.field?.hasSignalFormField()
      ? Boolean(this.field.invalid())
      : this.invalidInput() || Boolean(this.field?.invalid()),
  );

  protected readonly describedBy = computed(() => this.field?.describedBy() ?? null);
}
