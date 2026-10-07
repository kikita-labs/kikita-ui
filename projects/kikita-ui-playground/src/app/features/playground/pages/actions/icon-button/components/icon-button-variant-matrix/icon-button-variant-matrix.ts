import { Component } from '@angular/core';

import { KuiIconButton, KuiText } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { ICON_BUTTON_APPEARANCES, ICON_BUTTON_SHAPES, ICON_BUTTON_SIZES } from './constants';

/** Shows every supported icon button size, shape, and appearance combination. */
@Component({
  selector: 'app-icon-button-variant-matrix',
  imports: [KuiIconButton, KuiText, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './icon-button-variant-matrix.html',
  styleUrl: './icon-button-variant-matrix.scss',
})
export class IconButtonVariantMatrix {
  protected readonly appearances = ICON_BUTTON_APPEARANCES;
  protected readonly shapes = ICON_BUTTON_SHAPES;
  protected readonly sizes = ICON_BUTTON_SIZES;
}
