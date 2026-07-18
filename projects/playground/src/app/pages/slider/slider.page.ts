import { Component, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { form, FormField, FormRoot, max, min } from '@angular/forms/signals';

import { KuiFieldComponent, KuiSliderDirective, KuiTooltipDirective } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-slider-page',
  imports: [
    KuiSliderDirective,
    KuiTooltipDirective,
    KuiFieldComponent,
    PlaygroundPanelComponent,
    FormsModule,
    FormField,
    FormRoot,
  ],
  templateUrl: './slider.page.html',
  styleUrl: './slider.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SliderPage {
  protected readonly liveValue = signal<number>(60);
  protected readonly settingsModel = signal({ volume: 60 });
  protected readonly settingsForm = form(this.settingsModel, (path) => {
    min(path.volume, 0);
    max(path.volume, 100);
  });
  protected volumeValue = 65;
  protected opacityValue = 40;
}
