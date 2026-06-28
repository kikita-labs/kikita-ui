import { Component, ViewEncapsulation, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { KuiFieldComponent, KuiNumberInputDirective } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-number-input-page',
  imports: [KuiNumberInputDirective, KuiFieldComponent, PlaygroundPanelComponent, FormsModule],
  templateUrl: './number-input.page.html',
  styleUrl: './number-input.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class NumberInputPage {
  protected liveValue = 5;
  protected readonly fieldErrorValue = signal(150);
  protected readonly liveLg = signal(1);

  protected readonly fieldError = computed(() =>
    this.fieldErrorValue() > 100 ? 'Value cannot exceed 100' : '',
  );
}
