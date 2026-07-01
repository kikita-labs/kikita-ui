import { Directive, HostListener, inject } from '@angular/core';

import { KuiChipDirective } from './kui-chip.directive';

/** Marks a native button as the remove affordance inside `[kuiChip]`. */
@Directive({
  selector: 'button[kuiChipRemove]',
  host: {
    class: 'kui-chip-remove',
    type: 'button',
    '[attr.aria-disabled]': 'chip.disabled() ? "true" : null',
    '[attr.tabindex]': 'chip.disabled() ? "-1" : null',
    '[attr.disabled]': 'chip.disabled() ? "" : null',
  },
})
export class KuiChipRemoveDirective {
  protected readonly chip = inject(KuiChipDirective, { host: true });

  @HostListener('click', ['$event'])
  protected onClick(event: MouseEvent): void {
    event.stopPropagation();

    if (this.chip.disabled()) {
      event.preventDefault();
      return;
    }

    this.chip._emitRemoved();
  }
}
