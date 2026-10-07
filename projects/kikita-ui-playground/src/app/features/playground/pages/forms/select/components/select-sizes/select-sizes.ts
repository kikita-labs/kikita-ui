import { Component, signal } from '@angular/core';

import { KuiDropdown, KuiField, KuiOption, KuiSelect } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Compares the supported Field sizes used by Select. */
@Component({
  selector: 'app-select-sizes',
  imports: [KuiDropdown, KuiField, KuiOption, KuiSelect, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './select-sizes.html',
  styleUrl: './select-sizes.scss',
})
export class SelectSizes {
  protected readonly values = {
    xs: signal<string | null>(null),
    sm: signal<string | null>(null),
    md: signal<string | null>(null),
    lg: signal<string | null>(null),
  };
}
