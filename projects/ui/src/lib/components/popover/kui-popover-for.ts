import { Directive, ElementRef, HostListener, inject, input } from '@angular/core';

import type { KuiPopover } from './kui-popover';

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
export class KuiPopoverFor {
  /** Popover instance controlled by this trigger. */
  readonly kuiPopoverFor = input<KuiPopover | undefined>();

  private readonly el = inject(ElementRef<HTMLElement>);

  protected popover(): KuiPopover | undefined {
    return this.kuiPopoverFor();
  }

  @HostListener('click')
  protected onClick(): void {
    const p = this.popover();
    if (!p || p.effectiveTriggerType() !== 'click') return;
    p.toggleFor(this.el.nativeElement);
  }

  @HostListener('keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    const p = this.popover();
    if (!p || p.effectiveTriggerType() !== 'click') return;
    if (this.el.nativeElement.tagName === 'BUTTON') return;
    if (event.key !== 'Enter' && event.key !== ' ') return;

    event.preventDefault();
    this.onClick();
  }

  @HostListener('mouseenter')
  protected onMouseEnter(): void {
    const p = this.popover();
    if (!p || p.effectiveTriggerType() !== 'hover') return;
    p.openFor(this.el.nativeElement);
  }

  @HostListener('focusin')
  protected onFocusIn(): void {
    const p = this.popover();
    if (!p || p.effectiveTriggerType() !== 'hover') return;
    p.openFor(this.el.nativeElement);
  }

  @HostListener('mouseleave')
  protected onMouseLeave(): void {
    const p = this.popover();
    if (!p || p.effectiveTriggerType() !== 'hover') return;
    p.scheduleClose(p.effectiveHoverDelay());
  }

  @HostListener('focusout')
  protected onFocusOut(): void {
    const p = this.popover();
    if (!p || p.effectiveTriggerType() !== 'hover') return;
    p.scheduleClose(p.effectiveHoverDelay());
  }
}
