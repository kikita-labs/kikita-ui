import { Component } from '@angular/core';

import { KuiField, KuiRadio, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Compares all documented Radio sizes and Field-size precedence. */
@Component({
  selector: 'app-radio-sizes',
  imports: [KuiField, KuiRadio, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './radio-sizes.html',
  styleUrl: './radio-sizes.scss',
})
export class RadioSizes {}
