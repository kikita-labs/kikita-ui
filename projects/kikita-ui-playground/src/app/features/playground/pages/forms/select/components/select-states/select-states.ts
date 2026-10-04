import { Component, signal } from '@angular/core';

import { KuiDropdown, KuiField, KuiOption, KuiSelect } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows resting Select state examples, including a neutral keyboard focus target. */
@Component({
  selector: 'app-select-states',
  imports: [KuiDropdown, KuiField, KuiOption, KuiSelect, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './select-states.html',
  styleUrl: './select-states.scss',
})
export class SelectStates {
  protected readonly focusTargetValue = signal<string | null>(null);
  protected readonly readonlyValue = signal<string | null>('editor');
  protected readonly clearableValue = signal<string | null>('designer');
  protected readonly disabledValue = signal<string | null>('manager');
  protected readonly invalidValue = signal<string | null>(null);
}
