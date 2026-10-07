import { Component, signal } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import { KuiField, KuiSlider } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { SLIDER_FORM_DEFAULT_STATE } from './constants';
import { sliderFormSchema } from './helpers';
import type { SliderFormModel } from './interfaces';

@Component({
  selector: 'app-slider-field',
  imports: [FormField, KuiField, KuiSlider, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './slider-field.html',
  styleUrl: './slider-field.scss',
})
export class SliderField {
  protected readonly model = signal<SliderFormModel>(SLIDER_FORM_DEFAULT_STATE);
  protected readonly volumeForm = form(this.model, sliderFormSchema);
}
