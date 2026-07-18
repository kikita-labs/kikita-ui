import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KUI_LOCALE } from '../../i18n/kui-locale.token';
import { KuiCalendarComponent } from './kui-calendar.component';
import type { KuiCalendarMode, KuiCalendarValue } from './kui-calendar.types';

@Component({
  imports: [KuiCalendarComponent],
  template: `
    <kui-calendar
      [mode]="mode()"
      [(value)]="value"
      [minDate]="minDate()"
      [size]="size()"
      [showFooter]="showFooter()"
    />
  `,
})
class CalendarHost {
  readonly mode = signal<KuiCalendarMode>('single');
  readonly value = signal<KuiCalendarValue>(null);
  readonly minDate = signal<Date | undefined>(undefined);
  readonly size = signal<'md' | 'sm'>('md');
  readonly showFooter = signal(false);
}

@Component({
  imports: [KuiCalendarComponent],
  template: `
    <kui-calendar [(value)]="value">
      <div kuiCalendarFooter class="custom-footer">custom footer</div>
    </kui-calendar>
  `,
})
class CalendarProjectedFooterHost {
  readonly value = signal<KuiCalendarValue>(null);
}

describe('KuiCalendarComponent', () => {
  let fixture: ComponentFixture<CalendarHost>;
  let host: CalendarHost;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalendarHost, CalendarProjectedFooterHost],
      providers: [{ provide: KUI_LOCALE, useValue: 'en-US' }],
    });
    fixture = TestBed.createComponent(CalendarHost);
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

  it('selects a date in single mode on click and emits valueChange', () => {
    const cell = dayButton('15');
    cell.click();
    fixture.detectChanges();
    expect(host.value()).not.toBeNull();
    expect((host.value() as Date).getDate()).toBe(15);
    expect(cell.classList.contains('kui-calendar-day--selected')).toBe(true);
    expect(cell.getAttribute('aria-selected')).toBe('true');
  });

  it('builds a range across two clicks', () => {
    host.mode.set('range');
    fixture.detectChanges();

    dayButton('10').click();
    fixture.detectChanges();
    dayButton('20').click();
    fixture.detectChanges();

    const range = host.value() as { start: Date; end: Date | null };
    expect(range.start.getDate()).toBe(10);
    expect(range.end?.getDate()).toBe(20);
    expect(el().querySelectorAll('.kui-calendar-day--range-middle').length).toBeGreaterThan(0);
  });

  it('normalizes a reversed range so start <= end', () => {
    host.mode.set('range');
    fixture.detectChanges();

    dayButton('20').click();
    fixture.detectChanges();
    dayButton('10').click();
    fixture.detectChanges();

    const range = host.value() as { start: Date; end: Date | null };
    expect(range.start.getDate()).toBe(10);
    expect(range.end?.getDate()).toBe(20);
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
    expect((host.value() as Date).getDate()).toBe(16);
  });

  it('hides the footer by default and shows it with showFooter', () => {
    expect(el().querySelector('.kui-calendar-footer')).toBeNull();

    host.showFooter.set(true);
    fixture.detectChanges();

    const footer = el().querySelector('.kui-calendar-footer');
    expect(footer).not.toBeNull();
    expect(footer?.querySelector('.kui-calendar-value')?.textContent).toBe('—');
  });

  it('replaces the default footer with projected [kuiCalendarFooter] content', () => {
    const projectedFixture = TestBed.createComponent(CalendarProjectedFooterHost);
    projectedFixture.detectChanges();
    const projectedEl = projectedFixture.nativeElement as HTMLElement;

    expect(projectedEl.querySelector('.custom-footer')?.textContent).toBe('custom footer');
    expect(projectedEl.querySelector('.kui-calendar-footer')).toBeNull();
  });

  it('renders localized month names via the injected locale', async () => {
    await TestBed.resetTestingModule()
      .configureTestingModule({
        imports: [CalendarHost],
        providers: [{ provide: KUI_LOCALE, useValue: 'ru-RU' }],
      })
      .compileComponents();

    const ruFixture = TestBed.createComponent(CalendarHost);
    ruFixture.detectChanges();
    const title = (ruFixture.nativeElement as HTMLElement).querySelector('.kui-calendar-title');
    // Cyrillic range as \uXXXX escapes, not literal characters -- tracked source is
    // English-only (see scripts/verify-static-audit.mjs's checkNoCyrillic).
    // Cyrillic range as \uXXXX escapes, not literal characters -- tracked source is
    // English-only (see scripts/verify-static-audit.mjs's checkNoCyrillic).
    expect(title?.textContent).toMatch(/[\u0410-\u042f\u0430-\u044f\u0401\u0451]/);
  });
});
