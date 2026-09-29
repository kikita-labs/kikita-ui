import { Component } from '@angular/core';

import {
  KuiAlertComponent,
  KuiAlertIconDirective,
  KuiAlertMessageDirective,
  KuiAlertTitleDirective,
  KuiBadgeDirective,
} from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows projected Alert icon, title, and message content replacing the matching inputs. */
@Component({
  selector: 'app-alert-custom-content',
  imports: [
    KuiAlertComponent,
    KuiAlertIconDirective,
    KuiAlertMessageDirective,
    KuiAlertTitleDirective,
    KuiBadgeDirective,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './alert-custom-content.html',
  styleUrl: './alert-custom-content.scss',
})
export class AlertCustomContent {}
