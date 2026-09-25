import { Component, signal } from '@angular/core';

import {
  KuiButtonDirective,
  KuiMenuComponent,
  KuiMenuForDirective,
  KuiMenuItemDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import type { MenuDefaultAction } from './types';

@Component({
  selector: 'app-menu-default',
  imports: [
    KuiButtonDirective,
    KuiMenuComponent,
    KuiMenuForDirective,
    KuiMenuItemDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './menu-default.html',
})
export class MenuDefault {
  protected readonly lastAction = signal<MenuDefaultAction | null>(null);

  protected recordAction(action: MenuDefaultAction): void {
    this.lastAction.set(action);
  }
}
