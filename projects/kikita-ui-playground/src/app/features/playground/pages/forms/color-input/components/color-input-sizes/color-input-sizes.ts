import { Component } from '@angular/core';

import { KuiColorInput, KuiField } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Compares all supported color input sizes. */
@Component({
  selector: 'app-color-input-sizes',
  imports: [KuiColorInput, KuiField, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './color-input-sizes.html',
  styleUrl: './color-input-sizes.scss',
})
export class ColorInputSizes {}
