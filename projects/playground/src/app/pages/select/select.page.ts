import { Component, ViewEncapsulation, signal } from '@angular/core';

import {
  KuiDropdownComponent,
  KuiFieldComponent,
  KuiOptionDirective,
  KuiChipDirective,
  KuiChipRemoveDirective,
  KuiSelectDirective,
  KuiSelectValueDirective,
  type KuiChipAppearance,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

const ROLES = [
  { value: 'engineer', label: 'Software Engineer' },
  { value: 'product', label: 'Product Manager' },
  { value: 'designer', label: 'Designer' },
  { value: 'data', label: 'Data Scientist' },
  { value: 'devops', label: 'DevOps Engineer' },
  {
    value: 'long',
    label: 'Senior Principal Staff Software Engineer (Infrastructure Platform)',
  },
] as const;

type RoleValue = (typeof ROLES)[number]['value'];

interface User {
  id: number;
  name: string;
  active: boolean;
}

const USERS: User[] = [
  { id: 1, name: 'Alice Kim', active: true },
  { id: 2, name: 'Bob Chen', active: true },
  { id: 3, name: 'Carol Okonkwo', active: false },
  { id: 4, name: 'David Mueller', active: true },
];

@Component({
  selector: 'app-select-page',
  imports: [
    PlaygroundPanelComponent,
    KuiSelectDirective,
    KuiDropdownComponent,
    KuiOptionDirective,
    KuiFieldComponent,
    KuiSelectValueDirective,
    KuiChipDirective,
    KuiChipRemoveDirective,
  ],
  templateUrl: './select.page.html',
  styleUrl: './select.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class SelectPage {
  protected readonly roles = ROLES;
  protected readonly users = USERS;

  protected readonly selectedRole = signal<RoleValue | null>(null);
  protected readonly selectedUser = signal<User | null>(null);
  protected readonly selectedRoles = signal<readonly RoleValue[]>([
    'engineer',
    'designer',
    'devops',
    'data',
    'product',
  ]);

  protected readonly userLabelFn = (u: User): string => u.name;
  protected readonly roleLabelFn = (value: RoleValue): string =>
    this.roles.find((role) => role.value === value)?.label ?? value;

  protected readonly roleAppearance = (value: RoleValue): KuiChipAppearance => {
    if (value === 'designer') return 'info';
    if (value === 'devops') return 'warning';
    if (value === 'data') return 'success';
    return 'primary';
  };
}
