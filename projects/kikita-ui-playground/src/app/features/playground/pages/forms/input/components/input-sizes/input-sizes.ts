import { Component } from '@angular/core';

import { KuiFieldComponent, KuiInputDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Compares all four supported input sizes. */
@Component({
  selector: 'app-input-sizes',
  imports: [KuiFieldComponent, KuiInputDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './input-sizes.html',
  styleUrl: './input-sizes.scss',
})
export class InputSizes {}
