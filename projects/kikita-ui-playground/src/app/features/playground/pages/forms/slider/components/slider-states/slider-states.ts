import { Component } from '@angular/core';

import { KuiFieldComponent, KuiSliderDirective, KuiTextDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-slider-states',
  imports: [
    KuiFieldComponent,
    KuiSliderDirective,
    KuiTextDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './slider-states.html',
  styleUrl: './slider-states.scss',
})
export class SliderStates {}
