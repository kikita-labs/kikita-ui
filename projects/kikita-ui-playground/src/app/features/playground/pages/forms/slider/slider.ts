import { Component } from '@angular/core';

import { KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

import {
  SliderDefault,
  SliderEndpoints,
  SliderField,
  SliderStates,
  SliderTooltips,
  SliderVariants,
} from './components';

@Component({
  selector: 'app-slider',
  imports: [
    KuiText,
    SliderDefault,
    SliderEndpoints,
    SliderField,
    SliderStates,
    SliderTooltips,
    SliderVariants,
    TranslocoPipe,
  ],
  templateUrl: './slider.html',
  styleUrl: './slider.scss',
})
export class Slider {}
