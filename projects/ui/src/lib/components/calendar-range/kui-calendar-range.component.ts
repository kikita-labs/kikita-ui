import {
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  signal,
  ViewEncapsulation,
} from '@angular/core';

import { isSameDay, startOfDay, startOfMonth } from '../../foundation/date/kui-calendar-date.util';
import type { KuiCalendarMessages } from '../../i18n/kui-messages.interface';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { KuiClock } from '../../utils/kui-clock.service';
import { optionalBooleanAttribute } from '../../utils/kui-input-transform.util';
import { KuiButtonDirective } from '../button/kui-button.directive';
import type {
  KuiCalendarDisabledPredicate,
  KuiCalendarSize,
  KuiDateRange,
} from '../calendar/kui-calendar.types';
import { KuiCalendarEngine } from '../calendar/kui-calendar-engine';
import { KuiGlyphComponent } from '../icon/kui-glyph.component';
import { KuiSeparatorDirective } from '../separator/kui-separator.directive';

/**
 * Inline month-grid date-range picker with month/year/decade navigation. Same visual grid
 * behavior as `kui-calendar` (month/year/decade nav, day-cell rendering, disabled dates,
 * locale, keyboard nav), but selects a start/end pair instead of a single date: first click
 * sets the start, hovering before the second click previews the range, second click commits it.
 *
 * @example
 * ```html
 * <kui-calendar-range [(value)]="selectedRange" />
 * <kui-calendar-range size="sm" [(value)]="selectedRange" />
 * ```
 */
@Component({
  selector: 'kui-calendar-range',
  // The grid, header and footer are the template of `kui-calendar`; only the selection differs.
  templateUrl: '../calendar/kui-calendar.component.html',
  host: {
    class: 'kui-calendar',
    '[attr.data-kui-size]': "engine.effectiveSize() === 'sm' ? 'sm' : null",
    '[attr.data-kui-flat]': "engine.effectiveFlat() ? '' : null",
    'data-kui-range': '',
  },
  imports: [KuiButtonDirective, KuiSeparatorDirective, KuiGlyphComponent],
  encapsulation: ViewEncapsulation.None,
})
/** Displays a navigable calendar grid for selecting a start/end date range. */
export class KuiCalendarRangeComponent {
  private readonly clock = inject(KuiClock);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly calendarDefaults = inject(KuiDefaults).get('calendarRange');

  /** Visual density. `sm` is a compact, border/padding-less variant for sidebars. */
  readonly size = input<KuiCalendarSize | undefined>();
  /**
   * Strips the calendar's own background/border/padding. Set this when nesting it inside
   * chrome that already provides those — e.g. a `kui-dropdown`/`kui-popover` — so the two
   * don't stack into a double frame.
   */
  readonly flat = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });
  /** Shows Saturday/Sunday in a muted color. Defaults to true. */
  readonly showWeekend = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });
  /**
   * Shows a footer with the current value and a "Today" shortcut button. Defaults to
   * false — most inline placements (sidebars, filter panels) render the calendar bare.
   */
  readonly showFooter = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });
  /** Earliest selectable date (inclusive). Dates before it are disabled. */
  readonly minDate = input<Date | undefined>(undefined);
  /** Latest selectable date (inclusive). Dates after it are disabled. */
  readonly maxDate = input<Date | undefined>(undefined);
  /** Individual dates to disable, or a predicate called with each rendered date. */
  readonly disabledDates = input<Date[] | KuiCalendarDisabledPredicate | undefined>(undefined);
  /**
   * BCP 47 locale tag overriding the app-wide `KUI_LOCALE` default for this instance
   * (month/weekday names and first day of week).
   */
  readonly locale = input<string | undefined>(undefined);
  /** Per-instance text overrides; they win over the scoped and root messages. */
  readonly messages = input<Partial<KuiCalendarMessages> | undefined>(undefined);
  /**
   * Shows the "previous" nav control in the header. Defaults to true. Set to false when
   * pairing two linked calendars (e.g. a range popover showing month N and N+1) so only
   * the leading calendar can navigate backward.
   */
  readonly showPrevNav = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });
  /** Shows the "next" nav control in the header. Defaults to true. See {@link showPrevNav}. */
  readonly showNextNav = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBooleanAttribute,
  });

  /**
   * Selected range. Supports two-way binding. `end` is `null` while the range is still open
   * (only the start date has been picked); the first click after a committed range starts a
   * new one.
   */
  readonly value = model<KuiDateRange | null>(null);
  /**
   * First-of-month date the grid currently displays. Supports two-way binding so a
   * consumer can drive the visible month externally — e.g. keeping two calendars a
   * month apart in a range popover.
   */
  readonly viewDate = model<Date>(startOfMonth(this.clock.initialNow()));

  private readonly hoverDate = signal<Date | null>(null);

  private readonly committedRange = computed<{ lo: Date; hi: Date; committed: boolean } | null>(
    () => {
      const val = this.value();
      const hover = this.hoverDate();
      if (val?.start && val.end) {
        const [lo, hi] =
          val.start.getTime() <= val.end.getTime() ? [val.start, val.end] : [val.end, val.start];
        return { lo, hi, committed: true };
      }
      if (val?.start && hover) {
        const [lo, hi] =
          val.start.getTime() <= hover.getTime() ? [val.start, hover] : [hover, val.start];
        return { lo, hi, committed: false };
      }
      if (val?.start) return { lo: val.start, hi: val.start, committed: false };
      return null;
    },
  );

  /** Grid, navigation, keyboard and labels; the selection below is what makes it a range. */
  protected readonly engine = new KuiCalendarEngine({
    host: this.host,
    injector: this.injector,
    defaults: this.calendarDefaults,
    viewDate: this.viewDate,
    size: this.size,
    flat: this.flat,
    showWeekend: this.showWeekend,
    showFooter: this.showFooter,
    showPrevNav: this.showPrevNav,
    showNextNav: this.showNextNav,
    minDate: this.minDate,
    maxDate: this.maxDate,
    disabledDates: this.disabledDates,
    locale: this.locale,
    messages: this.messages,
    selection: {
      anchor: () => this.value()?.start ?? null,
      dayState: (date) => {
        const range = this.committedRange();

        if (!range) return { classes: '', ariaSelected: null };

        const { lo, hi, committed } = range;

        if (isSameDay(date, lo) || isSameDay(date, hi)) {
          if (isSameDay(lo, hi)) {
            return { classes: ' kui-calendar-day--selected', ariaSelected: 'true' };
          }

          if (isSameDay(date, lo)) {
            return {
              classes: committed
                ? ' kui-calendar-day--range-start'
                : ' kui-calendar-day--preview kui-calendar-day--preview-start',
              ariaSelected: 'true',
            };
          }

          return {
            classes: committed
              ? ' kui-calendar-day--range-end'
              : ' kui-calendar-day--preview kui-calendar-day--preview-end',
            ariaSelected: 'true',
          };
        }

        if (date.getTime() > lo.getTime() && date.getTime() < hi.getTime()) {
          return {
            classes: committed ? ' kui-calendar-day--range-middle' : ' kui-calendar-day--preview',
            ariaSelected: null,
          };
        }

        return { classes: '', ariaSelected: null };
      },
      select: (date) => {
        const current = this.value();
        if (!current?.start || current.end) {
          this.value.set({ start: startOfDay(date), end: null });
        } else if (date.getTime() < current.start.getTime()) {
          this.value.set({ start: startOfDay(date), end: current.start });
        } else {
          this.value.set({ start: current.start, end: startOfDay(date) });
        }
        this.hoverDate.set(null);
      },
      hover: (date) => {
        const current = this.value();
        if (current?.start && !current.end) {
          this.hoverDate.set(date);
        }
      },
      valueLabel: (formatIso) => {
        const range = this.value();
        if (!range?.start) return '—';
        if (!range.end) return `${formatIso(range.start)} – …`;
        return `${formatIso(range.start)} – ${formatIso(range.end)}`;
      },
    },
  });
}
