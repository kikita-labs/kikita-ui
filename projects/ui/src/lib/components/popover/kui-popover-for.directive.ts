import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

import { KuiPopoverComponent } from './kui-popover.component';

/**
 * Wires any element as a trigger for a `<kui-popover>`.
 *
 * @example
 * ```html
 * <button [kuiPopoverFor]="myPop" kuiButton>Open</button>
 * <kui-popover #myPop placement="bottom">...</kui-popover>
 * ```
 */
@Directive({
  selector: '[kuiPopoverFor]',
  host: {
    '[attr.aria-expanded]': 'popover()?.open() ?? false',
    '[attr.aria-haspopup]': '"dialog"',
    '[attr.aria-controls]': 'popover()?.open() ? popover()?.panelId : null',
  },
})
export class KuiPopoverForDirective {
  /** Popover instance controlled by this trigger. */
  readonly kuiPopoverFor = input<KuiPopoverComponent | undefined>();

  private readonly el = inject(ElementRef<HTMLElement>);

  protected popover(): KuiPopoverComponent | undefined {
    return this.kuiPopoverFor();
  }

  @HostListener('click')
  protected onClick(): void {
    const p = this.popover();
    if (!p || p.triggerType() !== 'click') return;
    p.open() ? p.close() : p.openFor(this.el.nativeElement);
  }

  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    const p = this.popover();
    if (!p || p.triggerType() !== 'click') return;
    if (this.el.nativeElement.tagName === 'BUTTON') return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    this.onClick();
  }

  @HostListener('mouseenter')
  protected onMouseEnter(): void {
    const p = this.popover();
    if (!p || p.triggerType() !== 'hover') return;
    p.openFor(this.el.nativeElement);
  }

  @HostListener('focusin')
  protected onFocusIn(): void {
    const p = this.popover();
    if (!p || p.triggerType() !== 'hover') return;
    p.openFor(this.el.nativeElement);
  }

  @HostListener('mouseleave')
  protected onMouseLeave(): void {
    const p = this.popover();
    if (!p || p.triggerType() !== 'hover') return;
    p.scheduleClose(p.hoverDelay());
  }

  @HostListener('focusout')
  protected onFocusOut(): void {
    const p = this.popover();
    if (!p || p.triggerType() !== 'hover') return;
    p.scheduleClose(p.hoverDelay());
  }
}
