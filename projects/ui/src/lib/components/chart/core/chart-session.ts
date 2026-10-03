import { Overlay } from '@angular/cdk/overlay';
import type { Signal } from '@angular/core';
import { computed, DestroyRef, inject, PLATFORM_ID, signal } from '@angular/core';

import { injectKuiMessages } from '../../../i18n/inject-kui-messages';
import { KuiI18n } from '../../../i18n/kui-i18n.service';
import type { KuiBoundMessages, KuiChartMessages } from '../../../i18n/kui-messages.interface';
import { kuiNextId } from '../../../utils/kui-id.util';
import type { KuiChartPoint, KuiChartTooltipFormatter, KuiChartValueFormat } from '../chart.types';
import { computeRovingIndex } from './chart-keyboard-nav.util';
import { isTouchPointerType, KuiChartTooltipController } from './chart-tooltip.util';

/** Inputs of {@link KuiChartSession}; each member is a signal or a reader the chart owns. */
export interface KuiChartSessionOptions {
  /** Prefix of the id that ties the chart to its alternative table. */
  readonly idPrefix: string;

  /** The built-in accessible name of the chart type, used when `ariaLabel` is not set. */
  readonly defaultLabel: (messages: KuiBoundMessages<KuiChartMessages>) => string;

  readonly ariaLabel: Signal<string | undefined>;
  readonly messages: Signal<Partial<KuiChartMessages> | undefined>;
  readonly valueFormat: Signal<KuiChartValueFormat | undefined>;
  readonly tooltip: Signal<KuiChartTooltipFormatter | undefined>;

  /** How many marks the chart renders now, for the roving keyboard navigation. */
  readonly markCount: () => number;

  /** The rendered mark elements in order, so keyboard navigation can focus one. */
  readonly markRefs: () => readonly { readonly focus?: () => void }[];
}

/**
 * What the four charts share: which series are hidden, which one the pointer is over, the focused
 * mark, the one shared tooltip, the value format and the pointer, focus and keyboard handlers that
 * drive them. A plain object created in the injection context of the chart that renders it, not a
 * base class: each chart keeps its own inputs, geometry and template and gives the session only its
 * mark count, its mark elements and the text of a mark.
 */
export class KuiChartSession {
  private readonly i18n = inject(KuiI18n);

  /** The chart messages merged for this instance. */
  readonly t = injectKuiMessages('chart', () => this.options.messages());

  /** The accessible name of the whole chart. */
  readonly effectiveAriaLabel = computed(
    () => this.options.ariaLabel() ?? this.options.defaultLabel(this.t()),
  );

  /** Stable id of this chart instance. */
  readonly chartId: string;

  /** Ids of the series (or slices) hidden through the legend. */
  readonly hiddenIds = signal<ReadonlySet<string>>(new Set());

  /** The series or slice under the pointer or the legend hover; the others are dimmed. */
  readonly hoveredSeriesId = signal<string | null>(null);

  /**
   * The single pointer-hovered mark, not its whole series (`hoveredSeriesId` dims the other series).
   * It drives the hover scale-up of `chart.css`; keyboard focus does not trigger it, that state has
   * its own `:focus-visible` ring.
   */
  readonly hoveredMarkKey = signal<string | number | null>(null);

  /** Index of the mark that holds the roving tab stop. */
  readonly focusedMarkIndex = signal(0);

  /** Whether the alternative data table is open. */
  readonly showTable = signal(false);

  private readonly tooltipController = new KuiChartTooltipController(
    inject(Overlay),
    inject(PLATFORM_ID),
  );

  private readonly effectiveValueFormat = computed<KuiChartValueFormat>(() => {
    const own = this.options.valueFormat();
    if (own) return own;

    const format = this.i18n.numberFormat('compact', {
      notation: 'compact',
      maximumFractionDigits: 1,
    });

    return (value) => format.format(value);
  });

  constructor(private readonly options: KuiChartSessionOptions) {
    this.chartId = kuiNextId(options.idPrefix, 1);
    inject(DestroyRef).onDestroy(() => {
      this.tooltipController.hide();
      this.tooltipController.destroy();
    });
  }

  /** Formats a number with the chart's value format. */
  readonly formatValue = (value: number): string => this.effectiveValueFormat()(value);

  /**
   * The text of a cartesian mark: the tooltip formatter when set, else the series and the formatted
   * value, with the category when the mark has one.
   */
  pointText(point: KuiChartPoint): string {
    const formatter = this.options.tooltip();
    if (formatter) return formatter(point);

    const value = this.formatValue(point.value);

    return point.categoryLabel
      ? this.t().pointWithCategory({
          series: point.seriesName,
          category: point.categoryLabel,
          value,
        })
      : this.t().point({ series: point.seriesName, value });
  }

  /** The tooltip formatter of the chart, for charts that build their own mark text. */
  readonly customText = (point: KuiChartPoint): string | undefined =>
    this.options.tooltip()?.(point);

  /**
   * The pointer entered a mark. Mouse hover shows the tooltip at the pointer position, not at the
   * mark's own element (see `KuiChartTooltipController` for why); touch pins the tooltip open,
   * because a touch has no hover to follow and `pointerleave` fires right after release.
   */
  enter(
    seriesId: string,
    key: string | number,
    text: string,
    event: PointerEvent,
    group: Element,
  ): void {
    const point = { x: event.clientX, y: event.clientY };

    if (isTouchPointerType(event.pointerType)) {
      this.tooltipController.showPinned(point, text, group, () => {
        this.hoveredSeriesId.set(null);
        this.hoveredMarkKey.set(null);
      });
    } else {
      this.tooltipController.show(point, text);
    }
    this.hoveredSeriesId.set(seriesId);
    this.hoveredMarkKey.set(key);
  }

  /**
   * A mark got focus. Keyboard focus has no pointer position, so the tooltip anchors to the mark
   * element. A mouse click also fires `focus`; that is skipped when the pointer already hovers the
   * same mark, or the tooltip would jump from the cursor to the element's centre.
   */
  focus(index: number, key: string | number, text: string, target: Element): void {
    this.focusedMarkIndex.set(index);
    if (this.hoveredMarkKey() === key) return;
    this.tooltipController.show(target, text);
  }

  /** Keeps an already shown tooltip following the cursor without touching its text. */
  readonly onPointerMove = (event: PointerEvent): void => {
    this.tooltipController.move({ x: event.clientX, y: event.clientY });
  };

  /**
   * Hides the tooltip only when the pointer leaves the whole marks group, not on every mark's own
   * `pointerleave`: a per-mark handler would dispose and recreate the overlay on every adjacent
   * hover. Touch `pointerleave` is ignored; a pinned tooltip closes on an outside tap or Escape.
   */
  readonly onPointerLeave = (event: PointerEvent): void => {
    if (isTouchPointerType(event.pointerType)) return;
    this.tooltipController.hide();
    this.hoveredSeriesId.set(null);
    this.hoveredMarkKey.set(null);
  };

  /**
   * Hides the tooltip only when focus leaves the whole marks group; moving focus between adjacent
   * marks fires `blur` then `focus` synchronously.
   */
  readonly onFocusOut = (event: FocusEvent, group: Element): void => {
    const next = event.relatedTarget as Node | null;
    if (next && group.contains(next)) return;
    this.tooltipController.hide();
  };

  /**
   * Roving-tabindex keyboard navigation across marks: arrows move by one, Home and End jump to the
   * first and last mark. Only the focused mark is a tab stop.
   */
  readonly onKeydown = (event: KeyboardEvent): void => {
    const next = computeRovingIndex(event.key, this.focusedMarkIndex(), this.options.markCount());
    if (next === null) return;
    event.preventDefault();
    this.focusedMarkIndex.set(next);
    // jsdom (unit tests) does not implement SVGElement.focus(); real browsers do.
    this.options.markRefs()[next]?.focus?.();
  };

  /**
   * Shows or hides a series or slice. Clicking a legend item does not move the pointer away from
   * it, so a hidden item that was hovered would stay "hovered" by id and dim every other mark with
   * nothing highlighted; hiding therefore clears the hover.
   */
  readonly toggle = (id: string): void => {
    const next = new Set(this.hiddenIds());
    const hiding = !next.has(id);
    if (hiding) next.add(id);
    else next.delete(id);
    this.hiddenIds.set(next);
    if (hiding && this.hoveredSeriesId() === id) {
      this.hoveredSeriesId.set(null);
      this.hoveredMarkKey.set(null);
    }
  };

  /** Whether a series or slice is hidden. */
  readonly isHidden = (id: string): boolean => this.hiddenIds().has(id);
}
