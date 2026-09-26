import { Component, signal } from '@angular/core';

import {
  KuiButtonDirective,
  KuiTabDirective,
  KuiTabPanelDirective,
  KuiTabsComponent,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

import { TabsStyleMatrix } from './components';

/** Shows the shipped Tabs defaults, visual combinations, and keyboard behavior. */
@Component({
  selector: 'app-tabs',
  imports: [
    KuiButtonDirective,
    KuiTabDirective,
    KuiTabPanelDirective,
    KuiTabsComponent,
    KuiTextDirective,
    PlaygroundExampleCard,
    TabsStyleMatrix,
    TranslocoPipe,
  ],
  templateUrl: './tabs.html',
  styleUrl: './tabs.scss',
})
export class Tabs {
  protected readonly keyboardValue = signal('overview');
  protected readonly routerValue = signal('/overview');
  protected readonly paymentError = signal(true);

  protected togglePaymentError(): void {
    this.paymentError.update((enabled) => !enabled);
  }
}
