import { Directive } from '@angular/core';

/** Marks projected interactive content as the empty-state actions slot. */
@Directive({
  selector: '[kuiEmptyStateActions]',
  host: {
    class: 'kui-empty__actions',
  },
})
export class KuiEmptyStateActionsDirective {}
