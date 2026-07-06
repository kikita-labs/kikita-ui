import { Component, ViewEncapsulation, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { KuiColorInputDirective, KuiFieldComponent } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-color-input-page',
  imports: [KuiColorInputDirective, KuiFieldComponent, FormsModule, PlaygroundPanelComponent],
  templateUrl: './color-input.page.html',
  styleUrl: './color-input.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class ColorInputPage {
  protected readonly livePrimary = signal('#5b4fe0');
  protected readonly liveOklch = signal('oklch(0.52 0.25 285)');

  protected readonly seedRows = [
    { label: 'Primary', value: '#5b4fe0' },
    { label: 'Neutral', value: '#74736d' },
    { label: 'Success', value: '#168a35' },
    { label: 'Warning', value: '#eea000' },
    { label: 'Danger', value: '#de0029' },
    { label: 'Info', value: '#1298b8' },
  ];
}
