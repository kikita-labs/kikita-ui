import { Component, signal } from '@angular/core';

import {
  KuiButtonDirective,
  KuiPopoverComponent,
  KuiPopoverForDirective,
  KuiTextDirective,
} from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

/** Shows informational and confirm-action content projected into Popover. */
@Component({
  selector: 'app-popover-content-examples',
  imports: [
    KuiButtonDirective,
    KuiPopoverComponent,
    KuiPopoverForDirective,
    KuiTextDirective,
    TranslocoPipe,
  ],
  templateUrl: './popover-content-examples.html',
  styleUrl: './popover-content-examples.scss',
})
export class PopoverContentExamples {
  protected readonly sampleViewDeleted = signal(false);

  protected confirmSampleDeletion(popover: KuiPopoverComponent): void {
    this.sampleViewDeleted.set(true);
    popover.close();
  }
}
