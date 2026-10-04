import { Component } from '@angular/core';

import { KuiField, KuiSlider } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-slider-endpoints',
  imports: [KuiField, KuiSlider, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './slider-endpoints.html',
  styleUrl: './slider-endpoints.scss',
})
export class SliderEndpoints {}
