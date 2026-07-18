import { booleanAttribute, Directive, input } from '@angular/core';

@Directive({
  selector: 'tr[kuiThGroup]',
  host: {
    class: 'kui-th-group',
    '[class.kui-th-group--sticky]': 'sticky()',
  },
})
/** Applies Kikita UI grouped-header styling to a native table header cell. */
export class KuiThGroupDirective {
  readonly sticky = input(false, { transform: booleanAttribute });
}
