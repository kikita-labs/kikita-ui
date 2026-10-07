import { Component } from '@angular/core';

import { KuiField, KuiSlider, KuiText, KuiTooltip } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-slider-tooltips',
  imports: [KuiField, KuiSlider, KuiText, KuiTooltip, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './slider-tooltips.html',
  styleUrl: './slider-tooltips.scss',
})
export class SliderTooltips {}
