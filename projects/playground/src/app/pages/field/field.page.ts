import { Component, ViewEncapsulation } from '@angular/core';

import { KuiFieldComponent, KuiInputDirective, KuiTextareaDirective } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-field-page',
  imports: [KuiFieldComponent, KuiInputDirective, KuiTextareaDirective, PlaygroundPanelComponent],
  templateUrl: './field.page.html',
  styleUrl: './field.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class FieldPage {
  protected readonly sizeRows = [
    { value: 'xs' as const, label: 'xs' },
    { value: 'sm' as const, label: 'sm' },
    { value: 'md' as const, label: 'md (default)' },
    { value: 'lg' as const, label: 'lg' },
  ];
}
