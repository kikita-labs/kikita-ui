import { Directive, inject, OnDestroy, TemplateRef } from '@angular/core';

import { KuiFieldComponent } from '../field/kui-field.component';

/** Template context exposed by `ng-template[kuiSelectValue]`. */
export interface KuiSelectValueContext<T = unknown> {
  /** Selected item passed as the implicit template value. */
  readonly $implicit: T;
  /** Selected item. */
  readonly item: T;
  /** Display label resolved by `kuiLabelFn`. */
  readonly label: string;
  /** Removes the selected item from the multiple select value. */
  readonly remove: () => void;
}

/**
 * Marks a custom selected-value template for `input[kuiSelect]`.
 *
 * The template is resolved through the nearest `kui-field`, so it can be declared
 * as a sibling of the native `input[kuiSelect]`.
 *
 * @example
 * ```html
 * <kui-field label="Roles">
 *   <input kuiSelect multiple />
 *   <ng-template kuiSelectValue let-item let-label="label" let-remove="remove">
 *     <span kuiChip>{{ label }} <button kuiChipRemove (click)="remove()"></button></span>
 *   </ng-template>
 * </kui-field>
 * ```
 */
@Directive({ selector: 'ng-template[kuiSelectValue]' })
export class KuiSelectValueDirective<T = unknown> implements OnDestroy {
  /** Template reference consumed by `input[kuiSelect]`. */
  readonly templateRef = inject<TemplateRef<KuiSelectValueContext<T>>>(TemplateRef);

  private readonly field = inject(KuiFieldComponent, { optional: true });

  constructor() {
    this.field?.setSelectValueTemplate(this.templateRef as TemplateRef<unknown>);
  }

  ngOnDestroy(): void {
    if (this.field?.selectValueTemplate() === this.templateRef) {
      this.field.setSelectValueTemplate(null);
    }
  }
}
