import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KUI_LOCALE } from '../../i18n/kui-locale.token';
import { KUI_PICKED_EVENT } from '../../utils/kui-picked-event';
import { KuiCalendarRange } from '../calendar-range/kui-calendar-range.component';
import { KuiCalendar } from './kui-calendar.component';
import type { KuiDateRange } from './kui-calendar.types';

/** Behaviour of the engine shared by `kui-calendar` and `kui-calendar-range`, seen from both. */
@Component({
  imports: [KuiCalendar],
  template: `
    <kui-calendar
      [(value)]="value"
      [(viewDate)]="viewDate"
      [minDate]="minDate()"
      [showFooter]="true"
    />
  `,
})
class SingleHost {
  readonly value = signal<Date | null>(null);
  readonly viewDate = signal(new Date(2026, 4, 1));
  readonly minDate = signal<Date | undefined>(new Date(2026, 4, 5));
}

@Component({
  imports: [KuiCalendarRange],
  template: `
    <kui-calendar-range [(value)]="value" [(viewDate)]="viewDate" [showFooter]="true" />
  `,
})
class RangeHost {
  readonly value = signal<KuiDateRange | null>(null);
  readonly viewDate = signal(new Date(2026, 4, 1));
}

function dayButton(root: HTMLElement, label: string): HTMLButtonElement {
  const match = Array.from(
    root.querySelectorAll<HTMLButtonElement>('.kui-calendar-day:not(.kui-calendar-day--muted)'),
  ).find((button) => button.textContent?.trim() === label);

  if (!match) throw new Error(`day ${label} not found`);

  return match;
}

function press(target: HTMLElement, key: string, init: KeyboardEventInit = {}): void {
  target.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true, ...init }));
}

describe('KuiCalendarEngine through kui-calendar', () => {
  let fixture: ComponentFixture<SingleHost>;
  let host: SingleHost;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [SingleHost],
      providers: [{ provide: KUI_LOCALE, useValue: 'en-US' }],
    });
    fixture = TestBed.createComponent(SingleHost);
    host = fixture.componentInstance;
    root = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('dispatches a bubbling picked event for a click and for Enter, not for a disabled day', () => {
    const picked: Event[] = [];
    root.addEventListener(KUI_PICKED_EVENT, (event) => picked.push(event));

    dayButton(root, '4').click();
    expect(picked).toHaveLength(0);
    expect(host.value()).toBeNull();

    dayButton(root, '12').click();
    fixture.detectChanges();
    expect(picked).toHaveLength(1);
    expect(picked[0].bubbles).toBe(true);
    expect(host.value()?.getDate()).toBe(12);

    const grid = root.querySelector('.kui-calendar-grid') as HTMLElement;
    dayButton(root, '12').focus();
    press(grid, 'ArrowRight');
    fixture.detectChanges();
    press(grid, 'Enter');
    fixture.detectChanges();
    expect(picked).toHaveLength(2);
    expect(host.value()?.getDate()).toBe(13);
  });

  it('moves the focused day and the shown month with the keyboard', () => {
    const grid = root.querySelector('.kui-calendar-grid') as HTMLElement;
    dayButton(root, '31').focus();
    fixture.detectChanges();

    press(grid, 'ArrowRight');
    fixture.detectChanges();
    expect(host.viewDate().getMonth()).toBe(5);

    press(grid, 'PageUp');
    fixture.detectChanges();
    expect(host.viewDate().getMonth()).toBe(4);

    press(grid, 'PageDown', { shiftKey: true });
    fixture.detectChanges();
    expect(host.viewDate().getFullYear()).toBe(2027);
  });

  it('ignores keys it does not handle and leaves the day grid alone in the month picker', () => {
    const grid = root.querySelector('.kui-calendar-grid') as HTMLElement;
    const event = new KeyboardEvent('keydown', { key: 'x', bubbles: true, cancelable: true });

    grid.dispatchEvent(event);
    expect(event.defaultPrevented).toBe(false);

    (root.querySelector('.kui-calendar-title') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(root.querySelector('.kui-calendar-grid')).toBeNull();
    expect(root.querySelectorAll('.kui-calendar-picker-cell').length).toBe(12);
  });

  it('shows the selected date in the footer in ISO form', () => {
    expect(root.querySelector('.kui-calendar-value')?.textContent).toBe('—');

    dayButton(root, '20').click();
    fixture.detectChanges();

    expect(root.querySelector('.kui-calendar-value')?.textContent).toBe('2026-05-20');
  });
});

describe('KuiCalendarEngine through kui-calendar-range', () => {
  let fixture: ComponentFixture<RangeHost>;
  let host: RangeHost;
  let root: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [RangeHost],
      providers: [{ provide: KUI_LOCALE, useValue: 'en-US' }],
    });
    fixture = TestBed.createComponent(RangeHost);
    host = fixture.componentInstance;
    root = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  it('never dispatches the picked event, so a host panel stays open for the second click', () => {
    const picked: Event[] = [];
    root.addEventListener(KUI_PICKED_EVENT, (event) => picked.push(event));

    dayButton(root, '10').click();
    dayButton(root, '14').click();

    expect(picked).toHaveLength(0);
  });

  it('orders the ends when the second pick is earlier and starts again on the third pick', () => {
    dayButton(root, '14').click();
    dayButton(root, '10').click();
    fixture.detectChanges();

    expect(host.value()?.start.getDate()).toBe(10);
    expect(host.value()?.end?.getDate()).toBe(14);

    dayButton(root, '20').click();
    fixture.detectChanges();

    expect(host.value()?.start.getDate()).toBe(20);
    expect(host.value()?.end).toBeNull();
  });

  it('shows the open and the committed range in the footer', () => {
    dayButton(root, '10').click();
    fixture.detectChanges();
    expect(root.querySelector('.kui-calendar-value')?.textContent).toBe('2026-05-10 – …');

    dayButton(root, '12').click();
    fixture.detectChanges();
    expect(root.querySelector('.kui-calendar-value')?.textContent).toBe('2026-05-10 – 2026-05-12');
    expect(root.querySelectorAll('.kui-calendar-day--range-middle').length).toBe(1);
  });

  it('shares the keyboard handling of the single-date calendar', () => {
    const grid = root.querySelector('.kui-calendar-grid') as HTMLElement;
    dayButton(root, '31').focus();
    fixture.detectChanges();

    press(grid, 'ArrowRight');
    fixture.detectChanges();

    expect(host.viewDate().getMonth()).toBe(5);
  });
});
