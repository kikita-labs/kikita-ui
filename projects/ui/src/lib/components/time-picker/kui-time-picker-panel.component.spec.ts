import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { beforeEach, describe, expect, it } from 'vitest';

import { KuiTimePickerPanelComponent } from './kui-time-picker-panel.component';

@Component({
  template: `<kui-time-picker-panel
    [(value)]="value"
    [format]="format()"
    [showSeconds]="showSeconds()"
    [hourStep]="hourStep()"
    [minTime]="minTime()"
    [maxTime]="maxTime()"
    [disabledMinutes]="disabledMinutes()"
  />`,
  imports: [KuiTimePickerPanelComponent],
})
class TestPanelHost {
  readonly value = signal<Date | null>(new Date(2026, 0, 1, 9, 30, 0));
  readonly format = signal<'24h' | '12h'>('24h');
  readonly showSeconds = signal(false);
  readonly hourStep = signal(1);
  readonly minTime = signal<Date | undefined>(undefined);
  readonly maxTime = signal<Date | undefined>(undefined);
  readonly disabledMinutes = signal<((hour: number) => readonly number[]) | undefined>(undefined);
}

describe('KuiTimePickerPanelComponent', () => {
  let fixture: ComponentFixture<TestPanelHost>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestPanelHost] }).compileComponents();
    fixture = TestBed.createComponent(TestPanelHost);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function columns(): HTMLElement[] {
    return Array.from(host.querySelectorAll<HTMLElement>('.kui-timepicker-col'));
  }

  function cellByLabel(colEl: HTMLElement, label: string): HTMLElement | undefined {
    return Array.from(colEl.querySelectorAll<HTMLElement>('.kui-timepicker-opt')).find(
      (o) => o.textContent?.trim() === label,
    );
  }

  it('renders hours/minutes columns with role listbox/option', () => {
    const cols = columns();
    expect(cols.length).toBe(2);
    expect(cols[0].getAttribute('role')).toBe('listbox');
    expect(cols[0].querySelector('[role="option"]')).toBeTruthy();
  });

  it('marks the selected hour and minute cells', () => {
    expect(cellByLabel(columns()[0], '09')?.getAttribute('aria-selected')).toBe('true');
    expect(cellByLabel(columns()[1], '30')?.getAttribute('aria-selected')).toBe('true');
  });

  it('ArrowDown in the hours column moves to the next hour and applies immediately', () => {
    const hoursCol = columns()[0];
    hoursCol.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()?.getHours()).toBe(10);
  });

  it('ArrowUp cycles from the first hour to the last (23)', () => {
    fixture.componentInstance.value.set(new Date(2026, 0, 1, 0, 30, 0));
    fixture.detectChanges();

    const hoursCol = columns()[0];
    hoursCol.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()?.getHours()).toBe(23);
  });

  it('Home/End jump to the first/last minute', () => {
    const minutesCol = columns()[1];
    minutesCol.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()?.getMinutes()).toBe(59);

    minutesCol.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()?.getMinutes()).toBe(0);
  });

  it('clicking a cell applies it without closing (no ancestor dropdown here)', () => {
    const cell = cellByLabel(columns()[0], '15');
    cell?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()?.getHours()).toBe(15);
  });

  it('"Now" sets the value to the current time', () => {
    const before = fixture.componentInstance.value();
    const nowBtn = Array.from(host.querySelectorAll<HTMLButtonElement>('button')).find(
      (b) => b.textContent?.trim() === 'Now',
    );
    nowBtn?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).not.toBe(before);
  });

  it('shows an AM/PM segmented toggle only in 12h format', () => {
    expect(host.querySelector('.kui-timepicker-period')).toBeNull();

    fixture.componentInstance.format.set('12h');
    fixture.detectChanges();

    expect(host.querySelector('.kui-timepicker-period')).toBeTruthy();
    const hoursCol = host.querySelectorAll('.kui-timepicker-col')[0];
    expect(hoursCol.querySelectorAll('[role="option"]').length).toBe(12);
  });

  it('renders a seconds column only when showSeconds is set', () => {
    expect(columns().length).toBe(2);
    fixture.componentInstance.showSeconds.set(true);
    fixture.detectChanges();
    expect(columns().length).toBe(3);
  });

  it('hourStep thins the hours column', () => {
    fixture.componentInstance.hourStep.set(6);
    fixture.detectChanges();

    const hourLabels = Array.from(
      columns()[0].querySelectorAll<HTMLElement>('.kui-timepicker-opt'),
    ).map((o) => o.textContent?.trim());
    expect(hourLabels).toEqual(['00', '06', '12', '18']);
  });

  it('marks cells before minTime / after maxTime as disabled and skips them on click/keyboard', () => {
    fixture.componentInstance.minTime.set(new Date(2000, 0, 1, 9, 0, 0));
    fixture.componentInstance.maxTime.set(new Date(2000, 0, 1, 17, 0, 0));
    fixture.detectChanges();

    const hoursCol = columns()[0];
    const cell8 = cellByLabel(hoursCol, '08');
    const cell18 = cellByLabel(hoursCol, '18');
    expect(cell8?.getAttribute('aria-disabled')).toBe('true');
    expect(cell18?.getAttribute('aria-disabled')).toBe('true');

    cell8?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.value()?.getHours()).toBe(9); // unchanged, still 09:30 from the initial value

    hoursCol.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true }));
    fixture.detectChanges();
    expect(fixture.componentInstance.value()?.getHours()).toBe(10); // stepped past disabled 09 -> next enabled is already 10
  });

  it('disabledMinutes(hour) disables the given minutes for every hour', () => {
    fixture.componentInstance.disabledMinutes.set(() => [0, 15]);
    fixture.detectChanges();

    const minutesCol = columns()[1];
    expect(cellByLabel(minutesCol, '00')?.getAttribute('aria-disabled')).toBe('true');
    expect(cellByLabel(minutesCol, '15')?.getAttribute('aria-disabled')).toBe('true');
    expect(cellByLabel(minutesCol, '16')?.getAttribute('aria-disabled')).toBeNull();
  });
});

@Component({
  template: `<kui-time-picker-panel [(value)]="value" />`,
  imports: [KuiTimePickerPanelComponent],
})
class TestEmptyPanelHost {
  readonly value = signal<Date | null>(null);
}

describe('KuiTimePickerPanelComponent starting from no value', () => {
  let fixture: ComponentFixture<TestEmptyPanelHost>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestEmptyPanelHost] }).compileComponents();
    fixture = TestBed.createComponent(TestEmptyPanelHost);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  function columns(): HTMLElement[] {
    return Array.from(host.querySelectorAll<HTMLElement>('.kui-timepicker-col'));
  }

  /**
   * Regression test: picking only a minute cell while `value` is still `null` must not leak the
   * real wall-clock hour into the field the user never touched -- the base for an unset value is
   * a fixed local midnight (0:00), not `new Date()`.
   */
  it('picking only a minute does not leak the real current hour into the hours column', () => {
    const minuteCell = Array.from(
      columns()[1].querySelectorAll<HTMLElement>('.kui-timepicker-opt'),
    ).find((o) => o.textContent?.trim() === '30');
    minuteCell?.click();
    fixture.detectChanges();

    const value = fixture.componentInstance.value();
    expect(value?.getMinutes()).toBe(30);
    expect(value?.getHours()).toBe(0);
  });
});
