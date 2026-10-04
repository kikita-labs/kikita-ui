import {
  Component,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  type OnInit,
  ViewEncapsulation,
} from '@angular/core';

import { isSameDay, startOfDay, startOfMonth } from '../../foundation/date/kui-calendar-date.util';
import type { KuiCalendarMessages } from '../../i18n/kui-messages.interface';
import { KuiDefaults } from '../../providers/kui-defaults';
import { KuiClock } from '../../utils/kui-clock';
import { optionalBooleanAttribute } from '../../utils/kui-input-transform.util';
import { KUI_PICKED_EVENT } from '../../utils/kui-picked-event';
import { KuiButton } from '../button/kui-button';
import { KUI_FIELD_CALENDAR, registerKuiFieldPart } from '../field/kui-field-host.token';
import { KuiGlyph } from '../icon/kui-glyph';
import { KuiSeparator } from '../separator/kui-separator';
import type { KuiCalendarDisabledPredicate, KuiCalendarSize } from './kui-calendar.types';
import { KuiCalendarEngine } from './kui-calendar-engine';

/**
 * Inline month-grid single-date picker with month/year/decade navigation. Building block for
 * date pickers that open it in a popover, but also usable inline (sidebars, filter panels).
 * When placed as a sibling of `input[kuiDatePicker]` inside the same `kui-field`, the directive
 * auto-wires this calendar to its own value — no manual `[value]`/`(valueChange)` binding is
 * needed in that case. For range selection use `kui-calendar-range` instead.
 *
 * @example
 * ```html
 * <kui-calendar [(value)]="selectedDate" />
 * <kui-calendar size="sm" [(value)]="selectedDate" />
 * ```
 */
@Component({
  selector: 'kui-calendar',
  templateUrl: './kui-calendar.html',
  host: {
    class: 'kui-calendar',
    '[attr.data-kui-size]': "engine.effectiveSize() === 'sm' ? 'sm' : null",
    '[attr.data-kui-flat]': "engine.effectiveFlat() ? '' : null",
  },
  imports: [KuiButton, KuiSeparator, KuiGlyph],
  encapsulation: ViewEncapsulation.None,
})
/** Displays a navigable calendar grid for selecting a single date. */
export class KuiCalendar implements OnInit {
  private readonly clock = inject(KuiClock);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly calendarDefaults = inject(KuiDefaults).get('calendar');

  /** Visual density. `sm` is a compact, border/padding-less variant for sidebars. */
  readonly size = input<KuiCalendarSize | undefined>();
  /**
   * Strips the calendar's own background/border/padding. Set this when nesting it inside
   * chrome that already provides those — e.g. a `kui-dropdown`/`kui-popover` in a date
   * picker — so the two don't stack into a double frame.
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
  /**
   * Earliest selectable date (inclusive). Dates before it are disabled. A `model` (not a
   * plain `input`) so `input[kuiDatePicker]` can auto-wire it from its own `minDate`, the
   * same way it auto-wires `value`/`viewDate` — see {@link value}.
   */
  readonly minDate = model<Date | undefined>(undefined);
  /** Latest selectable date (inclusive). Dates after it are disabled. See {@link minDate}. */
  readonly maxDate = model<Date | undefined>(undefined);
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
   * Selected date. Supports two-way binding. When this calendar is a sibling of
   * `input[kuiDatePicker]` inside the same `kui-field`, the directive auto-wires this model to
   * its own value — manual `[(value)]` binding is unnecessary there (and if still bound, the
   * directive's own value wins, since it drives the wiring effect).
   */
  readonly value = model<Date | null>(null);
  /**
   * First-of-month date the grid currently displays. Supports two-way binding so a
   * consumer can drive the visible month externally — e.g. keeping two calendars a
   * month apart in a range popover.
   */
  readonly viewDate = model<Date>(startOfMonth(this.clock.initialNow()));

  /** Grid, navigation, keyboard and labels; the selection below is what makes it single-date. */
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
      anchor: () => this.value(),
      dayState: (date) => {
        const single = this.value();

        return single && isSameDay(date, single)
          ? { classes: ' kui-calendar-day--selected', ariaSelected: 'true' }
          : { classes: '', ariaSelected: null };
      },
      select: (date) => this.value.set(startOfDay(date)),
      hover: () => undefined,
      valueLabel: (formatIso) => {
        const val = this.value();
        return val ? formatIso(val) : '—';
      },
    },
    // A host panel such as `kui-dropdown` closes itself on this event.
    onSelected: () =>
      this.host.nativeElement.dispatchEvent(new CustomEvent(KUI_PICKED_EVENT, { bubbles: true })),
  });

  constructor() {
    registerKuiFieldPart(KUI_FIELD_CALENDAR, this);
  }

  ngOnInit(): void {
    this.engine.seedFocus();
  }
}
