import { Component, ViewEncapsulation, signal } from '@angular/core';

import {
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiOptionDirective,
  KuiSelectDirective,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

const ROLES = [
  { value: 'engineer', label: 'Software Engineer' },
  { value: 'product', label: 'Product Manager' },
  { value: 'designer', label: 'Designer' },
  { value: 'data', label: 'Data Scientist' },
  { value: 'devops', label: 'DevOps Engineer' },
];

interface User {
  id: number;
  name: string;
  active: boolean;
}

const USERS: User[] = [
  { id: 1, name: 'Alice Kim', active: true },
  { id: 2, name: 'Bob Chen', active: true },
  { id: 3, name: 'Carol Okonkwo', active: false },
  { id: 4, name: 'David Müller', active: true },
];

@Component({
  selector: 'app-select-page',
  imports: [
    PlaygroundPanelComponent,
    KuiSelectDirective,
    KuiDropdownComponent,
    KuiOptionDirective,
    KuiFieldComponent,
  ],
  templateUrl: './select.page.html',
  encapsulation: ViewEncapsulation.None,
})
export class SelectPage {
  protected readonly roles = ROLES;
  protected readonly users = USERS;

  protected readonly selectedRole = signal<string | null>(null);
  protected readonly selectedUser = signal<User | null>(null);

  protected readonly userLabelFn = (u: User): string => u.name;
}
