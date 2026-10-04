import { Component } from '@angular/core';

import { KuiAlert, KuiAlertIcon, KuiAlertMessage, KuiAlertTitle, KuiBadge } from '@kikita-labs/ui';

import { PlaygroundExampleCard } from '@features/playground/components';
import { TranslocoPipe } from '@jsverse/transloco';

/** Shows projected Alert icon, title, and message content replacing the matching inputs. */
@Component({
  selector: 'app-alert-custom-content',
  imports: [
    KuiAlert,
    KuiAlertIcon,
    KuiAlertMessage,
    KuiAlertTitle,
    KuiBadge,
    PlaygroundExampleCard,
    TranslocoPipe,
  ],
  templateUrl: './alert-custom-content.html',
  styleUrl: './alert-custom-content.scss',
})
export class AlertCustomContent {}
