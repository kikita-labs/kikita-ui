import { Component } from '@angular/core';

import { KuiFieldComponent, KuiSliderDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-slider-endpoints',
  imports: [KuiFieldComponent, KuiSliderDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './slider-endpoints.html',
  styleUrl: './slider-endpoints.scss',
})
export class SliderEndpoints {}
