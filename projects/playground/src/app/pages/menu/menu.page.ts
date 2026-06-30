import { Component, signal, ViewEncapsulation } from '@angular/core';

import {
  KuiButtonDirective,
  KuiMenuComponent,
  KuiMenuForDirective,
  KuiMenuHeaderDirective,
  KuiMenuItemDirective,
  KuiSeparatorDirective,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-menu-page',
  imports: [
    KuiButtonDirective,
    KuiMenuComponent,
    KuiMenuForDirective,
    KuiMenuHeaderDirective,
    KuiMenuItemDirective,
    KuiSeparatorDirective,
    PlaygroundPanelComponent,
  ],
  templateUrl: './menu.page.html',
  styleUrl: './menu.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class MenuPage {
  protected readonly lastAction = signal('none');

  protected setAction(action: string): void {
    this.lastAction.set(action);
  }
}
