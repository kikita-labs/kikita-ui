import { Component } from '@angular/core';

import {
  KuiFieldComponent,
  KuiSliderDirective,
  KuiTextDirective,
  KuiTooltipDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-slider-tooltips',
  imports: [
    KuiFieldComponent,
    KuiSliderDirective,
    KuiTextDirective,
    KuiTooltipDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './slider-tooltips.html',
  styleUrl: './slider-tooltips.scss',
})
export class SliderTooltips {}
