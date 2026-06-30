import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

import { KuiMenuComponent } from './kui-menu.component';

/** Wires a native element as the trigger for a `kui-menu`. */
@Directive({
  selector: '[kuiMenuFor]',
  host: {
    '[attr.aria-expanded]': 'menu()?.isOpen() ?? false',
    '[attr.aria-haspopup]': '"menu"',
    '[attr.aria-controls]': 'menu()?.isOpen() ? menu()?.panelId : null',
  },
})
export class KuiMenuForDirective {
  /** Menu instance controlled by this trigger. */
  readonly kuiMenuFor = input<KuiMenuComponent | undefined>();

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);

  protected menu(): KuiMenuComponent | undefined {
    return this.kuiMenuFor();
  }

  @HostListener('click')
  protected onClick(): void {
    this.menu()?.toggleFor(this.el.nativeElement);
  }

  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    const menu = this.menu();
    if (!menu) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      menu.openFor(this.el.nativeElement, 'first');
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      menu.openFor(this.el.nativeElement, 'last');
      return;
    }

    if (this.el.nativeElement.tagName === 'BUTTON') return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    menu.toggleFor(this.el.nativeElement);
  }
}
