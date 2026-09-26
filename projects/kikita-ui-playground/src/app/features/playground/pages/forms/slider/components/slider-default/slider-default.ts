import { Component } from '@angular/core';

import { KuiFieldComponent, KuiSliderDirective } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

@Component({
  selector: 'app-slider-default',
  imports: [KuiFieldComponent, KuiSliderDirective, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './slider-default.html',
  styleUrl: './slider-default.scss',
})
export class SliderDefault {}
