import { Overlay } from '@angular/cdk/overlay';
import { isPlatformBrowser } from '@angular/common';
import {
  computed,
  Directive,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  inject,
  input,
  signal,
} from '@angular/core';

import { KuiTooltipPlacement } from './kui-tooltip-placement.type';
import {
  createKuiTooltipOverlay,
  KuiTooltipOverlayHandle,
} from '../../utils/kui-tooltip-overlay.util';

let tooltipCounter = 0;

/**
 * Shows a text tooltip on hover and keyboard focus.
 * Not shown on touch input; use an overlay or tap sheet for mobile.
 *
 * @example
 * ```html
 * <button kuiButton [kuiTooltip]="'Save changes'" placement="top">Save</button>
 * ```
 */
@Directive({
  selector: '[kuiTooltip]',
  host: {
    '[attr.aria-describedby]': 'describedBy()',
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
  private readonly overlay = inject(Overlay);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);

  protected readonly tooltipId = `kui-tooltip-${++tooltipCounter}`;
  private readonly visibleTooltipId = signal<string | null>(null);
  protected readonly describedBy = computed(() => this.visibleTooltipId());
  private tooltipOverlay: KuiTooltipOverlayHandle | null = null;

  /** @internal */
  protected show(): void {
    const text = this.kuiTooltip().trim();
    if (!text || !isPlatformBrowser(this.platformId) || this.tooltipOverlay) return;
    this.showWithText(text);
  }

  /** Show tooltip with dynamic text (used by kuiSlider for value display). */
  showWithText(text: string): void {
    if (!isPlatformBrowser(this.platformId)) return;
    if (this.tooltipOverlay) {
      this.tooltipOverlay.updateText(text);
      this.tooltipOverlay.updatePosition();
      return;
    }
    this.tooltipOverlay = createKuiTooltipOverlay({
      anchor: this.el.nativeElement,
      id: this.tooltipId,
      overlay: this.overlay,
      placement: this.placement(),
      text,
    });
    this.visibleTooltipId.set(this.tooltipId);
  }

  /** Update text of an already-visible tooltip. */
  updateText(text: string): void {
    this.tooltipOverlay?.updateText(text);
  }

  /** @internal */
  protected hide(): void {
    if (!this.tooltipOverlay) return;
    const { overlayRef, tooltipEl } = this.tooltipOverlay;
    this.tooltipOverlay = null;
    this.visibleTooltipId.set(null);
    this.renderer.addClass(tooltipEl, 'is-hiding');
    let removed = false;
    const remove = () => {
      if (!removed) {
        removed = true;
        overlayRef.dispose();
      }
    };
    tooltipEl.addEventListener('animationend', remove, { once: true });
    setTimeout(remove, 200);
  }

  ngOnDestroy(): void {
    this.hide();
  }
}
