import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  inject,
  input,
} from '@angular/core';

import { KuiTooltipPlacement } from './kui-tooltip-placement.type';

const TOOLTIP_GAP = 6;

let tooltipCounter = 0;

/**
 * Shows a text tooltip on hover and keyboard focus.
 * Not shown on touch input — use an overlay or tap sheet for mobile.
 *
 * @example
 * ```html
 * <button kuiButton [kuiTooltip]="'Save changes'" placement="top">Save</button>
 * ```
 */
@Directive({
  selector: '[kuiTooltip]',
  host: {
    '[attr.aria-describedby]': 'tooltipId',
    '(mouseenter)': 'show()',
    '(mouseleave)': 'hide()',
    '(focusin)': 'show()',
    '(focusout)': 'hide()',
  },
})
export class KuiTooltipDirective implements OnDestroy {
  /** Tooltip text content. Empty string disables the tooltip. */
  readonly kuiTooltip = input<string>('');

  /** Preferred placement relative to the trigger element. */
  readonly placement = input<KuiTooltipPlacement>('top');

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly tooltipId = `kui-tooltip-${++tooltipCounter}`;
  private tooltipEl: HTMLElement | null = null;

  /** @internal */
  show(): void {
    const text = this.kuiTooltip();
    if (!text || !isPlatformBrowser(this.platformId) || this.tooltipEl) return;

    const el: HTMLElement = this.renderer.createElement('div');
    this.renderer.setAttribute(el, 'id', this.tooltipId);
    this.renderer.setAttribute(el, 'role', 'tooltip');
    this.renderer.addClass(el, 'kui-tooltip');
    this.renderer.setAttribute(el, 'data-kui-placement', this.placement());
    this.renderer.setProperty(el, 'textContent', text);
    this.renderer.appendChild(this.document.body, el);
    this.tooltipEl = el;

    this.position();
  }

  /** @internal */
  hide(): void {
    if (!this.tooltipEl) return;
    const el = this.tooltipEl;
    this.tooltipEl = null;
    this.renderer.addClass(el, 'is-hiding');
    let removed = false;
    const remove = () => {
      if (!removed && el.parentNode) {
        removed = true;
        this.renderer.removeChild(this.document.body, el);
      }
    };
    el.addEventListener('animationend', remove, { once: true });
    setTimeout(remove, 200);
  }

  ngOnDestroy(): void {
    this.hide();
  }

  private position(): void {
    const tip = this.tooltipEl;
    if (!tip) return;

    const trigger = this.el.nativeElement.getBoundingClientRect();
    const { width: tipW, height: tipH } = tip.getBoundingClientRect();

    let top: number;
    let left: number;

    switch (this.placement()) {
      case 'bottom':
        top = trigger.bottom + TOOLTIP_GAP;
        left = trigger.left + trigger.width / 2 - tipW / 2;
        break;
      case 'left':
        top = trigger.top + trigger.height / 2 - tipH / 2;
        left = trigger.left - tipW - TOOLTIP_GAP;
        break;
      case 'right':
        top = trigger.top + trigger.height / 2 - tipH / 2;
        left = trigger.right + TOOLTIP_GAP;
        break;
      default:
        top = trigger.top - tipH - TOOLTIP_GAP;
        left = trigger.left + trigger.width / 2 - tipW / 2;
    }

    this.renderer.setStyle(tip, 'top', `${Math.round(top)}px`);
    this.renderer.setStyle(tip, 'left', `${Math.round(left)}px`);
  }
}
