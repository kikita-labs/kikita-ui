import { Component } from '@angular/core';

import { KuiButton, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { BUTTON_APPEARANCES, BUTTON_SHAPES, BUTTON_SIZES } from './constants';

@Component({
  selector: 'app-button-variant-matrix',
  imports: [KuiButton, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './button-variant-matrix.html',
  styleUrl: './button-variant-matrix.scss',
})
export class ButtonVariantMatrix {
  protected readonly buttonAppearances = BUTTON_APPEARANCES;
  protected readonly buttonShapes = BUTTON_SHAPES;
  protected readonly buttonSizes = BUTTON_SIZES;
}
