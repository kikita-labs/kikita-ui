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

  @HostListener('click', ['$event'])
  protected onClick(event: MouseEvent): void {
    const menu = this.menu();
    if (!menu) return;

    if (menu.isOpen()) {
      menu.close();
      return;
    }

    // A `<button>` fires a synthetic click (with `detail: 0`) when activated via Enter/Space,
    // indistinguishable here from the keydown handler below (which skips BUTTON triggers to
    // avoid double-toggling on that synthetic click). Treat detail === 0 as keyboard activation
    // and move focus onto the first item, same as ArrowDown -- a real pointer click (detail >= 1)
    // shouldn't steal focus onto an item the user didn't ask to navigate to.
    menu.openFor(this.el.nativeElement, event.detail === 0 ? 'first' : 'none');
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

    // Native <button> triggers already activate on Enter/Space via their own click event
    // (handled by onClick above); handling it here too would double-toggle the menu.
    if (this.el.nativeElement.tagName === 'BUTTON') return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    menu.isOpen() ? menu.close() : menu.openFor(this.el.nativeElement, 'first');
  }
}
