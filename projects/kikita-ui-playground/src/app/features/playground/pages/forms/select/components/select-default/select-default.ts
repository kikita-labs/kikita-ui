import { Component, computed, inject, signal } from '@angular/core';

import { toSignal } from '@angular/core/rxjs-interop';

import { KuiDropdown, KuiField, KuiOption, KuiSelect } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';

const DEFAULT_ROLE_VALUES = ['designer', 'engineer', 'manager'] as const;

/** Shows a minimally configured Select with its selected value status. */
@Component({
  selector: 'app-select-default',
  imports: [KuiDropdown, KuiField, KuiOption, KuiSelect, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './select-default.html',
  styleUrl: './select-default.scss',
})
export class SelectDefault {
  private readonly transloco = inject(TranslocoService);
  private readonly roleLabels = toSignal(
    this.transloco.selectTranslate<string[]>(
      DEFAULT_ROLE_VALUES.map((value) => `options.${value}`),
      {},
      { scope: 'select' },
    ),
    { initialValue: [] },
  );
  protected readonly value = signal<string | null>(null);
  protected readonly selectedLabel = computed(() => {
    const value = this.value();
    if (!value) return '—';

    const roleIndex = DEFAULT_ROLE_VALUES.findIndex((role) => role === value);
    return this.roleLabels()[roleIndex] ?? value;
  });
}
