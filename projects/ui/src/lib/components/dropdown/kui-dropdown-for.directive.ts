import { Directive, ElementRef, inject, input, OnInit } from '@angular/core';

import { KuiDropdownComponent } from './kui-dropdown.component';

@Directive({
  selector: '[kuiDropdownFor]',
  host: {
    '(click)': 'toggle()',
    '[attr.aria-expanded]': 'dropdown()?.isOpen()',
    '[attr.aria-haspopup]': '"listbox"',
  },
})
export class KuiDropdownForDirective implements OnInit {
  readonly kuiDropdownFor = input.required<KuiDropdownComponent>();

  private readonly el = inject(ElementRef<HTMLElement>);

  protected dropdown() {
    return this.kuiDropdownFor();
  }

  ngOnInit(): void {
    this.kuiDropdownFor().setAnchor(this.el.nativeElement);
  }

  protected toggle(): void {
    this.kuiDropdownFor().toggle();
  }
}
