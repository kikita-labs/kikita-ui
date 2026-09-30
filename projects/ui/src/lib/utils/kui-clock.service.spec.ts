import { ApplicationRef, PLATFORM_ID, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { KuiCalendarComponent } from '../components/calendar';
import { KUI_CLOCK_SEED, KuiClock } from './kui-clock.service';

const realNow = new Date(2026, 11, 5, 12, 0, 0);

function seedServerDate(year: number, month: number, day: number, ageMs = 1_000): void {
  TestBed.inject(TransferState).set(KUI_CLOCK_SEED, {
    year,
    month,
    day,
    epoch: realNow.getTime() - ageMs,
  });
}

describe('KuiClock', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(realNow);
  });

  afterEach(() => {
    vi.useRealTimers();
    TestBed.resetTestingModule();
  });

  it('renders the server date first and the real local date after the first browser render', () => {
    seedServerDate(2026, 8, 30);

    const clock = TestBed.inject(KuiClock);

    expect(clock.initialNow().getMonth()).toBe(8);
    expect(clock.today()).toEqual(new Date(2026, 8, 30));

    TestBed.inject(ApplicationRef).tick();

    expect(clock.today()).toEqual(new Date(2026, 11, 5));
  });

  it('ignores a seed that is too old to belong to the render being hydrated', () => {
    seedServerDate(2026, 8, 30, 60 * 60 * 1000);

    const clock = TestBed.inject(KuiClock);

    expect(clock.initialNow().getMonth()).toBe(11);
    expect(clock.today()).toEqual(new Date(2026, 11, 5));
  });

  it('uses the real date when nothing was transferred, as in a client-only app', () => {
    const clock = TestBed.inject(KuiClock);

    expect(clock.today()).toEqual(new Date(2026, 11, 5));
  });

  it('records the server calendar date for the browser', () => {
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

    TestBed.inject(KuiClock);

    expect(TestBed.inject(TransferState).get(KUI_CLOCK_SEED, null)).toEqual({
      year: 2026,
      month: 11,
      day: 5,
      epoch: realNow.getTime(),
    });
  });

  it('keeps the seeded month and never leaves the server day marked once the browser has rendered', () => {
    seedServerDate(2026, 8, 30);

    const fixture = TestBed.createComponent(KuiCalendarComponent);
    fixture.componentRef.setInput('locale', 'en-US');
    fixture.detectChanges();
    TestBed.inject(ApplicationRef).tick();
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;

    // The visible month is the server's, so hydrated markup and the first browser render agree.
    expect(element.querySelector('.kui-calendar-title')?.textContent).toContain('September 2026');
    // The marker followed the real date (December 5, outside the grid); the 30th is not stale.
    expect(element.querySelectorAll('.kui-calendar-day--today')).toHaveLength(0);
  });
});
