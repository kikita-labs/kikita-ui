import { isPlatformBrowser } from '@angular/common';
import {
  Directive,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  Renderer2,
  inject,
  input,
} from '@angular/core';
import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';

import { KuiTooltipPlacement } from './kui-tooltip-placement.type';

const TOOLTIP_GAP = 6;

let tooltipCounter = 0;

const PLACEMENT_POSITIONS: Record<KuiTooltipPlacement, ConnectedPosition[]> = {
  top: [
    {
      originX: 'center',
      originY: 'top',
      overlayX: 'center',
      overlayY: 'bottom',
      offsetY: -TOOLTIP_GAP,
    },
    {
      originX: 'center',
      originY: 'bottom',
      overlayX: 'center',
      overlayY: 'top',
      offsetY: TOOLTIP_GAP,
    },
  ],
  bottom: [
    {
      originX: 'center',
      originY: 'bottom',
      overlayX: 'center',
      overlayY: 'top',
      offsetY: TOOLTIP_GAP,
    },
    {
      originX: 'center',
      originY: 'top',
      overlayX: 'center',
      overlayY: 'bottom',
      offsetY: -TOOLTIP_GAP,
    },
  ],
  left: [
    {
      originX: 'start',
      originY: 'center',
      overlayX: 'end',
      overlayY: 'center',
      offsetX: -TOOLTIP_GAP,
    },
    {
      originX: 'end',
      originY: 'center',
      overlayX: 'start',
      overlayY: 'center',
      offsetX: TOOLTIP_GAP,
    },
  ],
  right: [
    {
      originX: 'end',
      originY: 'center',
      overlayX: 'start',
      overlayY: 'center',
      offsetX: TOOLTIP_GAP,
    },
    {
      originX: 'start',
      originY: 'center',
      overlayX: 'end',
      overlayY: 'center',
      offsetX: -TOOLTIP_GAP,
    },
  ],
};

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
  private readonly platformId = inject(PLATFORM_ID);
  private readonly overlay = inject(Overlay);

  protected readonly tooltipId = `kui-tooltip-${++tooltipCounter}`;
  private overlayRef: OverlayRef | null = null;
  private tooltipEl: HTMLElement | null = null;
  private hideTimeoutId: ReturnType<typeof setTimeout> | null = null;

  /** @internal */
  protected show(): void {
    const text = this.kuiTooltip();
    if (!text || !isPlatformBrowser(this.platformId) || this.overlayRef) return;

    if (this.hideTimeoutId !== null) {
      clearTimeout(this.hideTimeoutId);
      this.hideTimeoutId = null;
    }

    const positionStrategy: FlexibleConnectedPositionStrategy = this.overlay
      .position()
      .flexibleConnectedTo(this.el)
      .withPositions(PLACEMENT_POSITIONS[this.placement()])
      .withPush(true);

    this.overlayRef = this.overlay.create({
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.reposition(),
      hasBackdrop: false,
      panelClass: [],
    });

    const el: HTMLElement = this.renderer.createElement('div');
    this.renderer.setAttribute(el, 'id', this.tooltipId);
    this.renderer.setAttribute(el, 'role', 'tooltip');
    this.renderer.addClass(el, 'kui-tooltip');
    this.renderer.setAttribute(el, 'data-kui-placement', this.placement());
    this.renderer.setProperty(el, 'textContent', text);
    this.tooltipEl = el;

    this.overlayRef.overlayElement.appendChild(el);
  }

  /** @internal */
  protected hide(): void {
    if (!this.overlayRef) return;
    const el = this.tooltipEl;
    this.tooltipEl = null;

    if (el) {
      this.renderer.addClass(el, 'is-hiding');
      let removed = false;
      const remove = () => {
        if (!removed) {
          removed = true;
          this._detach();
        }
      };
      el.addEventListener('animationend', remove, { once: true });
      this.hideTimeoutId = setTimeout(remove, 200);
    } else {
      this._detach();
    }
  }

  private _detach(): void {
    this.overlayRef?.detach();
    this.overlayRef?.dispose();
    this.overlayRef = null;
  }

  ngOnDestroy(): void {
    if (this.hideTimeoutId !== null) {
      clearTimeout(this.hideTimeoutId);
    }
    this._detach();
  }
}
