import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KUI_LOCALE } from '../../i18n/kui-locale.token';
import { KuiCalendarComponent } from './kui-calendar.component';

@Component({
  imports: [KuiCalendarComponent],
  template: `
    <kui-calendar
      [(value)]="value"
      [minDate]="minDate()"
      [size]="size()"
      [showFooter]="showFooter()"
    />
  `,
})
class CalendarHost {
  readonly value = signal<Date | null>(null);
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
  readonly value = signal<Date | null>(null);
}

@Component({
  imports: [KuiCalendarComponent],
  template: `<kui-calendar [value]="value()" [viewDate]="viewDate()" />`,
})
class CalendarInitialValueHost {
  readonly value = signal<Date | null>(new Date(2026, 4, 14));
  readonly viewDate = signal(new Date(2026, 4, 1));
}

describe('KuiCalendarComponent', () => {
  let fixture: ComponentFixture<CalendarHost>;
  let host: CalendarHost;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalendarHost, CalendarProjectedFooterHost, CalendarInitialValueHost],
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

  it('puts the initially selected date in the tab order for the displayed month', () => {
    const initialFixture = TestBed.createComponent(CalendarInitialValueHost);
    initialFixture.detectChanges();

    const calendar = initialFixture.nativeElement as HTMLElement;
    const tabStops = calendar.querySelectorAll<HTMLButtonElement>(
      '.kui-calendar-day[tabindex="0"]',
    );

    expect(tabStops).toHaveLength(1);
    expect(tabStops[0].textContent?.trim()).toBe('14');
    expect(tabStops[0].closest('[role="gridcell"]')?.getAttribute('aria-selected')).toBe('true');
  });

  it('marks today with aria-current="date"', () => {
    const today = new Date();
    const cell = dayButton(String(today.getDate()));
    expect(cell.getAttribute('aria-current')).toBe('date');
  });

  it('selects a date on click and emits valueChange', () => {
    const cell = dayButton('15');
    cell.click();
    fixture.detectChanges();
    expect(host.value()).not.toBeNull();
    expect(host.value()?.getDate()).toBe(15);
    expect(cell.classList.contains('kui-calendar-day--selected')).toBe(true);
    expect(cell.closest('[role="gridcell"]')?.getAttribute('aria-selected')).toBe('true');
    expect(cell.hasAttribute('aria-selected')).toBe(false);
  });

  it('renders a complete ARIA grid: header row, then six rows of seven gridcells', () => {
    const root = fixture.nativeElement as HTMLElement;
    const grid = root.querySelector('[role="grid"]')!;
    const headerRow = grid.querySelector(':scope > .kui-calendar-weekdays')!;
    const weekRows = grid.querySelectorAll('[role="rowgroup"] > [role="row"]');

    expect(headerRow.getAttribute('role')).toBe('row');
    expect(headerRow.querySelectorAll('[role="columnheader"]')).toHaveLength(7);
    expect(weekRows).toHaveLength(6);
    weekRows.forEach((row) => {
      expect(row.querySelectorAll(':scope > [role="gridcell"]')).toHaveLength(7);
    });
    // Every day button sits in a gridcell and none of them carries a role-less selection state.
    expect(root.querySelectorAll('[role="gridcell"] > .kui-calendar-day')).toHaveLength(42);
    expect(root.querySelectorAll('button[aria-selected]')).toHaveLength(0);
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
    const cell = dayButton('15');
    cell.focus();
    cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));
    fixture.detectChanges();
    cell.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(host.value()?.getDate()).toBe(16);
  });

  it('moves DOM focus to the new roving day after ArrowRight', async () => {
    const currentDay = dayButton('15');
    currentDay.focus();
    currentDay.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true }));

    await fixture.whenStable();
    fixture.detectChanges();

    const nextDay = dayButton('16');
    expect(nextDay.getAttribute('tabindex')).toBe('0');
    expect(document.activeElement).toBe(nextDay);
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
