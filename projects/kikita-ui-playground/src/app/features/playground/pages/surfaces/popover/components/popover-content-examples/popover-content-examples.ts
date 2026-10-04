import { Component, signal } from '@angular/core';

import { KuiButton, KuiPopover, KuiPopoverFor, KuiText } from '@kikita-labs/ui';

import { TranslocoPipe } from '@jsverse/transloco';

/** Shows informational and confirm-action content projected into Popover. */
@Component({
  selector: 'app-popover-content-examples',
  imports: [KuiButton, KuiPopover, KuiPopoverFor, KuiText, TranslocoPipe],
  templateUrl: './popover-content-examples.html',
  styleUrl: './popover-content-examples.scss',
})
export class PopoverContentExamples {
  protected readonly sampleViewDeleted = signal(false);

  protected confirmSampleDeletion(popover: KuiPopover): void {
    this.sampleViewDeleted.set(true);
    popover.close();
  }
}
