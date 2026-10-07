import { Component } from '@angular/core';

import { KuiField, KuiSlider } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';
import type { KuiSliderColor, KuiSliderSize } from '@kikita-labs/ui';

@Component({
  selector: 'app-slider-variants',
  imports: [KuiField, KuiSlider, PlaygroundExampleCard, TranslocoPipe],
  templateUrl: './slider-variants.html',
  styleUrl: './slider-variants.scss',
})
export class SliderVariants {
  protected readonly variants: readonly {
    readonly size: KuiSliderSize;
    readonly color: KuiSliderColor;
    readonly label: string;
  }[] = [
    { size: 'sm', color: 'primary', label: 'slider.variants.smPrimary' },
    { size: 'sm', color: 'success', label: 'slider.variants.smSuccess' },
    { size: 'sm', color: 'danger', label: 'slider.variants.smDanger' },
    { size: 'sm', color: 'neutral', label: 'slider.variants.smNeutral' },
    { size: 'md', color: 'primary', label: 'slider.variants.mdPrimary' },
    { size: 'md', color: 'success', label: 'slider.variants.mdSuccess' },
    { size: 'md', color: 'danger', label: 'slider.variants.mdDanger' },
    { size: 'md', color: 'neutral', label: 'slider.variants.mdNeutral' },
    { size: 'lg', color: 'primary', label: 'slider.variants.lgPrimary' },
    { size: 'lg', color: 'success', label: 'slider.variants.lgSuccess' },
    { size: 'lg', color: 'danger', label: 'slider.variants.lgDanger' },
    { size: 'lg', color: 'neutral', label: 'slider.variants.lgNeutral' },
  ];
}
