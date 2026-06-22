import { Directive } from '@angular/core';

@Directive({
  selector: 'td[kuiCell]',
  host: { class: 'kui-cell' },
})
export class KuiCellDirective {}
