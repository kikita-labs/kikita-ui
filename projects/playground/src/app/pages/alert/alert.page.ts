import { Component, signal, ViewEncapsulation } from '@angular/core';

import {
  KuiAlertActionsDirective,
  KuiAlertComponent,
  KuiAlertIconDirective,
  KuiAlertMessageDirective,
  KuiAlertTitleDirective,
  KuiBadgeDirective,
  KuiButtonDirective,
  KuiIconComponent,
} from '@kikita-labs/ui';

import type { KuiAlertAppearance, KuiAlertShape } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-alert-page',
  imports: [
    KuiAlertComponent,
    KuiAlertActionsDirective,
    KuiAlertIconDirective,
    KuiAlertMessageDirective,
    KuiAlertTitleDirective,
    KuiBadgeDirective,
    KuiButtonDirective,
    KuiIconComponent,
    PlaygroundPanelComponent,
  ],
  templateUrl: './alert.page.html',
  styleUrl: './alert.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class AlertPage {
  protected readonly appearances: readonly KuiAlertAppearance[] = [
    'neutral',
    'info',
    'success',
    'warning',
    'danger',
  ];

  protected readonly shapes: readonly KuiAlertShape[] = ['soft', 'outline', 'solid'];

  protected readonly dismissed = signal<Record<string, boolean>>({});

  protected isOpen(id: string): boolean {
    return !this.dismissed()[id];
  }

  protected dismiss(id: string): void {
    this.dismissed.update((state) => ({ ...state, [id]: true }));
  }

  protected resetAll(): void {
    this.dismissed.set({});
  }
}
