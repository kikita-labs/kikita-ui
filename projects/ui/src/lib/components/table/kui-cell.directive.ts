import { Directive } from '@angular/core';

@Directive({
  selector: 'td[kuiCell]',
  host: { class: 'kui-cell' },
})
/** Applies Kikita UI cell styling to a native table cell. */
export class KuiCellDirective {}
