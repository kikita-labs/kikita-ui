import { Component, signal, ViewEncapsulation } from '@angular/core';
import { form, FormField } from '@angular/forms/signals';

import {
  KuiCellDirective,
  KuiFieldActionDirective,
  KuiFieldAffixDirective,
  KuiFieldAffixIconDirective,
  KuiFieldComponent,
  KuiIconComponent,
  KuiInputDirective,
  KuiInputGroupDirective,
  KuiTableDirective,
  KuiTextareaDirective,
  KuiThDirective,
  KuiThGroupDirective,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-field-page',
  imports: [
    FormField,
    KuiCellDirective,
    KuiFieldActionDirective,
    KuiFieldAffixDirective,
    KuiFieldAffixIconDirective,
    KuiFieldComponent,
    KuiIconComponent,
    KuiInputGroupDirective,
    KuiInputDirective,
    KuiTableDirective,
    KuiTextareaDirective,
    KuiThDirective,
    KuiThGroupDirective,
    PlaygroundPanelComponent,
  ],
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

  protected readonly membersModel = signal({ query: '' });
  protected readonly membersForm = form(this.membersModel);
}
