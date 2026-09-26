import { Component, inject, signal } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

import {
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiOptionDirective,
  kuiProvideSelectOptions,
  KuiSelectDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

import { SELECT_ROLES } from '../../constants';

/** Shows Select options inherited from a page-private provider scope. */
@Component({
  selector: 'app-select-provider-defaults',
  imports: [
    KuiDropdownComponent,
    KuiFieldComponent,
    KuiOptionDirective,
    KuiSelectDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  providers: [kuiProvideSelectOptions({ clearable: true, maxVisibleChips: 2 })],
  templateUrl: './select-provider-defaults.html',
})
export class SelectProviderDefaults {
  private readonly transloco = inject(TranslocoService);

  protected readonly roles = SELECT_ROLES;
  private readonly roleLabels = toSignal(
    this.transloco.selectTranslate<string[]>(
      SELECT_ROLES.map(({ value }) => `options.${value}`),
      {},
      { scope: 'select' },
    ),
    { initialValue: [] },
  );

  protected readonly value = signal<readonly string[]>(['owner', 'editor', 'reviewer', 'viewer']);

  protected readonly roleLabel = (value: string): string => {
    const roleIndex = SELECT_ROLES.findIndex((role) => role.value === value);
    return this.roleLabels()[roleIndex] ?? value;
  };
}
