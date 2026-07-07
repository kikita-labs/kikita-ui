import {
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  model,
  signal,
} from '@angular/core';

import { getKuiCalendarLocaleText } from '../../i18n/kui-calendar-locale-text.util';
import { KUI_LOCALE } from '../../i18n/kui-locale.token';
import { KuiButtonDirective } from '../button/kui-button.directive';
import { KuiSeparatorDirective } from '../separator/kui-separator.directive';
import {
  addDays,
  addMonths,
  addYears,
  decadeStart,
  isSameDay,
  startOfDay,
  startOfWeek,
  weekdayIndex,
} from './kui-calendar-date.util';
import {
  KuiCalendarDisabledPredicate,
  KuiCalendarMode,
  KuiCalendarSize,
  KuiCalendarValue,
  KuiDateRange,
} from './kui-calendar.types';

interface KuiCalendarDayCell {
  date: Date;
  label: string;
  cls: string;
  tabIndex: 0 | -1;
  ariaSelected: 'true' | null;
  ariaCurrent: 'date' | null;
  ariaDisabled: 'true' | null;
  disabled: boolean;
}

interface KuiCalendarPickerCell {
  label: string;
  cls: string;
  onClick: () => void;
}

type KuiCalendarView = 'days' | 'months' | 'years';

const NAV_LABEL: Record<KuiCalendarView, { prev: string; next: string }> = {
  days: { prev: 'Previous month', next: 'Next month' },
  months: { prev: 'Previous year', next: 'Next year' },
  years: { prev: 'Previous decade', next: 'Next decade' },
};

/**
 * Inline month-grid date picker with month/year/decade navigation. Building block for
 * date/date-range pickers that open it in a popover, but also usable inline (sidebars,
 * filter panels).
 *
 * @example
 * ```html
 * <kui-calendar [(value)]="selectedDate" />
 * <kui-calendar mode="range" [(value)]="selectedRange" size="sm" />
 * ```
 */
@Component({
  selector: 'kui-calendar',
  template: `
    <ng-content select="[kuiCalendarHeader]">
      <div class="kui-calendar-header">
        <button
          kuiButton
          appearance="ghost"
          size="xs"
          type="button"
          [attr.aria-label]="navLabels().prev"
          (click)="navPrev()"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m15 18-6-6 6-6"></path>
          </svg>
        </button>
        @if (view() !== 'years') {
          <button
            kuiButton
            appearance="ghost"
            class="kui-calendar-title"
            type="button"
            (click)="drillUp()"
          >
            {{ headerLabel() }}
          </button>
        } @else {
          <span class="kui-calendar-title">{{ headerLabel() }}</span>
        }
        <button
          kuiButton
          appearance="ghost"
          size="xs"
          type="button"
          [attr.aria-label]="navLabels().next"
          (click)="navNext()"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </button>
      </div>
    </ng-content>

    <div aria-live="polite" class="sr-only">{{ liveAnnounce() }}</div>

    @if (view() === 'days') {
      <div class="kui-calendar-weekdays" role="row">
        @for (name of localeText().weekdaysShort; track name) {
          <span class="kui-calendar-weekday">{{ name }}</span>
        }
      </div>
      <div
        class="kui-calendar-grid"
        role="grid"
        aria-label="Calendar"
        (keydown)="onGridKeyDown($event)"
      >
        @for (cell of dayCells(); track cell.date.getTime()) {
          <button
            class="{{ cell.cls }}"
            type="button"
            [tabIndex]="cell.tabIndex"
            [attr.aria-selected]="cell.ariaSelected"
            [attr.aria-current]="cell.ariaCurrent"
            [attr.aria-disabled]="cell.ariaDisabled"
            (click)="!cell.disabled && selectDate(cell.date)"
            (mouseenter)="onDayHover(cell.date)"
            (focus)="focusedDate.set(cell.date)"
          >
            <span class="kui-calendar-day-inner">{{ cell.label }}</span>
          </button>
        }
      </div>
    }

    @if (view() === 'months') {
      <div class="kui-calendar-picker-grid">
        @for (cell of monthCells(); track cell.label) {
          <button class="{{ cell.cls }}" type="button" (click)="cell.onClick()">
            {{ cell.label }}
          </button>
        }
      </div>
    }

    @if (view() === 'years') {
      <div class="kui-calendar-picker-grid">
        @for (cell of yearCells(); track cell.label) {
          <button class="{{ cell.cls }}" type="button" (click)="cell.onClick()">
            {{ cell.label }}
          </button>
        }
      </div>
    }

    <ng-content select="[kuiCalendarFooter]">
      @if (showFooter()) {
        <hr kuiSeparator />
        <div class="kui-calendar-footer">
          <span class="kui-calendar-value">{{ valueLabel() }}</span>
          <button kuiButton appearance="ghost" size="xs" type="button" (click)="goToday()">
            Today
          </button>
        </div>
      }
    </ng-content>
  `,
  host: {
    class: 'kui-calendar',
    '[attr.data-kui-size]': "size() === 'sm' ? 'sm' : null",
  },
  imports: [KuiButtonDirective, KuiSeparatorDirective],
  encapsulation: ViewEncapsulation.None,
})
export class KuiCalendarComponent {
  private readonly injectedLocale = inject(KUI_LOCALE);

  /** Selection mode. `single` picks one date; `range` picks a start/end pair. */
  readonly mode = input<KuiCalendarMode>('single');
  /** Visual density. `sm` is a compact, border/padding-less variant for sidebars. */
  readonly size = input<KuiCalendarSize>('md');
  /** Shows Saturday/Sunday in a muted color. Defaults to true. */
  readonly showWeekend = input(true, { transform: booleanAttribute });
  /**
   * Shows a footer with the current value and a "Today" shortcut button. Defaults to
   * false — most inline placements (sidebars, filter panels) render the calendar bare.
   */
  readonly showFooter = input(false, { transform: booleanAttribute });
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

  /** Selected date (`mode="single"`) or range (`mode="range"`). Supports two-way binding. */
  readonly value = model<KuiCalendarValue>(null);

  protected readonly view = signal<KuiCalendarView>('days');
  protected readonly viewYear = signal<number>(new Date().getFullYear());
  protected readonly viewMonth = signal<number>(new Date().getMonth());
  protected readonly focusedDate = signal<Date>(startOfDay(new Date()));
  protected readonly hoverDate = signal<Date | null>(null);
  protected readonly liveAnnounce = signal('');

  private readonly today = startOfDay(new Date());

  protected readonly localeText = computed(() =>
    getKuiCalendarLocaleText(this.locale() ?? this.injectedLocale),
  );

  protected readonly navLabels = computed(() => NAV_LABEL[this.view()]);

  protected readonly headerLabel = computed(() => {
    const view = this.view();
    const year = this.viewYear();
    if (view === 'months') return String(year);
    if (view === 'years') {
      const start = decadeStart(year);
      return `${start}–${start + 11}`;
    }
    return `${this.localeText().monthsLong[this.viewMonth()]} ${year}`;
  });

  private readonly committedRange = computed<{ lo: Date; hi: Date; committed: boolean } | null>(
    () => {
      if (this.mode() !== 'range') return null;
      const val = this.value() as KuiDateRange | null;
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

  protected readonly dayCells = computed<KuiCalendarDayCell[]>(() => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const firstDayOfWeek = this.localeText().firstDayOfWeek;
    const focused = this.focusedDate();
    const range = this.committedRange();
    const single = this.mode() === 'single' ? (this.value() as Date | null) : null;

    const firstOfMonth = new Date(year, month, 1);
    const leading = weekdayIndex(firstOfMonth, firstDayOfWeek);
    const gridStart = addDays(firstOfMonth, -leading);

    const cells: KuiCalendarDayCell[] = [];
    for (let i = 0; i < 42; i++) {
      const date = addDays(gridStart, i);
      const muted = date.getMonth() !== month;
      const weekend = this.showWeekend() && (date.getDay() === 0 || date.getDay() === 6);
      const isToday = isSameDay(date, this.today);
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
      } else if (range) {
        const { lo, hi, committed } = range;
        if (isSameDay(date, lo) || isSameDay(date, hi)) {
          if (isSameDay(lo, hi)) {
            cls += ' kui-calendar-day--selected';
          } else if (isSameDay(date, lo)) {
            cls += committed
              ? ' kui-calendar-day--range-start'
              : ' kui-calendar-day--preview kui-calendar-day--preview-start';
          } else {
            cls += committed
              ? ' kui-calendar-day--range-end'
              : ' kui-calendar-day--preview kui-calendar-day--preview-end';
          }
          ariaSelected = 'true';
        } else if (date.getTime() > lo.getTime() && date.getTime() < hi.getTime()) {
          cls += committed ? ' kui-calendar-day--range-middle' : ' kui-calendar-day--preview';
        }
      }

      cells.push({
        date,
        label: String(date.getDate()),
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

  protected readonly monthCells = computed<KuiCalendarPickerCell[]>(() => {
    const activeMonth = this.viewMonth();
    return this.localeText().monthsShort.map((label, idx) => ({
      label,
      cls:
        'kui-calendar-picker-cell' +
        (idx === activeMonth ? ' kui-calendar-picker-cell--active' : ''),
      onClick: () => {
        this.viewMonth.set(idx);
        this.view.set('days');
        this.liveAnnounce.set(`${this.localeText().monthsLong[idx]} ${this.viewYear()}`);
      },
    }));
  });

  protected readonly yearCells = computed<KuiCalendarPickerCell[]>(() => {
    const activeYear = this.viewYear();
    const start = decadeStart(activeYear) - 1;
    return Array.from({ length: 12 }, (_, i) => start + i).map((year) => ({
      label: String(year),
      cls:
        'kui-calendar-picker-cell' +
        (year === activeYear ? ' kui-calendar-picker-cell--active' : '') +
        (year === start || year === start + 11 ? ' kui-calendar-picker-cell--muted' : ''),
      onClick: () => {
        this.viewYear.set(year);
        this.view.set('months');
      },
    }));
  });

  protected readonly valueLabel = computed(() => {
    const val = this.value();
    if (this.mode() === 'single') return val ? this.formatIso(val as Date) : '—';
    const range = val as KuiDateRange | null;
    if (!range?.start) return '—';
    if (!range.end) return `${this.formatIso(range.start)} – …`;
    return `${this.formatIso(range.start)} – ${this.formatIso(range.end)}`;
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
    if (this.mode() === 'single') {
      this.value.set(startOfDay(date));
    } else {
      const current = this.value() as KuiDateRange | null;
      if (!current?.start || current.end) {
        this.value.set({ start: startOfDay(date), end: null });
      } else if (date.getTime() < current.start.getTime()) {
        this.value.set({ start: startOfDay(date), end: current.start });
      } else {
        this.value.set({ start: current.start, end: startOfDay(date) });
      }
      this.hoverDate.set(null);
    }
    this.focusedDate.set(startOfDay(date));
    if (date.getMonth() !== this.viewMonth() || date.getFullYear() !== this.viewYear()) {
      this.viewYear.set(date.getFullYear());
      this.viewMonth.set(date.getMonth());
    }
  }

  protected onDayHover(date: Date): void {
    const current = this.value() as KuiDateRange | null;
    if (this.mode() === 'range' && current?.start && !current.end) {
      this.hoverDate.set(date);
    }
  }

  protected drillUp(): void {
    this.view.set(this.view() === 'days' ? 'months' : 'years');
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
      const next = addMonths(new Date(this.viewYear(), this.viewMonth(), 1), direction);
      this.viewYear.set(next.getFullYear());
      this.viewMonth.set(next.getMonth());
    } else if (view === 'months') {
      this.viewYear.update((y) => y + direction);
    } else {
      this.viewYear.update((y) => y + direction * 10);
    }
  }

  protected goToday(): void {
    this.view.set('days');
    this.viewYear.set(this.today.getFullYear());
    this.viewMonth.set(this.today.getMonth());
    this.focusedDate.set(this.today);
  }

  private moveFocus(date: Date): void {
    if (date.getMonth() !== this.viewMonth() || date.getFullYear() !== this.viewYear()) {
      this.viewYear.set(date.getFullYear());
      this.viewMonth.set(date.getMonth());
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
    queueMicrotask(() => {
      const grid = (event.currentTarget as HTMLElement | null)?.querySelector<HTMLButtonElement>(
        '.kui-calendar-day[tabindex="0"]',
      );
      grid?.focus();
    });
  }
}
