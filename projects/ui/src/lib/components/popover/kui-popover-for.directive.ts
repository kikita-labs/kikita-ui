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
    '[attr.aria-expanded]': 'kuiPopoverFor().open()',
    '[attr.aria-haspopup]': '"dialog"',
    '[attr.aria-controls]': 'kuiPopoverFor().panelId',
  },
})
export class KuiPopoverForDirective {
  readonly kuiPopoverFor = input.required<KuiPopoverComponent>();

  private readonly el = inject(ElementRef<HTMLElement>);

  @HostListener('click')
  protected onClick(): void {
    if (this.kuiPopoverFor().triggerType() !== 'click') return;
    const p = this.kuiPopoverFor();
    p.open() ? p.close() : p.openFor(this.el.nativeElement);
  }

  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (this.kuiPopoverFor().triggerType() !== 'click') return;
    if (this.el.nativeElement.tagName === 'BUTTON') return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    this.onClick();
  }

  @HostListener('mouseenter')
  protected onMouseEnter(): void {
    if (this.kuiPopoverFor().triggerType() !== 'hover') return;
    this.kuiPopoverFor().openFor(this.el.nativeElement);
  }

  @HostListener('focusin')
  protected onFocusIn(): void {
    if (this.kuiPopoverFor().triggerType() !== 'hover') return;
    this.kuiPopoverFor().openFor(this.el.nativeElement);
  }

  @HostListener('mouseleave')
  protected onMouseLeave(): void {
    if (this.kuiPopoverFor().triggerType() !== 'hover') return;
    const p = this.kuiPopoverFor();
    p.scheduleClose(p.hoverDelay());
  }

  @HostListener('focusout')
  protected onFocusOut(): void {
    if (this.kuiPopoverFor().triggerType() !== 'hover') return;
    const p = this.kuiPopoverFor();
    p.scheduleClose(p.hoverDelay());
  }
}
