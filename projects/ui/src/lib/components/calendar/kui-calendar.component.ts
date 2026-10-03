import {
  afterNextRender,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  model,
  type OnInit,
  signal,
  ViewEncapsulation,
} from '@angular/core';

import {
  addDays,
  addMonths,
  addYears,
  decadeStart,
  isSameDay,
  startOfDay,
  startOfMonth,
  startOfWeek,
  weekdayIndex,
} from '../../foundation/date/kui-calendar-date.util';
import { injectKuiMessages } from '../../i18n/inject-kui-messages';
import { getKuiCalendarLocaleText } from '../../i18n/kui-calendar-locale-text.util';
import { KuiI18n } from '../../i18n/kui-i18n.service';
import { resolveKuiLocale } from '../../i18n/kui-locale-resolve.util';
import type { KuiCalendarMessages } from '../../i18n/kui-messages.interface';
import { KuiDefaults } from '../../providers/kui-defaults.service';
import { injectKuiRootSizeDefault } from '../../providers/kui-defaults.util';
import {
  KUI_CALENDAR_SIZES,
  type KuiCalendarNavigationView,
} from '../../utils/kui-calendar-navigation.util';
import { KuiClock } from '../../utils/kui-clock.service';
import { optionalBooleanAttribute } from '../../utils/kui-input-transform.util';
import { KUI_PICKED_EVENT } from '../../utils/kui-picked-event';
import { KuiButtonDirective } from '../button/kui-button.directive';
import { KUI_FIELD_CALENDAR, registerKuiFieldPart } from '../field/kui-field-host.token';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_CHEVRON_LEFT, KUI_GLYPH_CHEVRON_RIGHT } from '../icon/kui-chrome-glyphs';
import { KuiGlyphComponent } from '../icon/kui-glyph.component';
import { KuiSeparatorDirective } from '../separator/kui-separator.directive';
import type { KuiCalendarDisabledPredicate, KuiCalendarSize } from './kui-calendar.types';

interface KuiCalendarDayCell {
  date: Date;
  label: string;
  ariaLabel: string;
  cls: string;
  tabIndex: 0 | -1;
  ariaSelected: 'true' | null;
  ariaCurrent: 'date' | null;
  ariaDisabled: 'true' | null;
  disabled: boolean;
}

interface KuiCalendarPickerCell {
  label: string;
  /** The month or year that is currently shown; it holds the Tab stop of its grid. */
  active: boolean;
  cls: string;
  onClick: () => void;
}

type KuiCalendarView = KuiCalendarNavigationView;

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
  template: `
    <ng-content select="[kuiCalendarHeader]">
      <div class="kui-calendar-header">
        @if (effectiveShowPrevNav()) {
          <button
            kuiButton
            shape="ghost"
            size="xs"
            type="button"
            [attr.aria-label]="navLabels().prev"
            (click)="navPrev()"
          >
            <svg width="16" height="16" [kuiGlyph]="previousGlyph()" [kuiGlyphStroke]="2"></svg>
          </button>
        } @else {
          <span class="kui-calendar-nav-spacer"></span>
        }
        @if (view() !== 'years') {
          <button
            kuiButton
            shape="ghost"
            class="kui-calendar-title"
            type="button"
            (click)="drillUp()"
          >
            {{ headerLabel() }}
          </button>
        } @else {
          <span class="kui-calendar-title">{{ headerLabel() }}</span>
        }
        @if (effectiveShowNextNav()) {
          <button
            kuiButton
            shape="ghost"
            size="xs"
            type="button"
            [attr.aria-label]="navLabels().next"
            (click)="navNext()"
          >
            <svg width="16" height="16" [kuiGlyph]="nextGlyph()" [kuiGlyphStroke]="2"></svg>
          </button>
        } @else {
          <span class="kui-calendar-nav-spacer"></span>
        }
      </div>
    </ng-content>

    <div aria-live="polite" class="sr-only">{{ liveAnnounce() }}</div>

    @if (view() === 'days') {
      <div class="kui-calendar-table" role="grid" [attr.aria-label]="t().label">
        <div class="kui-calendar-weekdays" role="row">
          @for (name of localeText().weekdaysShort; track name; let i = $index) {
            <span
              class="kui-calendar-weekday"
              role="columnheader"
              [attr.abbr]="localeText().weekdaysLong[i]"
              >{{ name }}</span
            >
          }
        </div>
        <div class="kui-calendar-grid" role="rowgroup">
          @for (week of dayWeeks(); track week[0].date.getTime()) {
            <div class="kui-calendar-week" role="row">
              @for (cell of week; track cell.date.getTime()) {
                <div
                  class="kui-calendar-cell"
                  role="gridcell"
                  [attr.aria-selected]="cell.ariaSelected"
                >
                  <button
                    class="{{ cell.cls }}"
                    type="button"
                    [tabIndex]="cell.tabIndex"
                    [attr.aria-label]="cell.ariaLabel"
                    [attr.aria-current]="cell.ariaCurrent"
                    [attr.aria-disabled]="cell.ariaDisabled"
                    (keydown)="onGridKeyDown($event)"
                    (click)="!cell.disabled && selectDate(cell.date)"
                    (focus)="focusedDate.set(cell.date)"
                  >
                    <span class="kui-calendar-day-inner">{{ cell.label }}</span>
                  </button>
                </div>
              }
            </div>
          }
        </div>
      </div>
    }

    @if (view() === 'months') {
      <div class="kui-calendar-picker-grid">
        @for (cell of monthCells(); track cell.label) {
          <button
            class="{{ cell.cls }}"
            type="button"
            [tabIndex]="cell.active ? 0 : -1"
            (click)="cell.onClick()"
            (keydown)="onPickerKeyDown($event)"
          >
            {{ cell.label }}
          </button>
        }
      </div>
    }

    @if (view() === 'years') {
      <div class="kui-calendar-picker-grid">
        @for (cell of yearCells(); track cell.label) {
          <button
            class="{{ cell.cls }}"
            type="button"
            [tabIndex]="cell.active ? 0 : -1"
            (click)="cell.onClick()"
            (keydown)="onPickerKeyDown($event)"
          >
            {{ cell.label }}
          </button>
        }
      </div>
    }

    <ng-content select="[kuiCalendarFooter]">
      @if (effectiveShowFooter()) {
        <hr kuiSeparator />
        <div class="kui-calendar-footer">
          <span class="kui-calendar-value">{{ valueLabel() }}</span>
          <button kuiButton shape="ghost" size="xs" type="button" (click)="goToday()">
            {{ t().today }}
          </button>
        </div>
      }
    </ng-content>
  `,
  host: {
    class: 'kui-calendar',
    '[attr.data-kui-size]': "effectiveSize() === 'sm' ? 'sm' : null",
    '[attr.data-kui-flat]': "effectiveFlat() ? '' : null",
  },
  imports: [KuiButtonDirective, KuiSeparatorDirective, KuiGlyphComponent],
  encapsulation: ViewEncapsulation.None,
})
/** Displays a navigable calendar grid for selecting a single date. */
export class KuiCalendarComponent implements OnInit {
  protected readonly previousGlyph = injectKuiGlyph({
    role: 'previous',
    slot: () => this.calendarDefaults()?.previousIcon,
    fallback: KUI_GLYPH_CHEVRON_LEFT,
  });

  protected readonly nextGlyph = injectKuiGlyph({
    role: 'next',
    slot: () => this.calendarDefaults()?.nextIcon,
    fallback: KUI_GLYPH_CHEVRON_RIGHT,
  });

  private readonly clock = inject(KuiClock);

  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly i18n = inject(KuiI18n);
  private readonly rootDefaultSize = injectKuiRootSizeDefault<KuiCalendarSize>(KUI_CALENDAR_SIZES);

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

  protected readonly t = injectKuiMessages('calendar', () => this.messages());

  private readonly activeLocale = computed(() => {
    const own = this.locale();
    return own ? resolveKuiLocale(own) : this.i18n.locale();
  });
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

  protected readonly view = signal<KuiCalendarView>('days');
  protected readonly focusedDate = signal<Date>(startOfDay(this.clock.initialNow()));
  protected readonly liveAnnounce = signal('');
  private readonly calendarDefaults = inject(KuiDefaults).get('calendar');

  protected readonly effectiveSize = computed(
    () => this.size() ?? this.calendarDefaults()?.size ?? this.rootDefaultSize() ?? 'md',
  );
  protected readonly effectiveFlat = computed(
    () => this.flat() ?? this.calendarDefaults()?.flat ?? false,
  );
  protected readonly effectiveShowWeekend = computed(
    () => this.showWeekend() ?? this.calendarDefaults()?.showWeekend ?? true,
  );
  protected readonly effectiveShowFooter = computed(
    () => this.showFooter() ?? this.calendarDefaults()?.showFooter ?? false,
  );
  protected readonly effectiveShowPrevNav = computed(
    () => this.showPrevNav() ?? this.calendarDefaults()?.showPrevNav ?? true,
  );
  protected readonly effectiveShowNextNav = computed(
    () => this.showNextNav() ?? this.calendarDefaults()?.showNextNav ?? true,
  );

  protected readonly viewYear = computed(() => this.viewDate().getFullYear());
  protected readonly viewMonth = computed(() => this.viewDate().getMonth());

  private readonly today = this.clock.today;

  constructor() {
    registerKuiFieldPart(KUI_FIELD_CALENDAR, this);

    const initial = this.value();
    if (initial) this.viewDate.set(startOfMonth(initial));

    // A server-rendered page first shows the server's month and day; move to the browser's once
    // hydrated, unless the value or the visible month was already set.
    afterNextRender(() => {
      this.clock.followBrowserDate(this.viewDate, startOfMonth);
      this.clock.followBrowserDate(this.focusedDate, startOfDay);
    });
  }

  ngOnInit(): void {
    const viewDate = this.viewDate();
    const initial = this.value();
    const isInView = (date: Date): boolean =>
      date.getFullYear() === viewDate.getFullYear() && date.getMonth() === viewDate.getMonth();
    const candidate =
      initial && isInView(initial) ? initial : isInView(this.today()) ? this.today() : viewDate;

    this.focusedDate.set(candidate);
  }

  protected readonly localeText = computed(() => {
    const locale = this.activeLocale();
    return this.i18n.cached(`calendar:${locale}`, () => getKuiCalendarLocaleText(locale));
  });

  private monthYearLabel(year: number, month: number): string {
    const locale = this.activeLocale();
    const format = this.i18n.dateFormat(locale, 'monthYear', { month: 'long', year: 'numeric' });
    const date = new Date(Date.UTC(2000, month, 1));
    date.setUTCFullYear(year);

    return format.format(date);
  }

  private fullDateLabel(date: Date): string {
    const locale = this.activeLocale();
    const format = this.i18n.dateFormat(locale, 'fullDate', { dateStyle: 'full' });
    const utc = new Date(Date.UTC(2000, date.getMonth(), date.getDate()));
    utc.setUTCFullYear(date.getFullYear());

    return format.format(utc);
  }

  protected readonly navLabels = computed(() => {
    const t = this.t();
    const view = this.view();

    if (view === 'days') return { prev: t.previousMonth, next: t.nextMonth };
    if (view === 'months') return { prev: t.previousYear, next: t.nextYear };
    return { prev: t.previousDecade, next: t.nextDecade };
  });

  protected readonly headerLabel = computed(() => {
    const view = this.view();
    const year = this.viewYear();
    if (view === 'months') return String(year);
    if (view === 'years') {
      const start = decadeStart(year);
      return `${start}–${start + 11}`;
    }
    return this.monthYearLabel(year, this.viewMonth());
  });

  /**
   * The day that holds the roving tab stop. It is the focused day while that day is visible; after
   * the month changes it falls back to the selected day, today or the first of the month, so the
   * grid always has exactly one Tab stop.
   */
  private readonly tabStop = computed<Date>(() => {
    const inView = (date: Date): boolean =>
      date.getFullYear() === this.viewYear() && date.getMonth() === this.viewMonth();
    const focused = this.focusedDate();
    if (inView(focused)) return focused;
    const selected = this.value();
    if (selected && inView(selected)) return selected;
    if (inView(this.today())) return this.today();
    return new Date(this.viewYear(), this.viewMonth(), 1);
  });

  protected readonly dayCells = computed<KuiCalendarDayCell[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const firstDayOfWeek = this.localeText().firstDayOfWeek;
    const focused = this.tabStop();
    const single = this.value();

    const firstOfMonth = new Date(year, month, 1);
    const leading = weekdayIndex(firstOfMonth, firstDayOfWeek);
    const gridStart = addDays(firstOfMonth, -leading);

    const cells: KuiCalendarDayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const date = addDays(gridStart, i);
      const muted = date.getMonth() !== month;
      const weekend =
        this.effectiveShowWeekend() && this.localeText().weekend.includes(date.getDay());
      const isToday = isSameDay(date, this.today());
      const disabled = this.isDisabled(date);

      let cls = 'kui-calendar-day';
      if (muted) cls += ' kui-calendar-day--muted';
      if (weekend) cls += ' kui-calendar-day--weekend';
      if (isToday) cls += ' kui-calendar-day--today';
      if (disabled) cls += ' kui-calendar-day--disabled';

      let ariaSelected: 'true' | null = null;
      if (single && isSameDay(date, single)) {
        cls += ' kui-calendar-day--selected';
        ariaSelected = 'true';
      }

      cells.push({
        date,
        label: String(date.getDate()),
        ariaLabel: this.fullDateLabel(date),
        cls,
        tabIndex: isSameDay(date, focused) ? 0 : -1,
        ariaSelected,
        ariaCurrent: isToday ? 'date' : null,
        ariaDisabled: disabled ? 'true' : null,
        disabled,
      });
    }
    return cells;
  });

  /** The 42 day cells grouped into six week rows, as the ARIA grid structure requires. */
  protected readonly dayWeeks = computed<KuiCalendarDayCell[][]>(() => {
    const cells = this.dayCells();
    return Array.from({ length: 6 }, (_, week) => cells.slice(week * 7, week * 7 + 7));
  });

  protected readonly monthCells = computed<KuiCalendarPickerCell[]>(() => {
    const activeMonth = this.viewMonth();
    return this.localeText().monthsShort.map((label, idx) => ({
      label,
      active: idx === activeMonth,
      cls:
        'kui-calendar-picker-cell' +
        (idx === activeMonth ? ' kui-calendar-picker-cell--active' : ''),
      onClick: () => {
        this.viewDate.set(new Date(this.viewYear(), idx, 1));
        this.view.set('days');
        this.focusActiveDay();
        this.liveAnnounce.set(this.monthYearLabel(this.viewYear(), idx));
      },
    }));
  });

  protected readonly yearCells = computed<KuiCalendarPickerCell[]>(() => {
    const activeYear = this.viewYear();
    const start = decadeStart(activeYear) - 1;
    return Array.from({ length: 12 }, (_, i) => start + i).map((year) => ({
      label: String(year),
      active: year === activeYear,
      cls:
        'kui-calendar-picker-cell' +
        (year === activeYear ? ' kui-calendar-picker-cell--active' : '') +
        (year === start || year === start + 11 ? ' kui-calendar-picker-cell--muted' : ''),
      onClick: () => {
        this.viewDate.set(new Date(year, this.viewMonth(), 1));
        this.view.set('months');
        this.focusActiveDay();
      },
    }));
  });

  protected readonly valueLabel = computed(() => {
    const val = this.value();
    return val ? this.formatIso(val) : '—';
  });

  private isDisabled(date: Date): boolean {
    const min = this.minDate();
    const max = this.maxDate();
    if (min && date.getTime() < startOfDay(min).getTime()) return true;
    if (max && date.getTime() > startOfDay(max).getTime()) return true;
    const disabledDates = this.disabledDates();
    if (typeof disabledDates === 'function') return disabledDates(date);
    if (Array.isArray(disabledDates)) return disabledDates.some((d) => isSameDay(d, date));
    return false;
  }

  private formatIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  protected selectDate(date: Date): void {
    this.value.set(startOfDay(date));
    this.focusedDate.set(startOfDay(date));
    if (date.getMonth() !== this.viewMonth() || date.getFullYear() !== this.viewYear()) {
      this.viewDate.set(startOfMonth(date));
    }
    this.host.nativeElement.dispatchEvent(new CustomEvent(KUI_PICKED_EVENT, { bubbles: true }));
  }

  protected drillUp(): void {
    this.view.set(this.view() === 'days' ? 'months' : 'years');
    this.focusActiveDay();
  }

  protected navPrev(): void {
    this.navigate(-1);
  }

  protected navNext(): void {
    this.navigate(1);
  }

  private navigate(direction: 1 | -1): void {
    const view = this.view();
    if (view === 'days') {
      this.viewDate.set(addMonths(this.viewDate(), direction));
    } else if (view === 'months') {
      this.viewDate.set(new Date(this.viewYear() + direction, this.viewMonth(), 1));
    } else {
      this.viewDate.set(new Date(this.viewYear() + direction * 10, this.viewMonth(), 1));
    }
  }

  protected goToday(): void {
    this.view.set('days');
    this.viewDate.set(startOfMonth(this.today()));
    this.focusedDate.set(this.today());
  }

  private moveFocus(date: Date): void {
    if (date.getMonth() !== this.viewMonth() || date.getFullYear() !== this.viewYear()) {
      this.viewDate.set(startOfMonth(date));
    }
    this.focusedDate.set(date);
  }

  protected onGridKeyDown(event: KeyboardEvent): void {
    if (this.view() !== 'days') return;
    const firstDayOfWeek = this.localeText().firstDayOfWeek;
    let date = this.focusedDate();
    switch (event.key) {
      case 'ArrowLeft':
        date = addDays(date, -1);
        break;
      case 'ArrowRight':
        date = addDays(date, 1);
        break;
      case 'ArrowUp':
        date = addDays(date, -7);
        break;
      case 'ArrowDown':
        date = addDays(date, 7);
        break;
      case 'PageUp':
        date = event.shiftKey ? addYears(date, -1) : addMonths(date, -1);
        break;
      case 'PageDown':
        date = event.shiftKey ? addYears(date, 1) : addMonths(date, 1);
        break;
      case 'Home':
        date = startOfWeek(date, firstDayOfWeek);
        break;
      case 'End':
        date = addDays(startOfWeek(date, firstDayOfWeek), 6);
        break;
      case 'Enter':
      case ' ':
        if (!this.isDisabled(date)) this.selectDate(date);
        event.preventDefault();
        return;
      default:
        return;
    }
    event.preventDefault();
    this.moveFocus(date);
    this.focusActiveDay();
  }

  /**
   * Arrow keys move between the months or years of the three-column picker grid, Home and End jump to
   * its ends. Enter and Space activate the focused button natively.
   */
  protected onPickerKeyDown(event: KeyboardEvent): void {
    const steps: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -3,
      ArrowDown: 3,
    };
    const button = event.currentTarget as HTMLButtonElement;
    const cells = Array.from(
      button.parentElement?.querySelectorAll<HTMLButtonElement>('.kui-calendar-picker-cell') ?? [],
    );
    const current = cells.indexOf(button);

    if (current < 0) return;

    let next: number;

    if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = cells.length - 1;
    else if (event.key in steps)
      next = Math.min(cells.length - 1, Math.max(0, current + steps[event.key]));
    else return;

    event.preventDefault();
    cells[current].tabIndex = -1;
    cells[next].tabIndex = 0;
    cells[next].focus();
  }

  /**
   * Moves DOM focus to the day that holds the roving tab stop once it has rendered. The grid can be
   * replaced when the month changes, so the day is looked up from the host, not from the old grid.
   */
  private focusActiveDay(): void {
    afterNextRender(
      {
        write: () => {
          this.host.nativeElement
            .querySelector<HTMLButtonElement>(
              '.kui-calendar-grid .kui-calendar-day[tabindex="0"], .kui-calendar-picker-grid .kui-calendar-picker-cell[tabindex="0"]',
            )
            ?.focus();
        },
      },
      { injector: this.injector },
    );
  }
}
