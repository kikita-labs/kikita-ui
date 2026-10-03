import type { ElementRef, Injector, ModelSignal, Signal } from '@angular/core';
import { afterNextRender, computed, inject, signal } from '@angular/core';

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
import { injectKuiRootSizeDefault } from '../../providers/kui-defaults.util';
import {
  KUI_CALENDAR_SIZES,
  type KuiCalendarNavigationView,
} from '../../utils/kui-calendar-navigation.util';
import { KuiClock } from '../../utils/kui-clock.service';
import { injectKuiGlyph } from '../icon/inject-kui-glyph';
import { KUI_GLYPH_CHEVRON_LEFT, KUI_GLYPH_CHEVRON_RIGHT } from '../icon/kui-chrome-glyphs';
import type { KuiCalendarDisabledPredicate, KuiCalendarSize } from './kui-calendar.types';
import type { KuiCalendarViewOptions } from './kui-calendar-options.interface';

/** One rendered day of the month grid. */
export interface KuiCalendarDayCell {
  readonly date: Date;
  readonly label: string;
  readonly ariaLabel: string;
  readonly cls: string;
  readonly tabIndex: 0 | -1;
  readonly ariaSelected: 'true' | null;
  readonly ariaCurrent: 'date' | null;
  readonly ariaDisabled: 'true' | null;
  readonly disabled: boolean;
}

/** One rendered month or year of the picker grids. */
export interface KuiCalendarPickerCell {
  readonly label: string;

  /** The month or year that is currently shown; it holds the Tab stop of its grid. */
  readonly active: boolean;
  readonly cls: string;
  readonly onClick: () => void;
}

/** What a selection puts on one day cell. */
export interface KuiCalendarDaySelection {
  /** CSS classes, each preceded by a space, appended after the cell's own state classes. */
  readonly classes: string;
  readonly ariaSelected: 'true' | null;
}

/**
 * The part that differs between `kui-calendar` (one date) and `kui-calendar-range` (a start and an
 * end): what is selected, how a day looks for it and what a pick does. The engine owns the rest.
 */
export interface KuiCalendarSelection {
  /** The selected day that anchors the first focus and the roving tab stop, if any. */
  anchor(): Date | null;

  /** The classes and the ARIA state a day gets from the selection. */
  dayState(date: Date): KuiCalendarDaySelection;

  /** Applies a pick of `date` to the value. */
  select(date: Date): void;

  /** The pointer or the focus moved onto `date`; a range uses it to preview the end. */
  hover(date: Date): void;

  /** The text of the footer value. */
  valueLabel(formatIso: (date: Date) => string): string;
}

/** Inputs of {@link KuiCalendarEngine}; each member is a signal the component owns. */
export interface KuiCalendarEngineOptions {
  readonly host: ElementRef<HTMLElement>;
  readonly injector: Injector;
  readonly selection: KuiCalendarSelection;

  /** Defaults of the component's own key (`calendar` or `calendarRange`). */
  readonly defaults: Signal<KuiCalendarViewOptions | undefined>;

  /** First-of-month date the grid shows; the engine writes it when the user navigates. */
  readonly viewDate: ModelSignal<Date>;
  readonly size: Signal<KuiCalendarSize | undefined>;
  readonly flat: Signal<boolean | undefined>;
  readonly showWeekend: Signal<boolean | undefined>;
  readonly showFooter: Signal<boolean | undefined>;
  readonly showPrevNav: Signal<boolean | undefined>;
  readonly showNextNav: Signal<boolean | undefined>;
  readonly minDate: Signal<Date | undefined>;
  readonly maxDate: Signal<Date | undefined>;
  readonly disabledDates: Signal<Date[] | KuiCalendarDisabledPredicate | undefined>;
  readonly locale: Signal<string | undefined>;
  readonly messages: Signal<Partial<KuiCalendarMessages> | undefined>;

  /** Runs after a pick has been applied, for example to announce it to a host panel. */
  readonly onSelected?: () => void;
}

/**
 * Grid, navigation, keyboard and labelling of a month calendar. A plain object created in the
 * injection context of the component that renders it, not a base class: the component keeps its own
 * inputs and public API and passes the signals in, together with the {@link KuiCalendarSelection}
 * that tells a single-date from a range calendar.
 */
export class KuiCalendarEngine {
  private readonly clock = inject(KuiClock);
  private readonly i18n = inject(KuiI18n);
  private readonly rootDefaultSize = injectKuiRootSizeDefault<KuiCalendarSize>(KUI_CALENDAR_SIZES);
  private readonly today = this.clock.today;

  /** Which grid is showing: days, months or years. */
  readonly view = signal<KuiCalendarNavigationView>('days');
  readonly focusedDate = signal<Date>(startOfDay(this.clock.initialNow()));
  readonly liveAnnounce = signal('');

  readonly t = injectKuiMessages('calendar', () => this.options.messages());

  readonly previousGlyph = injectKuiGlyph({
    role: 'previous',
    slot: () => this.options.defaults()?.previousIcon,
    fallback: KUI_GLYPH_CHEVRON_LEFT,
  });

  readonly nextGlyph = injectKuiGlyph({
    role: 'next',
    slot: () => this.options.defaults()?.nextIcon,
    fallback: KUI_GLYPH_CHEVRON_RIGHT,
  });

  readonly effectiveSize = computed(
    () => this.options.size() ?? this.options.defaults()?.size ?? this.rootDefaultSize() ?? 'md',
  );
  readonly effectiveFlat = computed(
    () => this.options.flat() ?? this.options.defaults()?.flat ?? false,
  );
  readonly effectiveShowWeekend = computed(
    () => this.options.showWeekend() ?? this.options.defaults()?.showWeekend ?? true,
  );
  readonly effectiveShowFooter = computed(
    () => this.options.showFooter() ?? this.options.defaults()?.showFooter ?? false,
  );
  readonly effectiveShowPrevNav = computed(
    () => this.options.showPrevNav() ?? this.options.defaults()?.showPrevNav ?? true,
  );
  readonly effectiveShowNextNav = computed(
    () => this.options.showNextNav() ?? this.options.defaults()?.showNextNav ?? true,
  );

  private readonly viewYear = computed(() => this.options.viewDate().getFullYear());
  private readonly viewMonth = computed(() => this.options.viewDate().getMonth());

  private readonly activeLocale = computed(() => {
    const own = this.options.locale();
    return own ? resolveKuiLocale(own) : this.i18n.locale();
  });

  readonly localeText = computed(() => {
    const locale = this.activeLocale();
    return this.i18n.cached(`calendar:${locale}`, () => getKuiCalendarLocaleText(locale));
  });

  readonly navLabels = computed(() => {
    const t = this.t();
    const view = this.view();

    if (view === 'days') return { prev: t.previousMonth, next: t.nextMonth };
    if (view === 'months') return { prev: t.previousYear, next: t.nextYear };
    return { prev: t.previousDecade, next: t.nextDecade };
  });

  readonly headerLabel = computed(() => {
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
    const selected = this.options.selection.anchor();
    if (selected && inView(selected)) return selected;
    if (inView(this.today())) return this.today();
    return new Date(this.viewYear(), this.viewMonth(), 1);
  });

  readonly dayCells = computed<KuiCalendarDayCell[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const firstDayOfWeek = this.localeText().firstDayOfWeek;
    const focused = this.tabStop();

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

      const selected = this.options.selection.dayState(date);
      cls += selected.classes;

      cells.push({
        date,
        label: String(date.getDate()),
        ariaLabel: this.fullDateLabel(date),
        cls,
        tabIndex: isSameDay(date, focused) ? 0 : -1,
        ariaSelected: selected.ariaSelected,
        ariaCurrent: isToday ? 'date' : null,
        ariaDisabled: disabled ? 'true' : null,
        disabled,
      });
    }
    return cells;
  });

  /** The 42 day cells grouped into six week rows, as the ARIA grid structure requires. */
  readonly dayWeeks = computed<KuiCalendarDayCell[][]>(() => {
    const cells = this.dayCells();
    return Array.from({ length: 6 }, (_, week) => cells.slice(week * 7, week * 7 + 7));
  });

  readonly monthCells = computed<KuiCalendarPickerCell[]>(() => {
    const activeMonth = this.viewMonth();
    return this.localeText().monthsShort.map((label, idx) => ({
      label,
      active: idx === activeMonth,
      cls:
        'kui-calendar-picker-cell' +
        (idx === activeMonth ? ' kui-calendar-picker-cell--active' : ''),
      onClick: () => {
        this.options.viewDate.set(new Date(this.viewYear(), idx, 1));
        this.view.set('days');
        this.focusActiveDay();
        this.liveAnnounce.set(this.monthYearLabel(this.viewYear(), idx));
      },
    }));
  });

  readonly yearCells = computed<KuiCalendarPickerCell[]>(() => {
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
        this.options.viewDate.set(new Date(year, this.viewMonth(), 1));
        this.view.set('months');
        this.focusActiveDay();
      },
    }));
  });

  readonly valueLabel = computed(() => this.options.selection.valueLabel((d) => this.formatIso(d)));

  constructor(private readonly options: KuiCalendarEngineOptions) {
    const initial = options.selection.anchor();
    if (initial) options.viewDate.set(startOfMonth(initial));

    // A server-rendered page first shows the server's month and day; move to the browser's once
    // hydrated, unless the value or the visible month was already set.
    afterNextRender(
      () => {
        this.clock.followBrowserDate(options.viewDate, startOfMonth);
        this.clock.followBrowserDate(this.focusedDate, startOfDay);
      },
      { injector: options.injector },
    );
  }

  /**
   * Puts the first focus on the selected day when it is in the shown month, else on today, else on
   * the shown month itself. Called once, when the component initialises.
   */
  seedFocus(): void {
    const viewDate = this.options.viewDate();
    const initial = this.options.selection.anchor();
    const isInView = (date: Date): boolean =>
      date.getFullYear() === viewDate.getFullYear() && date.getMonth() === viewDate.getMonth();
    const candidate =
      initial && isInView(initial) ? initial : isInView(this.today()) ? this.today() : viewDate;

    this.focusedDate.set(candidate);
  }

  selectDate(date: Date): void {
    this.options.selection.select(date);
    this.focusedDate.set(startOfDay(date));
    if (date.getMonth() !== this.viewMonth() || date.getFullYear() !== this.viewYear()) {
      this.options.viewDate.set(startOfMonth(date));
    }
    this.options.onSelected?.();
  }

  onDayHover(date: Date): void {
    this.options.selection.hover(date);
  }

  drillUp(): void {
    this.view.set(this.view() === 'days' ? 'months' : 'years');
    this.focusActiveDay();
  }

  navPrev(): void {
    this.navigate(-1);
  }

  navNext(): void {
    this.navigate(1);
  }

  goToday(): void {
    this.view.set('days');
    this.options.viewDate.set(startOfMonth(this.today()));
    this.focusedDate.set(this.today());
  }

  onGridKeyDown(event: KeyboardEvent): void {
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
  onPickerKeyDown(event: KeyboardEvent): void {
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

  private navigate(direction: 1 | -1): void {
    const view = this.view();
    const viewDate = this.options.viewDate;
    if (view === 'days') {
      viewDate.set(addMonths(viewDate(), direction));
    } else if (view === 'months') {
      viewDate.set(new Date(this.viewYear() + direction, this.viewMonth(), 1));
    } else {
      viewDate.set(new Date(this.viewYear() + direction * 10, this.viewMonth(), 1));
    }
  }

  private moveFocus(date: Date): void {
    if (date.getMonth() !== this.viewMonth() || date.getFullYear() !== this.viewYear()) {
      this.options.viewDate.set(startOfMonth(date));
    }
    this.focusedDate.set(date);
  }

  private isDisabled(date: Date): boolean {
    const min = this.options.minDate();
    const max = this.options.maxDate();
    if (min && date.getTime() < startOfDay(min).getTime()) return true;
    if (max && date.getTime() > startOfDay(max).getTime()) return true;
    const disabledDates = this.options.disabledDates();
    if (typeof disabledDates === 'function') return disabledDates(date);
    if (Array.isArray(disabledDates)) return disabledDates.some((d) => isSameDay(d, date));
    return false;
  }

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

  private formatIso(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  /**
   * Moves DOM focus to the day that holds the roving tab stop once it has rendered. The grid can be
   * replaced when the month changes, so the day is looked up from the host, not from the old grid.
   */
  private focusActiveDay(): void {
    afterNextRender(
      {
        write: () => {
          this.options.host.nativeElement
            .querySelector<HTMLButtonElement>(
              '.kui-calendar-grid .kui-calendar-day[tabindex="0"], .kui-calendar-picker-grid .kui-calendar-picker-cell[tabindex="0"]',
            )
            ?.focus();
        },
      },
      { injector: this.options.injector },
    );
  }
}
