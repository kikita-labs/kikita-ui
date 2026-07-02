import { Component, ViewEncapsulation } from '@angular/core';

import {
  KuiButtonDirective,
  KuiCardDirective,
  KuiEmptyStateActionsDirective,
  KuiEmptyStateComponent,
  KuiEmptyStateIconDirective,
} from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-empty-state-page',
  imports: [
    KuiButtonDirective,
    KuiCardDirective,
    KuiEmptyStateActionsDirective,
    KuiEmptyStateComponent,
    KuiEmptyStateIconDirective,
    PlaygroundPanelComponent,
  ],
  templateUrl: './empty-state.page.html',
  styleUrl: './empty-state.page.scss',
  encapsulation: ViewEncapsulation.None,
})
export class EmptyStatePage {}
