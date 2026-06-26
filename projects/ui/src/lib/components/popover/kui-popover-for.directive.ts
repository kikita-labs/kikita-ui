import { Directive, ElementRef, HostListener, inject, input, OnInit } from '@angular/core';

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

  @HostListener('mouseenter')
  protected onMouseEnter(): void {
    if (this.kuiPopoverFor().triggerType() !== 'hover') return;
    this.kuiPopoverFor().openFor(this.el.nativeElement);
  }

  @HostListener('mouseleave')
  protected onMouseLeave(): void {
    if (this.kuiPopoverFor().triggerType() !== 'hover') return;
    const p = this.kuiPopoverFor();
    p.scheduleClose(p.hoverDelay());
  }
}
