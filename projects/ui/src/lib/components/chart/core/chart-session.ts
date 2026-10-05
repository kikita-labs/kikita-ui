import { Overlay } from '@angular/cdk/overlay';
import { DOCUMENT } from '@angular/common';
import type { Signal } from '@angular/core';
import {
  afterNextRender,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  Injector,
  PLATFORM_ID,
  signal,
} from '@angular/core';

import { injectKuiMessages } from '../../../i18n/inject-kui-messages';
import { KuiI18n } from '../../../i18n/kui-i18n';
import type { KuiBoundMessages, KuiChartMessages } from '../../../i18n/kui-messages.interface';
import { kuiNextId } from '../../../utils/kui-id.util';
import type { KuiChartPoint, KuiChartTooltipFormatter, KuiChartValueFormat } from '../chart.types';
import type { KuiChartNavigationModel, KuiChartNavMark } from './chart-keyboard-nav.util';
import { computeNavigationTarget, resolveRovingKey } from './chart-keyboard-nav.util';
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

  /** Every mark the chart can reach with the keyboard, in reading order, rendered or not. */
  readonly marks: () => readonly KuiChartNavMark[];

  /** How the arrow keys move through the marks. */
  readonly navigation: () => KuiChartNavigationModel;
}

/** The mark under a pointer, as the chart resolved it. */
export interface KuiChartPointerHit {
  /** Id of the series (or slice) the mark belongs to. */
  readonly seriesId: string;

  /** Key of the mark. */
  readonly key: string;

  /** Text of the tooltip. */
  readonly text: string;
}

/**
 * What the four charts share: which series are hidden, which one the pointer is over, the focused
 * mark, the one shared tooltip, the value format and the pointer, focus and keyboard handlers that
 * drive them. A plain object created in the injection context of the chart that renders it, not a
 * base class: each chart keeps its own inputs, geometry and template and gives the session only its
 * marks and the text of a mark.
 *
 * The roving tab stop is kept as the key of a mark, not as a position, so hiding a series or
 * changing the data moves it to the nearest mark that remains instead of to whatever now has the
 * old index.
 */
export class KuiChartSession {
  private readonly i18n = inject(KuiI18n);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly injector = inject(Injector);
  private readonly document = inject(DOCUMENT);

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

  /** The series or slice under the pointer, in focus or hovered in the legend; the others are dimmed. */
  readonly hoveredSeriesId = signal<string | null>(null);

  /**
   * The single pointer-hovered mark, not its whole series (`hoveredSeriesId` dims the other series).
   * It drives the hover scale-up of `chart.css`; keyboard focus does not trigger it, that state has
   * its own `:focus-visible` ring.
   */
  readonly hoveredMarkKey = signal<string | number | null>(null);

  /** Key of the mark the user last moved the roving tab stop to, which may no longer exist. */
  private readonly requestedKey = signal<string | null>(null);

  /** Whether the alternative data table is open. */
  readonly showTable = signal(false);

  /** Where the roving tab stop was, so it can move to a neighbour when its mark disappears. */
  private lastPosition: { series: number; category: number } | null = null;
  private focusInside = false;

  private readonly tooltipController = new KuiChartTooltipController(
    inject(Overlay),
    inject(PLATFORM_ID),
    this.document,
  );

  /**
   * The key of the mark that holds the roving tab stop: the one the user chose while it still exists,
   * otherwise the nearest remaining one, so the chart always has exactly one tab stop.
   */
  readonly rovingKey = computed(() =>
    resolveRovingKey(this.options.marks(), this.requestedKey(), this.lastPosition),
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
   * The text of a mark: the tooltip formatter when set, else the series with the formatted value and
   * the category when the mark has one, or with the data coordinates (and the radius of a bubble)
   * when it is a scatter point.
   */
  pointText(point: KuiChartPoint): string {
    const formatter = this.options.tooltip();
    if (formatter) return formatter(point);

    const value = this.formatValue(point.value);

    if (point.x !== undefined && point.y !== undefined) {
      const x = this.formatValue(point.x);
      const y = this.formatValue(point.y);

      return point.r === undefined
        ? this.t().scatterPoint({ series: point.seriesName, x, y })
        : this.t().bubblePoint({
            series: point.seriesName,
            x,
            y,
            radius: this.formatValue(point.r),
          });
    }

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
   * mark's own element, and it follows the pointer from then on; touch pins the tooltip open,
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
   * The pointer moved over the plot of a chart that resolves marks itself (line, bar, scatter): `hit`
   * is the mark under it, or `null` when there is none. A new mark shows its tooltip, the same mark
   * only follows the pointer, and no mark lets the tooltip go. A touch pins the tooltip on the mark it
   * taps instead of following a finger.
   */
  hover(hit: KuiChartPointerHit | null, event: PointerEvent, group: Element): void {
    const touch = isTouchPointerType(event.pointerType);

    if (!hit) {
      if (touch) return;
      this.tooltipController.resetDismissed();
      this.tooltipController.hide();
      this.hoveredSeriesId.set(null);
      this.hoveredMarkKey.set(null);

      return;
    }

    if (touch || this.hoveredMarkKey() !== hit.key) {
      this.enter(hit.seriesId, hit.key, hit.text, event, group);
    } else {
      this.onPointerMove(event);
    }
  }

  /**
   * A mark got focus. Keyboard focus has no pointer position, so the tooltip anchors to the mark
   * element. A mouse click also fires `focus`; that is skipped when the pointer already hovers the
   * same mark, or the tooltip would jump from the cursor to the element's centre. Focus mirrors hover:
   * it highlights the series the same way.
   */
  focus(key: string, seriesId: string, text: string, target: Element): void {
    this.focusInside = true;
    this.moveRoving(key);
    this.hoveredSeriesId.set(seriesId);

    if (this.hoveredMarkKey() === key) return;
    // Moving focus is a new intentional trigger, so it may show a tooltip that Escape closed.
    this.tooltipController.resetDismissed();
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
    // A later hover may show the tooltip again after an Escape.
    this.tooltipController.resetDismissed();
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
    this.focusInside = false;
    this.hoveredSeriesId.set(null);
    this.tooltipController.resetDismissed();
    this.tooltipController.hide();
  };

  /**
   * Arrow-key navigation across marks: the keys of the chart's navigation model move to the next mark,
   * Home and End jump to the first and last. DOM focus follows, and only the focused mark is a tab
   * stop.
   */
  readonly onKeydown = (event: KeyboardEvent): void => {
    const target = computeNavigationTarget(
      this.options.navigation(),
      event.key,
      this.rovingKey(),
      this.options.marks(),
    );
    if (target === null) return;

    event.preventDefault();
    this.moveRoving(target);
    this.focusMark(target);
  };

  /** Moves the roving tab stop to `key` and remembers where it is. */
  moveRoving(key: string): void {
    const mark = this.options.marks().find((candidate) => candidate.key === key);
    if (mark) this.lastPosition = { series: mark.series, category: mark.category };

    this.requestedKey.set(key);
  }

  /**
   * Moves DOM focus to the element of the mark with `key`. The element may not be rendered yet (a
   * dense line chart draws only the mark that holds the tab stop), so focus waits for the next render.
   */
  focusMark(key: string): void {
    if (this.focusElement(key)) return;

    afterNextRender(() => this.focusElement(key), { injector: this.injector });
  }

  /**
   * Called by a chart after its marks changed. When focus was on a mark that is gone, the browser
   * dropped it on the page; this brings it back to the mark that now holds the tab stop.
   */
  restoreFocus(): void {
    if (!this.focusInside) return;

    afterNextRender(
      () => {
        const active = this.document.activeElement;
        if (active && active !== this.document.body && this.host.contains(active)) return;
        if (active && active !== this.document.body) {
          this.focusInside = false;
          return;
        }

        const key = this.rovingKey();
        if (key !== null) this.focusElement(key);
      },
      { injector: this.injector },
    );
  }

  private focusElement(key: string): boolean {
    // Only a quote or a backslash can end the quoted attribute value early.
    const escaped = key.replace(/["\\]/gu, '\\$&');
    const element = this.host.querySelector<SVGElement>(`[data-kui-mark="${escaped}"]`);
    if (!element) return false;

    // `focus` is missing on SVG elements in jsdom; every browser has it.
    (element as { focus?: () => void }).focus?.();

    return true;
  }

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
