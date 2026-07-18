import { Component, signal, ViewEncapsulation } from '@angular/core';

import { KuiTreeComponent } from '@kikita-labs/ui';

import type { KuiTreeNode } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

const DISPLAY_NODES: readonly KuiTreeNode[] = [
  {
    id: 'd-projects',
    label: 'Projects',
    icon: 'folder',
    children: [
      {
        id: 'd-kikita',
        label: 'Kikita UI',
        icon: 'folder',
        children: [
          { id: 'd-components', label: 'components', icon: 'folder', lazy: true },
          { id: 'd-readme', label: 'README.md', icon: 'file' },
          { id: 'd-agents', label: 'AGENTS.md', icon: 'file' },
        ],
      },
      {
        id: 'd-archive',
        label: 'Archive',
        icon: 'folder',
        children: [
          {
            id: 'd-old',
            label: 'quarterly-report-2019-final-v3-reviewed-DO-NOT-DELETE.xlsx',
            icon: 'file',
          },
        ],
      },
    ],
  },
  { id: 'd-notes', label: 'notes.txt', icon: 'file' },
];

const CHECKABLE_NODES: readonly KuiTreeNode[] = [
  {
    id: 'c-projects',
    label: 'Projects',
    icon: 'folder',
    children: [
      {
        id: 'c-kikita',
        label: 'Kikita UI',
        icon: 'folder',
        children: [
          {
            id: 'c-components',
            label: 'components',
            icon: 'folder',
            children: [
              { id: 'c-button-tsx', label: 'Button.tsx', icon: 'file' },
              { id: 'c-input-tsx', label: 'Input.tsx', icon: 'file' },
            ],
          },
          { id: 'c-readme', label: 'README.md', icon: 'file' },
          { id: 'c-agents', label: 'AGENTS.md', icon: 'file', disabled: true },
        ],
      },
    ],
  },
];

const SIZE_NODES: readonly KuiTreeNode[] = [
  {
    id: 's-projects',
    label: 'Projects',
    icon: 'folder',
    children: [{ id: 's-readme', label: 'README.md', icon: 'file' }],
  },
];

const STATE_NODES: readonly KuiTreeNode[] = [
  {
    id: 'x-settings',
    label: 'Settings',
    icon: 'folder',
    children: [
      { id: 'x-general', label: 'General', icon: 'file' },
      { id: 'x-export', label: 'Export (unavailable)', icon: 'file', disabled: true },
      { id: 'x-plain', label: 'No-icon item' },
    ],
  },
];

const MOBILE_NODES: readonly KuiTreeNode[] = [
  {
    id: 'm-documents',
    label: 'Documents',
    icon: 'folder',
    children: [{ id: 'm-contract', label: 'Contract.pdf', icon: 'file' }],
  },
];

@Component({
  selector: 'app-tree-page',
  templateUrl: './tree.page.html',
  styleUrl: './tree.page.scss',
  encapsulation: ViewEncapsulation.None,
  imports: [KuiTreeComponent, PlaygroundPanelComponent],
})
export class TreePage {
  protected readonly displayNodes = DISPLAY_NODES;
  protected readonly checkableNodes = CHECKABLE_NODES;
  protected readonly sizeNodes = SIZE_NODES;
  protected readonly stateNodes = STATE_NODES;
  protected readonly mobileNodes = MOBILE_NODES;

  protected readonly displaySelected = signal<string | null>('d-readme');
  protected readonly displayExpanded = signal<string[]>(['d-projects', 'd-kikita']);

  protected readonly checkedIds = signal<string[]>([
    'c-components',
    'c-button-tsx',
    'c-input-tsx',
    'c-readme',
  ]);
  protected readonly checkableExpanded = signal<string[]>([
    'c-projects',
    'c-kikita',
    'c-components',
  ]);

  protected readonly stateExpanded = signal<string[]>(['x-settings']);
  protected readonly mobileExpanded = signal<string[]>(['m-documents']);

  protected readonly loadDisplayChildren = (): Promise<KuiTreeNode[]> =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { id: 'd-button-tsx', label: 'Button.tsx', icon: 'file' },
          { id: 'd-input-tsx', label: 'Input.tsx', icon: 'file' },
        ]);
      }, 700);
    });
}
