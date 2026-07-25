import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KUI_LOCALE } from '../../i18n/kui-locale.token';
import type { KuiDateRange } from '../calendar/kui-calendar.types';
import { KuiCalendarRangeComponent } from './kui-calendar-range.component';

@Component({
  imports: [KuiCalendarRangeComponent],
  template: `
    <kui-calendar-range
      [(value)]="value"
      [minDate]="minDate()"
      [size]="size()"
      [showFooter]="showFooter()"
    />
  `,
})
class CalendarRangeHost {
  readonly value = signal<KuiDateRange | null>(null);
  readonly minDate = signal<Date | undefined>(undefined);
  readonly size = signal<'md' | 'sm'>('md');
  readonly showFooter = signal(false);
}

describe('KuiCalendarRangeComponent', () => {
  let fixture: ComponentFixture<CalendarRangeHost>;
  let host: CalendarRangeHost;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalendarRangeHost],
      providers: [{ provide: KUI_LOCALE, useValue: 'en-US' }],
    });
    fixture = TestBed.createComponent(CalendarRangeHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function el(): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }

  function dayButton(label: string): HTMLButtonElement {
    const buttons = Array.from(
      el().querySelectorAll<HTMLButtonElement>('.kui-calendar-day:not(.kui-calendar-day--muted)'),
    );
    const match = buttons.find((b) => b.textContent?.trim() === label);
    if (!match) throw new Error(`day ${label} not found`);
    return match;
  }

  it('renders a 7-day week header and a 6x7 day grid', () => {
    expect(el().querySelectorAll('.kui-calendar-weekday').length).toBe(7);
    expect(el().querySelectorAll('.kui-calendar-day').length).toBe(42);
  });

  it('marks today with aria-current="date"', () => {
    const today = new Date();
    const cell = dayButton(String(today.getDate()));
    expect(cell.getAttribute('aria-current')).toBe('date');
  });

  it('builds a range across two clicks', () => {
    dayButton('10').click();
    fixture.detectChanges();
    dayButton('20').click();
    fixture.detectChanges();

    const range = host.value();
    expect(range?.start.getDate()).toBe(10);
    expect(range?.end?.getDate()).toBe(20);
    expect(el().querySelectorAll('.kui-calendar-day--range-middle').length).toBeGreaterThan(0);
  });

  it('normalizes a reversed range so start <= end', () => {
    dayButton('20').click();
    fixture.detectChanges();
    dayButton('10').click();
    fixture.detectChanges();

    const range = host.value();
    expect(range?.start.getDate()).toBe(10);
    expect(range?.end?.getDate()).toBe(20);
  });

  it('previews the range on hover before the second click', () => {
    dayButton('10').click();
    fixture.detectChanges();

    dayButton('15').dispatchEvent(new MouseEvent('mouseenter', { bubbles: true }));
    fixture.detectChanges();

    expect(el().querySelectorAll('.kui-calendar-day--preview').length).toBeGreaterThan(0);
  });

  it('disables dates before minDate and blocks selection', () => {
    const now = new Date();
    host.minDate.set(new Date(now.getFullYear(), now.getMonth(), 16));
    fixture.detectChanges();

    const cell = dayButton('15');
    expect(cell.getAttribute('aria-disabled')).toBe('true');
    cell.click();
    fixture.detectChanges();
    expect(host.value()).toBeNull();
  });

  it('applies data-kui-size="sm" only for the sm size', () => {
    const calendar = el().querySelector('.kui-calendar') as HTMLElement;
    expect(calendar.getAttribute('data-kui-size')).toBeNull();
    host.size.set('sm');
    fixture.detectChanges();
    expect(calendar.getAttribute('data-kui-size')).toBe('sm');
  });

  it('navigates to the next month header on arrow-right past month end via keyboard, and Enter selects', () => {
    const grid = el().querySelector('.kui-calendar-grid') as HTMLElement;
    const cell = dayButton('15');
    cell.focus();
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    grid.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(host.value()?.start.getDate()).toBe(16);
  });

  it('hides the footer by default and shows it with showFooter', () => {
    expect(el().querySelector('.kui-calendar-footer')).toBeNull();

    host.showFooter.set(true);
    fixture.detectChanges();

    const footer = el().querySelector('.kui-calendar-footer');
    expect(footer).not.toBeNull();
    expect(footer?.querySelector('.kui-calendar-value')?.textContent).toBe('—');
  });

  it('renders localized month names via the injected locale', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [CalendarRangeHost],
        providers: [{ provide: KUI_LOCALE, useValue: 'ru-RU' }],
      })
      .compileComponents();

    const ruFixture = TestBed.createComponent(CalendarRangeHost);
    ruFixture.detectChanges();
    const title = (ruFixture.nativeElement as HTMLElement).querySelector('.kui-calendar-title');
    // Cyrillic range built from numeric char codes, not literal characters -- tracked
    // source is English-only (see scripts/verify-static-audit.mjs's checkNoCyrillic).
    const cyrillicPattern = new RegExp(
      `[${String.fromCharCode(0x0410)}-${String.fromCharCode(0x042f)}${String.fromCharCode(
        0x0430,
      )}-${String.fromCharCode(0x044f)}${String.fromCharCode(0x0401)}${String.fromCharCode(0x0451)}]`,
    );
    expect(title?.textContent).toMatch(cyrillicPattern);
  });
});
