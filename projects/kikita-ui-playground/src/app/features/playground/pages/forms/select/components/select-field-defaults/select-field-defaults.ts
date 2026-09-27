import { Component, inject, signal } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

import {
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiOptionDirective,
  kuiProvideFieldOptions,
  KuiSelectDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { SELECT_ROLES } from '../../constants';

/** Shows Select clearability falling back to shared Field options. */
@Component({
  selector: 'app-select-field-defaults',
  imports: [
    KuiDropdownComponent,
    KuiFieldComponent,
    KuiOptionDirective,
    KuiSelectDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  providers: [kuiProvideFieldOptions({ clearable: true })],
  templateUrl: './select-field-defaults.html',
})
export class SelectFieldDefaults {
  private readonly transloco = inject(TranslocoService);

  private readonly roleLabels = toSignal(
    this.transloco.selectTranslate<string[]>(
      SELECT_ROLES.map(({ value }) => `options.${value}`),
      {},
      { scope: 'select' },
    ),
    { initialValue: [] },
  );

  protected readonly roles = SELECT_ROLES;
  protected readonly value = signal<string | null>('owner');

  protected readonly roleLabel = (value: string): string => {
    const roleIndex = SELECT_ROLES.findIndex((role) => role.value === value);
    return this.roleLabels()[roleIndex] ?? value;
  };
}
