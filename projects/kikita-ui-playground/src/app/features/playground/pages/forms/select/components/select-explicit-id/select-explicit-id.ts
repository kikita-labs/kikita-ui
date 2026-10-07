import { Component } from '@angular/core';

import { KuiDropdown, KuiField, KuiOption, KuiSelect, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows an explicit Select id with a matching native label. */
@Component({
  selector: 'app-select-explicit-id',
  imports: [
    KuiDropdown,
    KuiField,
    KuiOption,
    KuiSelect,
    KuiText,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './select-explicit-id.html',
  styleUrl: './select-explicit-id.scss',
})
export class SelectExplicitId {}
