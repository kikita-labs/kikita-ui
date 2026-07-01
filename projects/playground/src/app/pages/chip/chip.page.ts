import { Component, signal, ViewEncapsulation } from '@angular/core';

import { KuiButtonDirective, KuiChipDirective, KuiChipRemoveDirective } from '@kikita-labs/ui';

import { PlaygroundPanelComponent } from '../../shared/panel/panel.component';

@Component({
  selector: 'app-chip-page',
  templateUrl: './chip.page.html',
  styleUrl: './chip.page.scss',
  imports: [PlaygroundPanelComponent, KuiButtonDirective, KuiChipDirective, KuiChipRemoveDirective],
  encapsulation: ViewEncapsulation.None,
})
export class ChipPage {
  protected readonly lastRemoved = signal('none');

  protected markRemoved(value: string): void {
    this.lastRemoved.set(value);
  }
}
