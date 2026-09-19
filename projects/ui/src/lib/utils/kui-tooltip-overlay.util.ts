import type {
  ConnectedPosition,
  FlexibleConnectedPositionStrategyOrigin,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import type { ComponentRef } from '@angular/core';

import type { KuiTooltipPlacement } from '../components/tooltip/kui-tooltip-placement.type';
import { KuiTooltipSurfaceComponent } from '../components/tooltip/kui-tooltip-surface.component';

const TOOLTIP_GAP = 6;

interface KuiTooltipOverlayOptions {
  /**
   * CDK's `flexibleConnectedTo` accepts an `Element` (an `SVGElement`, e.g. a chart mark, works
   * natively) or a virtual `{x, y}` point in viewport coordinates -- the chart engine uses the
   * latter for a mouse-following tooltip (`KuiChartTooltipController.move`), since anchoring to a
   * mark's own element bounding box breaks down for large/non-convex shapes (a donut slice's arc
   * can have a bounding box whose center lands nowhere near the visible wedge -- see
   * `KuiDonutChartComponent`'s doc on why marks-as-anchor doesn't generalize). See
   * `.local-notes/v2/chart-architecture-plan.md` section 7.
   */
  readonly anchor: FlexibleConnectedPositionStrategyOrigin;
  readonly id?: string;
  readonly overlay: Overlay;
  readonly placement: KuiTooltipPlacement;
  readonly text: string;
  readonly touchEnabled?: boolean;
}

/** Handle for an internal CDK-backed Kikita tooltip surface. */
export interface KuiTooltipOverlayHandle {
  readonly overlayRef: OverlayRef;
  readonly tooltipEl: HTMLElement;
  updatePosition(): void;
  updateText(text: string): void;
  /**
   * Repositions this same overlay against a different anchor without destroying and recreating
   * it -- `FlexibleConnectedPositionStrategy.setOrigin` is a public CDK API made exactly for this.
   * Used by the chart engine to move one shared tooltip between marks on hover/focus instead of
   * creating an overlay per mark (hundreds of marks would mean hundreds of overlays otherwise), and
   * (via a `{x, y}` virtual origin) to follow the pointer continuously on `pointermove`.
   */
  retarget(anchor: FlexibleConnectedPositionStrategyOrigin): void;
}

/** Creates a CDK overlay that renders a Kikita tooltip above other CDK popover surfaces. */
export function createKuiTooltipOverlay(
  options: KuiTooltipOverlayOptions,
): KuiTooltipOverlayHandle {
  const { anchor, id, overlay, placement, text, touchEnabled } = options;
  const positionStrategy = overlay
    .position()
    .flexibleConnectedTo(anchor)
    .withPush(false)
    .withPositions(getTooltipPositions(placement));
  const overlayRef = overlay.create({
    hasBackdrop: false,
    panelClass: 'kui-tooltip-pane',
    positionStrategy,
    scrollStrategy: overlay.scrollStrategies.reposition(),
  });
  const tooltipRef = overlayRef.attach(new ComponentPortal(KuiTooltipSurfaceComponent));
  tooltipRef.setInput('tooltipId', id ?? null);
  tooltipRef.setInput('placement', placement);
  tooltipRef.setInput('text', text);
  tooltipRef.setInput('touchEnabled', touchEnabled ?? false);
  tooltipRef.changeDetectorRef.detectChanges();
  const tooltipEl = tooltipRef.location.nativeElement as HTMLElement;

  return {
    overlayRef,
    tooltipEl,
    updatePosition: () => overlayRef.updatePosition(),
    updateText: (nextText: string) => setTooltipText(tooltipRef, nextText),
    retarget: (nextAnchor: FlexibleConnectedPositionStrategyOrigin) => {
      positionStrategy.setOrigin(nextAnchor);
      overlayRef.updatePosition();
    },
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
