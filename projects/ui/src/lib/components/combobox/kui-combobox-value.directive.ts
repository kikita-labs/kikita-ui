import { Directive, inject, OnDestroy, TemplateRef } from '@angular/core';

import { KuiFieldComponent } from '../field/kui-field.component';

/** Template context exposed by `ng-template[kuiComboboxValue]`. */
export interface KuiComboboxValueContext<T = unknown> {
  /** Selected item passed as the implicit template value. */
  readonly $implicit: T;
  /** Selected item. */
  readonly item: T;
  /** Display label resolved by `labelFn`. */
  readonly label: string;
  /** Removes the selected item from the multiple combobox value. */
  readonly remove: () => void;
}

/**
 * Marks a custom selected-value template for `kui-combobox`.
 *
 * Use this only when the default selected chips are not enough.
 */
@Directive({ selector: 'ng-template[kuiComboboxValue]' })
export class KuiComboboxValueDirective<T = unknown> implements OnDestroy {
  /** Template reference consumed by `kui-combobox`. */
  readonly templateRef = inject<TemplateRef<KuiComboboxValueContext<T>>>(TemplateRef);

  private readonly field = inject(KuiFieldComponent, { optional: true });

  constructor() {
    this.field?.setComboboxValueTemplate(this.templateRef as TemplateRef<unknown>);
  }

  ngOnDestroy(): void {
    if (this.field?.comboboxValueTemplate() === this.templateRef) {
      this.field.setComboboxValueTemplate(null);
    }
  }
}
