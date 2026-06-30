import { Directive } from '@angular/core';

/** Non-interactive group heading inside a `kui-menu` panel. */
@Directive({
  selector: '[kuiMenuHeader]',
  host: {
    class: 'kui-menu-group-header',
    role: 'presentation',
  },
})
export class KuiMenuHeaderDirective {}
