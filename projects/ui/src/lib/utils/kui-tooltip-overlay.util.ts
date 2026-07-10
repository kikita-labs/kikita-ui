import { Overlay, OverlayRef, ConnectedPosition } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef } from '@angular/core';

import { KuiTooltipPlacement } from '../components/tooltip/kui-tooltip-placement.type';
import { KuiTooltipSurfaceComponent } from '../components/tooltip/kui-tooltip-surface.component';

const TOOLTIP_GAP = 6;

interface KuiTooltipOverlayOptions {
  readonly anchor: HTMLElement;
  readonly id?: string;
  readonly overlay: Overlay;
  readonly placement: KuiTooltipPlacement;
  readonly text: string;
}

/** Handle for an internal CDK-backed Kikita tooltip surface. */
export interface KuiTooltipOverlayHandle {
  readonly overlayRef: OverlayRef;
  readonly tooltipEl: HTMLElement;
  updatePosition(): void;
  updateText(text: string): void;
}

/** Creates a CDK overlay that renders a Kikita tooltip above other CDK popover surfaces. */
export function createKuiTooltipOverlay(
  options: KuiTooltipOverlayOptions,
): KuiTooltipOverlayHandle {
  const { anchor, id, overlay, placement, text } = options;
  const overlayRef = overlay.create({
    hasBackdrop: false,
    panelClass: 'kui-tooltip-pane',
    positionStrategy: overlay
      .position()
      .flexibleConnectedTo(anchor)
      .withFlexibleDimensions(false)
      .withPush(false)
      .withPositions(getTooltipPositions(placement)),
    scrollStrategy: overlay.scrollStrategies.reposition(),
  });
  const tooltipRef = overlayRef.attach(new ComponentPortal(KuiTooltipSurfaceComponent));
  tooltipRef.setInput('tooltipId', id ?? null);
  tooltipRef.setInput('placement', placement);
  tooltipRef.setInput('text', text);
  tooltipRef.changeDetectorRef.detectChanges();
  const tooltipEl = tooltipRef.location.nativeElement as HTMLElement;

  return {
    overlayRef,
    tooltipEl,
    updatePosition: () => overlayRef.updatePosition(),
    updateText: (nextText: string) => setTooltipText(tooltipRef, nextText),
  };
}

function setTooltipText(
  componentRef: ComponentRef<KuiTooltipSurfaceComponent>,
  text: string,
): void {
  componentRef.setInput('text', text);
  componentRef.changeDetectorRef.detectChanges();
}

function getTooltipPositions(placement: KuiTooltipPlacement): ConnectedPosition[] {
  switch (placement) {
    case 'bottom':
      return [
        {
          originX: 'center',
          originY: 'bottom',
          overlayX: 'center',
          overlayY: 'top',
          offsetY: TOOLTIP_GAP,
        },
      ];
    case 'left':
      return [
        {
          originX: 'start',
          originY: 'center',
          overlayX: 'end',
          overlayY: 'center',
          offsetX: -TOOLTIP_GAP,
        },
      ];
    case 'right':
      return [
        {
          originX: 'end',
          originY: 'center',
          overlayX: 'start',
          overlayY: 'center',
          offsetX: TOOLTIP_GAP,
        },
      ];
    default:
      return [
        {
          originX: 'center',
          originY: 'top',
          overlayX: 'center',
          overlayY: 'bottom',
          offsetY: -TOOLTIP_GAP,
        },
      ];
  }
}
