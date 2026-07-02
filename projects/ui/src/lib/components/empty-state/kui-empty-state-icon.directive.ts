import { Directive } from '@angular/core';

/** Marks projected visual content as the empty-state icon slot. */
@Directive({
  selector: '[kuiEmptyStateIcon]',
  host: {
    class: 'kui-empty__icon',
    'aria-hidden': 'true',
  },
})
export class KuiEmptyStateIconDirective {}
