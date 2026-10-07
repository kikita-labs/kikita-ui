import { Component } from '@angular/core';

import { KuiField, KuiSlider } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-slider-default',
  imports: [KuiField, KuiSlider, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './slider-default.html',
  styleUrl: './slider-default.scss',
})
export class SliderDefault {}
