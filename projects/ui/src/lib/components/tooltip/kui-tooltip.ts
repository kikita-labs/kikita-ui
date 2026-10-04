import { Overlay } from '@angular/cdk/overlay';
import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import type { OnDestroy } from '@angular/core';
import {
  computed,
  Directive,
  ElementRef,
  inject,
  input,
  numberAttribute,
  PLATFORM_ID,
  Renderer2,
  signal,
} from '@angular/core';

import { KuiDefaults } from '../../providers/kui-defaults';
import { kuiNextId } from '../../utils/kui-id.util';
import type { KuiTooltipOverlayHandle } from './kui-tooltip-overlay.util';
import { createKuiTooltipOverlay } from './kui-tooltip-overlay.util';
import type { KuiTooltipPlacement } from './kui-tooltip-placement.type';
import type { KuiTooltipTrigger } from './kui-tooltip-trigger.type';
import { KuiTooltipTriggerType } from './kui-tooltip-trigger.type';

function optionalTooltipOffset(value: unknown): number | undefined {
  const parsed = numberAttribute(value, Number.NaN);

  return Number.isFinite(parsed) ? parsed : undefined;
}

/**
 * Shows a text tooltip on hover and keyboard focus, with an adaptive tap trigger for touch
 * input. Keep the content short and non-interactive; use `kuiPopover` for interactive content.
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
    '(pointerdown)': 'rememberPointer($event)',
    '(pointercancel)': 'forgetPointer()',
    '(pointerenter)': 'showOnPointerEnter($event)',
    '(pointerleave)': 'hideOnPointerLeave($event)',
    '(focusin)': 'showOnFocus()',
    '(focusout)': 'hide()',
    '(click)': 'onClick($event)',
  },
})
export class KuiTooltip implements OnDestroy {
  /** Tooltip text content. Empty string disables the tooltip. */
  readonly kuiTooltip = input<string>('');

  /** Preferred placement relative to the trigger element. Defaults to `defaults.tooltip.placement`, then `top`. */
  readonly placement = input<KuiTooltipPlacement | undefined>();

  /** Gap in px between the trigger and the tooltip. Defaults to `defaults.tooltip.offset`, then `6`. */
  readonly offset = input<number | undefined, unknown>(undefined, {
    transform: optionalTooltipOffset,
  });

  /**
   * Local interaction mode override. When omitted, the nearest `tooltip` defaults
   * apply; its default `auto` mode uses hover/focus for mouse input and tap for touch input.
   */
  readonly triggerType = input<KuiTooltipTrigger | undefined>(undefined);

  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly overlay = inject(Overlay);
  private readonly renderer = inject(Renderer2);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);
  private readonly tooltipDefaults = inject(KuiDefaults).get('tooltip');

  protected readonly tooltipId = kuiNextId('kui-tooltip', 1);
  private readonly visibleTooltipId = signal<string | null>(null);
  protected readonly describedBy = computed(() => this.visibleTooltipId());
  protected readonly effectiveTrigger = computed(
    () => this.triggerType() ?? this.tooltipDefaults()?.triggerType ?? KuiTooltipTriggerType.Auto,
  );
  private tooltipOverlay: KuiTooltipOverlayHandle | null = null;
  private pointerType: string | null = null;
  private tapDismissalCleanup: (() => void) | null = null;

  /** @internal */
  protected rememberPointer(event: PointerEvent): void {
    this.pointerType = event.pointerType;
  }

  /** @internal */
  protected forgetPointer(): void {
    this.pointerType = null;
  }

  /** @internal */
  protected showOnPointerEnter(event: PointerEvent): void {
    if (!this.isMousePointer(event.pointerType)) return;

    const trigger = this.effectiveTrigger();
    if (trigger === KuiTooltipTriggerType.Auto || trigger === KuiTooltipTriggerType.Hover) {
      this.show();
    }
  }

  /** @internal */
  protected hideOnPointerLeave(event: PointerEvent): void {
    if (!this.isMousePointer(event.pointerType)) return;

    const trigger = this.effectiveTrigger();
    if (trigger === KuiTooltipTriggerType.Auto || trigger === KuiTooltipTriggerType.Hover) {
      this.hide();
    }
  }

  /** @internal */
  protected onClick(event: MouseEvent): void {
    const trigger = this.effectiveTrigger();
    const eventPointerType = (event as PointerEvent).pointerType;
    const isTouchClick =
      this.isTouchPointer(this.pointerType) || this.isTouchPointer(eventPointerType);
    this.pointerType = null;

    if (
      trigger === KuiTooltipTriggerType.Click ||
      (trigger === KuiTooltipTriggerType.Auto && isTouchClick)
    ) {
      this.toggleFromTap();
    }
  }

  /** @internal */
  protected show(): void {
    const text = this.kuiTooltip().trim();
    if (
      !text ||
      !isPlatformBrowser(this.platformId) ||
      this.effectiveTrigger() === KuiTooltipTriggerType.None ||
      this.tooltipOverlay
    )
      return;
    this.showWithText(text);
  }

  /**
   * Skips programmatic focus (e.g. a dialog auto-focusing its first focusable child on open) --
   * only real keyboard navigation should surface the tooltip on focus.
   */
  protected showOnFocus(): void {
    const trigger = this.effectiveTrigger();
    if (trigger === KuiTooltipTriggerType.None || trigger === KuiTooltipTriggerType.Click) return;
    if (this.isTouchPointer(this.pointerType)) return;
    if (!this.el.nativeElement.matches(':focus-visible')) return;
    this.show();
  }

  private toggleFromTap(): void {
    if (this.tooltipOverlay) {
      this.hide();
      return;
    }

    this.show();
    if (this.tooltipOverlay) this.startTapDismissal();
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
      placement: this.placement() ?? this.tooltipDefaults()?.placement ?? 'top',
      offset: this.offset() ?? this.tooltipDefaults()?.offset,
      text,
      touchEnabled:
        this.effectiveTrigger() === KuiTooltipTriggerType.Auto ||
        this.effectiveTrigger() === KuiTooltipTriggerType.Click,
    });
    this.visibleTooltipId.set(this.tooltipId);
  }

  /** Update text of an already-visible tooltip. */
  updateText(text: string): void {
    this.tooltipOverlay?.updateText(text);
  }

  /** @internal */
  protected hide(): void {
    this.stopTapDismissal();
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

  private startTapDismissal(): void {
    if (this.tapDismissalCleanup) return;

    const onDocumentClick = (event: MouseEvent): void => {
      const target = event.target as Node | null;
      const tooltip = this.tooltipOverlay?.tooltipEl;
      if (target && (this.el.nativeElement.contains(target) || tooltip?.contains(target))) return;

      this.hide();
    };
    const onDocumentFocusIn = (event: FocusEvent): void => {
      const target = event.target as Node | null;
      const tooltip = this.tooltipOverlay?.tooltipEl;
      if (target && (this.el.nativeElement.contains(target) || tooltip?.contains(target))) return;

      this.hide();
    };
    const onDocumentKeydown = (event: KeyboardEvent): void => {
      if (event.key !== 'Escape') return;

      event.stopPropagation();
      this.hide();
    };

    this.document.addEventListener('click', onDocumentClick, { capture: true });
    this.document.addEventListener('focusin', onDocumentFocusIn, { capture: true });
    this.document.addEventListener('keydown', onDocumentKeydown, { capture: true });
    this.tapDismissalCleanup = () => {
      this.document.removeEventListener('click', onDocumentClick, { capture: true });
      this.document.removeEventListener('focusin', onDocumentFocusIn, { capture: true });
      this.document.removeEventListener('keydown', onDocumentKeydown, { capture: true });
    };
  }

  private stopTapDismissal(): void {
    this.tapDismissalCleanup?.();
    this.tapDismissalCleanup = null;
  }

  private isTouchPointer(pointerType: string | null | undefined): boolean {
    return pointerType === 'touch' || pointerType === 'pen';
  }

  private isMousePointer(pointerType: string | null | undefined): boolean {
    return !pointerType || pointerType === 'mouse';
  }
}
