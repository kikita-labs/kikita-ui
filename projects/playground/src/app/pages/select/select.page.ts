import { Component, ViewEncapsulation, signal } from '@angular/core';

import {
  KuiCellDirective,
  KuiSelectComponent,
  KuiSelectGroupTpl,
  KuiSelectItemTpl,
  KuiSelectOption,
  KuiTableDirective,
  KuiThDirective,
  KuiThGroupDirective,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

const ROLES: KuiSelectOption<string>[] = [
  { value: 'engineer', label: 'Software Engineer' },
  { value: 'product', label: 'Product Manager' },
  { value: 'designer', label: 'Designer' },
  { value: 'data', label: 'Data Scientist' },
  { value: 'devops', label: 'DevOps Engineer' },
];

const TOOLS: KuiSelectOption<string>[] = [
  {
    value: 'design',
    label: 'Design',
    children: [
      { value: 'figma', label: 'Figma' },
      { value: 'sketch', label: 'Sketch' },
    ],
  },
  {
    value: 'engineering',
    label: 'Engineering',
    children: [
      { value: 'vscode', label: 'VS Code' },
      { value: 'webstorm', label: 'WebStorm' },
    ],
  },
  {
    value: 'other',
    label: 'Other',
    children: [{ value: 'notion', label: 'Notion' }],
  },
];

const SIZES = [
  { value: 'xs' as const, label: 'XSmall', code: 'size="xs"' },
  { value: 'sm' as const, label: 'Small', code: 'size="sm"' },
  { value: 'md' as const, label: 'Medium', code: 'size="md"' },
  { value: 'lg' as const, label: 'Large', code: 'size="lg"' },
];

@Component({
  selector: 'app-select-page',
  imports: [
    PlaygroundPanelComponent,
    KuiSelectComponent,
    KuiSelectGroupTpl,
    KuiSelectItemTpl,
    KuiTableDirective,
    KuiThGroupDirective,
    KuiThDirective,
    KuiCellDirective,
  ],
  templateUrl: './select.page.html',
  encapsulation: ViewEncapsulation.None,
})
export class SelectPage {
  protected readonly roles = ROLES;
  protected readonly tools = TOOLS;
  protected readonly sizes = SIZES;

  protected readonly role = signal<string | undefined>(undefined);
  protected readonly tool = signal<string | undefined>('figma');
}
