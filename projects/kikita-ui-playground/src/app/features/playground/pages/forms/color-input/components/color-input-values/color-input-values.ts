import { Component } from '@angular/core';

import { KuiColorInput, KuiField } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows the documented hex and OKLCH text values. */
@Component({
  selector: 'app-color-input-values',
  imports: [KuiColorInput, KuiField, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './color-input-values.html',
  styleUrl: './color-input-values.scss',
})
export class ColorInputValues {}
