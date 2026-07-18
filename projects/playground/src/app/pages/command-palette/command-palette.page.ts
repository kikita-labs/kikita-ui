import { Component, signal, ViewEncapsulation } from '@angular/core';

import { KuiButtonDirective, KuiCommandPaletteComponent } from '@kikita-labs/ui';

import type { KuiCommandGroup } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

const COMMAND_GROUPS: readonly KuiCommandGroup[] = [
  {
    heading: 'Navigation',
    items: [
      {
        id: 'home',
        label: 'Go to dashboard',
        icon: 'H',
        shortcut: ['G', 'H'],
        keywords: ['home', 'overview'],
      },
      {
        id: 'projects',
        label: 'Open projects',
        icon: 'P',
        shortcut: ['G', 'P'],
      },
      {
        id: 'drafts',
        label: 'Open drafts',
        description: 'Last edited yesterday',
        meta: '12 files',
        icon: 'D',
      },
      {
        id: 'qa-long',
        label: 'QA: gjpqy very long command label to test ellipsis overflow',
        description: 'gjpqy descender check in the description line too',
        icon: 'Q',
      },
    ],
  },
  {
    heading: 'Actions',
    items: [
      {
        id: 'task',
        label: 'Create task',
        icon: '+',
        badge: 'new',
        shortcut: ['C'],
      },
      {
        id: 'share',
        label: 'Share project',
        icon: 'S',
      },
      {
        id: 'export',
        label: 'Export workspace',
        icon: 'E',
        disabled: true,
      },
      {
        id: 'delete',
        label: 'Delete workspace',
        icon: '!',
        danger: true,
        keywords: ['remove', 'destroy'],
      },
    ],
  },
];

@Component({
  selector: 'app-command-palette-page',
  imports: [KuiButtonDirective, KuiCommandPaletteComponent, PlaygroundPanelComponent],
  templateUrl: './command-palette.page.html',
  styleUrl: './command-palette.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class CommandPalettePage {
  protected readonly groups = COMMAND_GROUPS;
  protected readonly open = signal(false);
  protected readonly loadingOpen = signal(false);
  protected readonly emptyOpen = signal(false);
  protected readonly searchOpen = signal(false);
  protected readonly searchQuery = signal('pro');
  protected readonly selected = signal('none');

  protected openPalette(): void {
    this.open.set(true);
  }

  protected openSearchPalette(): void {
    this.searchQuery.set('pro');
    this.searchOpen.set(true);
  }

  protected markSelected(label: string): void {
    this.selected.set(label);
  }
}
