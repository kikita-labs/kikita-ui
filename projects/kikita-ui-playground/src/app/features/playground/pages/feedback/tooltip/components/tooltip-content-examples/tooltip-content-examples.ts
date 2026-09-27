import { Component } from '@angular/core';

import {
  KuiButtonDirective,
  KuiIconButtonDirective,
  KuiIconComponent,
  KuiTooltipDirective,
} from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';
import type { KuiIconSource } from '@kikita-labs/ui';

/** Shows ignored blank content, wrapping, and an accessible icon-only trigger. */
@Component({
  selector: 'app-tooltip-content-examples',
  imports: [
    KuiButtonDirective,
    KuiIconButtonDirective,
    KuiIconComponent,
    KuiTooltipDirective,
    TranslocoPipe,
  ],
  templateUrl: './tooltip-content-examples.html',
  styleUrl: './tooltip-content-examples.scss',
})
export class TooltipContentExamples {
  protected readonly infoIcon: KuiIconSource =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>';
}
