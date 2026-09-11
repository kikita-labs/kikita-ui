import { isPlatformBrowser } from '@angular/common';
import {
  Component,
  computed,
  effect,
  ElementRef,
  inject,
  model,
  PLATFORM_ID,
  ViewEncapsulation,
} from '@angular/core';

import { KuiButtonDirective } from '../button/kui-button.directive';
import { KuiDropdownComponent } from '../dropdown/kui-dropdown.component';
import { KuiSegmentDirective, KuiSegmentedComponent } from '../segmented';
import { nearestStep } from './kui-time-format.util';
import type { KuiTimePickerFormat, KuiTimePickerPeriod } from './kui-time-picker.types';

/** @internal One selectable cell inside a `kui-time-picker-panel` column. */
interface KuiTimePickerCell {
  readonly value: number;
  readonly label: string;
  readonly id: string;
  readonly selected: boolean;
  readonly disabled: boolean;
}

/** @internal One scrollable unit column (hours/minutes/seconds) inside a `kui-time-picker-panel`. */
interface KuiTimePickerColumn {
  readonly key: 'hours' | 'minutes' | 'seconds';
  readonly ariaLabel: string;
  readonly cells: readonly KuiTimePickerCell[];
  readonly apply: (value: number) => void;
}

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

function range(count: number, step: number): number[] {
  const values: number[] = [];
  for (let value = 0; value < count; value += step) values.push(value);
  return values;
}

/**
 * A stable "no value yet" base: today's date at local midnight, not `new Date()` -- `applyField`/
 * `applyPeriod` only ever intend to change ONE field (e.g. minutes) while leaving the others at
 * whatever they already were, but with no previous value there's nothing to preserve them from.
 * Falling back to the real current time there would silently smuggle in the real wall-clock hour
 * (whatever it happens to be right now) the first time any single field is picked, with no
 * indication to the user that it happened. Midnight keeps every untouched field at a predictable,
 * inert `0` instead.
 */
function defaultBaseDate(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
}

/** Seconds since midnight, ignoring the date part -- used to compare against `minTime`/`maxTime`. */
function timeOfDaySeconds(date: Date): number {
  return date.getHours() * 3600 + date.getMinutes() * 60 + date.getSeconds();
}

let nextTimePickerPanelId = 0;

/**
 * @internal Popup panel content for `input[kuiTimePicker]` — scrollable hour/minute/(second)
 * unit columns, an AM/PM `kui-segmented` toggle (12h format only), and "Now"/"Done" footer
 * actions. Place inside `kui-dropdown` as a sibling of the trigger input inside the same
 * `kui-field`; the directive auto-wires this panel's `value`/`format`/`minuteStep`/`secondStep`/
 * `showSeconds` the same way `input[kuiDatePicker]` auto-wires a sibling `kui-calendar` — no
 * manual binding on the panel is required.
 *
 * Per the Claude Design spec (`04 Time Picker.dc.html`), selecting a cell does NOT close the
 * panel (picking hours would otherwise close it before minutes could be picked) — closing is
 * `Enter`/`Escape`/an outside click/the "Done" button.
 */
@Component({
  selector: 'kui-time-picker-panel',
  imports: [KuiButtonDirective, KuiSegmentedComponent, KuiSegmentDirective],
  template: `
    <div class="kui-timepicker-columns">
      @for (col of columns(); track col.key) {
        <div
          class="kui-timepicker-col kui-scroll"
          role="listbox"
          [attr.aria-label]="col.ariaLabel"
          tabindex="0"
          (keydown)="onColumnKeydown($event, col)"
        >
          @for (cell of col.cells; track cell.value) {
            <div
              class="kui-timepicker-opt"
              role="option"
              [id]="cell.id"
              [attr.aria-selected]="cell.selected ? 'true' : null"
              [attr.aria-disabled]="cell.disabled ? 'true' : null"
              [class.kui-timepicker-opt--selected]="cell.selected"
              [class.kui-timepicker-opt--disabled]="cell.disabled"
              (click)="onCellClick(col, cell)"
            >
              {{ cell.label }}
            </div>
          }
        </div>
      }
    </div>

    @if (format() === '12h') {
      <div class="kui-timepicker-period">
        <kui-segmented
          [value]="period()"
          (valueChange)="applyPeriod($event)"
          size="sm"
          aria-label="AM/PM"
        >
          <button kuiSegment value="AM">AM</button>
          <button kuiSegment value="PM">PM</button>
        </kui-segmented>
      </div>
    }

    <div class="kui-timepicker-footer">
      <button kuiButton shape="ghost" size="xs" type="button" (click)="applyNow()">Now</button>
      <button kuiButton shape="solid" size="xs" type="button" (click)="done()">Done</button>
    </div>
  `,
  host: {
    class: 'kui-timepicker-panel',
    // Auto-detected, not a settable input: when there's no ancestor kui-dropdown (the panel is
    // used inline/standalone, like kui-calendar without a date-picker trigger), the panel draws
    // its own background/border/shadow -- data-kui-flat (own chrome dropped) only when it's
    // nested in a dropdown that already draws that frame, the same "flat" concept kui-calendar
    // exposes as an explicit input, just inferred here instead of asked for.
    '[attr.data-kui-flat]': 'hasDropdown ? "" : null',
  },
  encapsulation: ViewEncapsulation.None,
})
/**
 * Renders the hour/minute/second column popover content for `input[kuiTimePicker]`. Also usable
 * on its own, inline, the same way `kui-calendar` is -- the ancestor `kui-dropdown` it injects
 * (see {@link dropdown}) is optional, and its own chrome (background/border) only drops when one
 * is actually present.
 */
export class KuiTimePickerPanelComponent {
  /**
   * Selected time. Two-way. When this panel is a sibling of `input[kuiTimePicker]` inside the
   * same `kui-field`, the directive auto-wires this model to its own value — manual `[(value)]`
   * binding is unnecessary there.
   */
  readonly value = model<Date | null>(null);
  /** Display/parse format. Auto-wired (push-only) from a sibling `input[kuiTimePicker]`. */
  readonly format = model<KuiTimePickerFormat>('24h');
  /** Hour column step. Auto-wired (push-only) from a sibling `input[kuiTimePicker]`. */
  readonly hourStep = model(1);
  /** Minute column step. Auto-wired (push-only) from a sibling `input[kuiTimePicker]`. */
  readonly minuteStep = model(1);
  /** Second column step, used only when `showSeconds` is true. Auto-wired (push-only). */
  readonly secondStep = model(1);
  /** Whether the seconds column renders. Auto-wired (push-only). */
  readonly showSeconds = model(false);
  /**
   * Earliest selectable time-of-day (inclusive; only the hours/minutes/seconds fields are read,
   * the date part is ignored). Auto-wired (push-only). Disables every wheel cell whose resulting
   * time -- combined with the currently selected value in the *other* columns -- would fall
   * before it, same comparison basis `minDate`/`maxDate` use for `kuiDatePicker`.
   */
  readonly minTime = model<Date | undefined>(undefined);
  /** Latest selectable time-of-day (inclusive). See {@link minTime}. */
  readonly maxTime = model<Date | undefined>(undefined);
  /**
   * Returns the hours to disable, called with no arguments. For a rule that doesn't reduce to a
   * single [minTime, maxTime] range -- e.g. "always disable the first half of every hour" -- see
   * {@link disabledMinutes}. Auto-wired (push-only). Disables the matching wheel cells; a typed
   * value landing on one is marked `aria-invalid` by the directive, not rejected here.
   */
  readonly disabledHours = model<(() => readonly number[]) | undefined>(undefined);
  /** Returns the minutes to disable for a given `hour`. See {@link disabledHours}. */
  readonly disabledMinutes = model<((hour: number) => readonly number[]) | undefined>(undefined);
  /** Returns the seconds to disable for a given `hour`/`minute`, used only when `showSeconds` is true. See {@link disabledHours}. */
  readonly disabledSeconds = model<
    ((hour: number, minute: number) => readonly number[]) | undefined
  >(undefined);

  /**
   * The ancestor `kui-dropdown` this panel is projected into when paired with
   * `input[kuiTimePicker]`, injected directly (not via `kui-field`, avoiding a circular module
   * dependency with it) -- used to close the panel on `Enter`/"Done" (see the class doc for why
   * cell clicks deliberately do NOT also close it) and to auto-detect standalone/inline use (see
   * `data-kui-flat` on the host). Optional: `undefined` when there's no dropdown, i.e. the panel
   * is used on its own.
   */
  private readonly dropdown = inject(KuiDropdownComponent, { optional: true });
  /** @internal Cached once at construction -- host binding reads a plain field, not a call. */
  protected readonly hasDropdown = !!this.dropdown;
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  /** @internal `centerAllSelectedColumns` reads real layout boxes (`getBoundingClientRect`), so its deferred first call must never run during SSR -- there's no browser there to measure. */
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  /** @internal Per-instance id prefix so cell ids stay unique when more than one time picker is open at once. */
  private readonly instanceId = `kui-timepicker-${nextTimePickerPanelId++}`;

  /** @internal Skips the value-effect's first (construction-time) run -- it fires synchronously during construction, before the columns exist in the DOM (querying them then would silently no-op), and the dedicated open/standalone centering below already covers that same first moment once there's actually something to measure. */
  private hasRenderedOnce = false;

  constructor() {
    // Centers every column on its newly selected cell whenever `value` changes for *any* reason
    // -- a wheel pick, "Now", or `value` arriving from typing in the trigger input (auto-wired in
    // from a sibling `input[kuiTimePicker]`, which bypasses every method below that used to call
    // centering directly). `effect()` re-runs after `value`'s write is visible, so this is robust
    // regardless of whether that write came from inside this component or from the directive's
    // auto-wire effect, and regardless of Angular's own render/microtask timing -- see
    // `centerColumnOnId`'s doc for why looking cells up by id, not by their `selected` class,
    // sidesteps that race entirely. Skips its own first run -- see `hasRenderedOnce`'s doc.
    effect(() => {
      this.value();
      if (!this.hasRenderedOnce) {
        this.hasRenderedOnce = true;
        return;
      }
      this.centerAllSelectedColumns();
    });

    if (this.dropdown) {
      // Nested in a `kui-dropdown`: center whenever the *dropdown itself* transitions to open,
      // not on this component's own construction. Reacting to the dropdown's `isOpen` signal
      // (rather than guessing at a construction-vs-open timing relationship) is correct either
      // way, regardless of whether the dropdown recreates a fresh panel instance on every open
      // or reuses one across opens -- both were observed from different dropdown instances on
      // the same page in manual testing, so nothing here may assume either. `setTimeout` defers
      // one macrotask past the synchronous `isOpen.set(true)` in `open()`, since the overlay's
      // embedded view hasn't necessarily painted into the DOM yet at that exact tick.
      effect(() => {
        if (this.dropdown!.isOpen()) setTimeout(() => this.centerAllSelectedColumns());
      });
    } else {
      // Standalone (no `kui-dropdown` ancestor): already visible as soon as constructed, so
      // there's no "open" moment to react to -- just center once after this component's own
      // first paint.
      setTimeout(() => this.centerAllSelectedColumns());
    }
  }

  protected readonly period = computed<KuiTimePickerPeriod>(() =>
    (this.value()?.getHours() ?? 0) >= 12 ? 'PM' : 'AM',
  );

  protected readonly columns = computed<KuiTimePickerColumn[]>(() => {
    const current = this.value();
    const format = this.format();
    const base = current ?? defaultBaseDate();
    const minSeconds = this.minTime() ? timeOfDaySeconds(this.minTime()!) : undefined;
    const maxSeconds = this.maxTime() ? timeOfDaySeconds(this.maxTime()!) : undefined;
    const disabledHoursFn = this.disabledHours();
    const disabledMinutesFn = this.disabledMinutes();
    const disabledSecondsFn = this.disabledSeconds();
    // A candidate cell is disabled when the time it would produce -- combining that cell's own
    // field with whatever is currently selected in the *other* two columns (or the base, if none
    // is selected yet) -- falls outside [minTime, maxTime] (same "compare against the other
    // already-chosen fields" basis kuiDatePicker uses for minDate/maxDate). `minTime`/`maxTime`
    // is the only check that combines all three fields like that -- `disabledHours`/
    // `disabledMinutes`/`disabledSeconds` are per-column lookups: `disabledMinutes(hour)` takes
    // the *currently selected* hour, not each minute cell's own nonexistent "hour", so checking
    // `disabledMinutesFn(candidateHour)` against every HOUR
    // candidate combined with the base's minute would mark an hour disabled just because *one*
    // particular minute within it happens to be blocked, even though picking that hour with a
    // different minute would be perfectly valid.
    const isOutOfMinMax = (candidate: Date): boolean => {
      const seconds = timeOfDaySeconds(candidate);
      if (minSeconds !== undefined && seconds < minSeconds) return true;
      if (maxSeconds !== undefined && seconds > maxSeconds) return true;
      return false;
    };
    const isHourDisabled = (h24: number): boolean => {
      const candidate = new Date(base);
      candidate.setHours(h24);
      return isOutOfMinMax(candidate) || (disabledHoursFn?.().includes(h24) ?? false);
    };
    const isMinuteDisabled = (m: number): boolean => {
      const candidate = new Date(base);
      candidate.setMinutes(m);
      return (
        isOutOfMinMax(candidate) || (disabledMinutesFn?.(base.getHours()).includes(m) ?? false)
      );
    };
    const isSecondDisabled = (s: number): boolean => {
      const candidate = new Date(base);
      candidate.setSeconds(s);
      return (
        isOutOfMinMax(candidate) ||
        (disabledSecondsFn?.(base.getHours(), base.getMinutes()).includes(s) ?? false)
      );
    };

    const cols: KuiTimePickerColumn[] = [];

    const hourStep = Math.max(1, this.hourStep());
    const hours = format === '12h' ? range(12, hourStep).map((h) => h + 1) : range(24, hourStep);
    const selectedHour = current
      ? format === '12h'
        ? current.getHours() % 12 === 0
          ? 12
          : current.getHours() % 12
        : current.getHours()
      : null;
    cols.push({
      key: 'hours',
      ariaLabel: 'Hours',
      cells: hours.map((h) => {
        const h24 = format === '12h' ? (h % 12) + (this.period() === 'PM' ? 12 : 0) : h;
        return {
          value: h,
          label: pad(h),
          id: `${this.instanceId}-hour-${h}`,
          selected: h === selectedHour,
          disabled: isHourDisabled(h24),
        };
      }),
      apply: (h) => this.applyHour(h),
    });

    const minuteStep = Math.max(1, this.minuteStep());
    const selectedMinute = current?.getMinutes() ?? null;
    cols.push({
      key: 'minutes',
      ariaLabel: 'Minutes',
      cells: range(60, minuteStep).map((m) => ({
        value: m,
        label: pad(m),
        id: `${this.instanceId}-minute-${m}`,
        selected: m === selectedMinute,
        disabled: isMinuteDisabled(m),
      })),
      apply: (m) => this.applyField('minutes', m),
    });

    if (this.showSeconds()) {
      const secondStep = Math.max(1, this.secondStep());
      const selectedSecond = current?.getSeconds() ?? null;
      cols.push({
        key: 'seconds',
        ariaLabel: 'Seconds',
        cells: range(60, secondStep).map((s) => ({
          value: s,
          label: pad(s),
          id: `${this.instanceId}-second-${s}`,
          selected: s === selectedSecond,
          disabled: isSecondDisabled(s),
        })),
        apply: (s) => this.applyField('seconds', s),
      });
    }

    return cols;
  });

  protected onColumnKeydown(event: KeyboardEvent, col: KuiTimePickerColumn): void {
    const cells = col.cells;
    if (cells.length === 0) return;
    const selectedIndex = cells.findIndex((cell) => cell.selected);

    switch (event.key) {
      case 'ArrowUp': {
        event.preventDefault();
        const next = this.nextEnabledIndex(cells, selectedIndex, -1);
        if (next !== null) col.apply(cells[next].value);
        break;
      }
      case 'ArrowDown': {
        event.preventDefault();
        const next = this.nextEnabledIndex(cells, selectedIndex, 1);
        if (next !== null) col.apply(cells[next].value);
        break;
      }
      case 'Home': {
        event.preventDefault();
        const first = cells.findIndex((cell) => !cell.disabled);
        if (first !== -1) col.apply(cells[first].value);
        break;
      }
      case 'End': {
        event.preventDefault();
        const last = cells.map((cell) => cell.disabled).lastIndexOf(false);
        if (last !== -1) col.apply(cells[last].value);
        break;
      }
      case 'Enter':
        event.preventDefault();
        this.dropdown?.close();
        break;
    }
  }

  /** Cyclic next/previous index skipping `disabled` cells (min/max time), one full lap max. */
  private nextEnabledIndex(
    cells: readonly KuiTimePickerCell[],
    from: number,
    direction: 1 | -1,
  ): number | null {
    const count = cells.length;
    let index = from;
    for (let i = 0; i < count; i++) {
      index = index < 0 ? (direction === 1 ? 0 : count - 1) : (index + direction + count) % count;
      if (!cells[index].disabled) return index;
    }
    return null;
  }

  /**
   * Centers a cell within its own `.kui-timepicker-col`, matching the Claude Design spec's own
   * reference `centerColumn` (`04 Time Picker.dc.html`'s `<script data-dc-script>`): `scrollTop =
   * item.offsetTop - column.clientHeight / 2 + item.offsetHeight / 2`. Deliberately does NOT use
   * the DOM `scrollIntoView()` API: that walks up *every* scrollable ancestor (the column, the
   * dropdown panel, and potentially the page itself), so calling it here could yank the whole
   * popover -- or the page behind it -- around instead of just nudging the one column's own
   * `scrollTop`. Also measures via `getBoundingClientRect()` rather than the spec's own
   * `item.offsetTop` -- `offsetTop` is relative to the nearest *positioned* ancestor, and
   * `.kui-timepicker-col` has no `position` of its own, so that ancestor could silently be some
   * unrelated box further up; rects sidestep that regardless of positioning context.
   */
  private centerColumnOnId(columnEl: HTMLElement, id: string): void {
    // Ids are always `${instanceId}-(hour|minute|second)-${number}` (see `columns`), so a raw
    // attribute selector is safe -- no user content ever reaches this id. The element already
    // exists in the DOM (every value in a column's range renders unconditionally; only the
    // `selected` state toggles), so looking it up by id works regardless of whether Angular has
    // re-rendered the `selected` class toggle yet -- unlike querying for `.kui-timepicker-opt--
    // selected`, which would only be reliable once that re-render has actually landed.
    const cellEl = columnEl.querySelector<HTMLElement>(`[id="${id}"]`);
    if (!cellEl) return;

    const columnRect = columnEl.getBoundingClientRect();
    const cellRect = cellEl.getBoundingClientRect();
    const cellTop = columnEl.scrollTop + (cellRect.top - columnRect.top);
    columnEl.scrollTop = cellTop - columnEl.clientHeight / 2 + cellRect.height / 2;
  }

  /**
   * Centers every column on its currently selected cell, if it has one. See the constructor.
   * No-ops during SSR -- `centerColumnOnId` reads real layout boxes (`getBoundingClientRect`),
   * which don't exist there.
   */
  private centerAllSelectedColumns(): void {
    if (!this.isBrowser) return;
    const model = this.columns();
    this.el.nativeElement
      .querySelectorAll<HTMLElement>('.kui-timepicker-col')
      .forEach((colEl, i) => {
        const selectedCell = model[i]?.cells.find((cell) => cell.selected);
        if (selectedCell) this.centerColumnOnId(colEl, selectedCell.id);
      });
  }

  protected onCellClick(col: KuiTimePickerColumn, cell: KuiTimePickerCell): void {
    if (cell.disabled) return;
    col.apply(cell.value);
  }

  private applyHour(hour: number): void {
    const isPm = this.period() === 'PM';
    const hour24 = this.format() === '12h' ? (hour % 12) + (isPm ? 12 : 0) : hour;
    this.applyField('hours', hour24);
  }

  protected applyPeriod(period: string): void {
    const current = this.value() ?? defaultBaseDate();
    const hours = current.getHours();
    const isPm = hours >= 12;
    const wantsPm = period === 'PM';
    if (isPm === wantsPm) return;
    this.applyField('hours', wantsPm ? hours + 12 : hours - 12);
  }

  /**
   * Applies one field. Centering happens separately, in the constructor's `value` effect -- it
   * covers every way `value` can change (this method included), not just this one.
   */
  private applyField(field: 'hours' | 'minutes' | 'seconds', value: number): void {
    const next = new Date(this.value() ?? defaultBaseDate());
    if (field === 'hours') next.setHours(value);
    if (field === 'minutes') next.setMinutes(value);
    if (field === 'seconds') next.setSeconds(value);
    this.value.set(next);
  }

  protected applyNow(): void {
    // Clamp into [minTime, maxTime] first (at minute granularity) so "Now" never lands on a
    // time whose own wheel cells would render as disabled -- e.g. minTime="09:00" at 3am picks
    // 09:00, not the real (out-of-range) current time.
    let now = new Date();
    const min = this.minTime();
    const max = this.maxTime();
    if (min && timeOfDaySeconds(now) < timeOfDaySeconds(min)) {
      now = new Date(now);
      now.setHours(min.getHours(), min.getMinutes(), min.getSeconds(), 0);
    } else if (max && timeOfDaySeconds(now) > timeOfDaySeconds(max)) {
      now = new Date(now);
      now.setHours(max.getHours(), max.getMinutes(), max.getSeconds(), 0);
    }

    this.applyField('hours', now.getHours());
    this.applyField('minutes', nearestStep(now.getMinutes(), Math.max(1, this.minuteStep())));
    if (this.showSeconds()) {
      this.applyField('seconds', nearestStep(now.getSeconds(), Math.max(1, this.secondStep())));
    }
  }

  protected done(): void {
    this.dropdown?.close();
  }
}
