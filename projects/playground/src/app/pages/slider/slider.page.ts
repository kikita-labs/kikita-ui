import { Component, ViewEncapsulation, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { KuiFieldComponent, KuiSliderDirective } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-slider-page',
  imports: [KuiSliderDirective, KuiFieldComponent, PlaygroundPanelComponent, FormsModule],
  templateUrl: './slider.page.html',
  styleUrl: './slider.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SliderPage {
  protected readonly liveValue = signal<number>(60);
  protected volumeValue = 65;
  protected opacityValue = 40;
}
