import { Component } from '@angular/core';

import { KuiRadioDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Compares all documented Radio sizes. */
@Component({
  selector: 'app-radio-sizes',
  imports: [KuiRadioDirective, KuiTextDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './radio-sizes.html',
  styleUrl: './radio-sizes.scss',
})
export class RadioSizes {}
