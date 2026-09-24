import { Component } from '@angular/core';

import { KuiColorInputDirective, KuiFieldComponent } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Compares all supported color input sizes. */
@Component({
  selector: 'app-color-input-sizes',
  imports: [KuiColorInputDirective, KuiFieldComponent, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './color-input-sizes.html',
  styleUrl: './color-input-sizes.scss',
})
export class ColorInputSizes {}
