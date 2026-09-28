import { Component } from '@angular/core';

import { KuiFieldComponent, KuiRadioDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Compares all documented Radio sizes and Field-size precedence. */
@Component({
  selector: 'app-radio-sizes',
  imports: [
    KuiFieldComponent,
    KuiRadioDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './radio-sizes.html',
  styleUrl: './radio-sizes.scss',
})
export class RadioSizes {}
