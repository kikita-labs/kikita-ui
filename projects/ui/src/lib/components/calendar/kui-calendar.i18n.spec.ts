import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { describe, expect, it } from 'vitest';

import { KuiI18n } from '../../i18n/kui-i18n';
import { provideKikitaUi } from '../../root';
import { KuiCalendarRange } from '../calendar-range/kui-calendar-range';
import { KuiCalendar } from './kui-calendar';

@Component({
  imports: [KuiCalendar],
  template: `<kui-calendar [viewDate]="viewDate" [locale]="locale()" [messages]="messages()" />`,
})
class CalendarHost {
  readonly viewDate = new Date(2026, 9, 1);
  readonly locale = signal<string | undefined>(undefined);
  readonly messages = signal<{ previousMonth?: string } | undefined>(undefined);
}

@Component({
  imports: [KuiCalendarRange],
  template: `<kui-calendar-range [viewDate]="viewDate" locale="en-US" />`,
})
class RangeHost {
  readonly viewDate = new Date(2026, 9, 1);
}

function setup(locale: string) {
  TestBed.configureTestingModule({ providers: [provideKikitaUi({ locale })] });
  const fixture = TestBed.createComponent(CalendarHost);
  fixture.detectChanges();

  return { fixture, root: fixture.nativeElement as HTMLElement };
}

function title(root: HTMLElement): string {
  return root.querySelector('.kui-calendar-title')?.textContent?.trim() ?? '';
}

describe('KuiCalendar locale and messages', () => {
  it('names every day with its full localized date', () => {
    const { root } = setup('en-US');
    const day = Array.from(root.querySelectorAll<HTMLElement>('.kui-calendar-day')).find(
      (button) =>
        button.textContent?.trim() === '3' && !button.classList.contains('kui-calendar-day--muted'),
    );

    expect(day?.getAttribute('aria-label')).toBe('Saturday, October 3, 2026');
  });

  it('writes the month and year in the order of the locale', () => {
    expect(title(setup('en-US').root)).toBe('October 2026');
    TestBed.resetTestingModule();
    expect(title(setup('ja-JP').root)).toBe('2026年10月');
  });

  it('marks the weekend of the locale', () => {
    const { root } = setup('he-IL');
    const weekend = (label: string) =>
      Array.from(root.querySelectorAll<HTMLElement>('.kui-calendar-day'))
        .find(
          (button) =>
            button.textContent?.trim() === label &&
            !button.classList.contains('kui-calendar-day--muted'),
        )
        ?.classList.contains('kui-calendar-day--weekend');

    // 2026-10-02 is a Friday, 2026-10-03 a Saturday, 2026-10-04 a Sunday.
    expect(weekend('2')).toBe(true);
    expect(weekend('3')).toBe(true);
    expect(weekend('4')).toBe(false);
  });

  it('starts the week on the day the locale starts it', () => {
    const monday = new Intl.DateTimeFormat('ru-RU', { weekday: 'long', timeZone: 'UTC' }).format(
      Date.UTC(2026, 9, 5),
    );
    const { root } = setup('ru-RU');

    expect(root.querySelector('.kui-calendar-weekday')?.getAttribute('abbr')).toBe(monday);
  });

  it('lets the instance locale input win over the level locale', () => {
    const { fixture, root } = setup('en-US');

    fixture.componentInstance.locale.set('de-DE');
    fixture.detectChanges();

    expect(title(root)).toBe('Oktober 2026');
  });

  it('follows a runtime locale change', () => {
    const { fixture, root } = setup('en-US');

    TestBed.inject(KuiI18n).setLocale('de-DE');
    fixture.detectChanges();

    expect(title(root)).toBe('Oktober 2026');
  });

  it('reads navigation labels from the messages and lets the instance override one', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ messages: { calendar: { nextMonth: 'Forward' } } })],
    });
    const fixture = TestBed.createComponent(CalendarHost);
    fixture.componentInstance.messages.set({ previousMonth: 'Back' });
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('[aria-label="Back"]')).not.toBeNull();
    expect(root.querySelector('[aria-label="Forward"]')).not.toBeNull();
    expect(root.querySelector('[aria-label="Calendar"]')).not.toBeNull();
  });
});

describe('KuiCalendarRange locale', () => {
  it('names day cells with the full date and marks the locale weekend', () => {
    TestBed.configureTestingModule({ providers: [provideKikitaUi()] });
    const fixture = TestBed.createComponent(RangeHost);
    fixture.detectChanges();
    const root = fixture.nativeElement as HTMLElement;
    const day = Array.from(root.querySelectorAll<HTMLElement>('.kui-calendar-day')).find(
      (button) =>
        button.textContent?.trim() === '3' && !button.classList.contains('kui-calendar-day--muted'),
    );

    expect(day?.getAttribute('aria-label')).toBe('Saturday, October 3, 2026');
    expect(day?.classList.contains('kui-calendar-day--weekend')).toBe(true);
  });
});
