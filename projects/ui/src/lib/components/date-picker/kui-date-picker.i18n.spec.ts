import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { describe, expect, it } from 'vitest';

import { provideKikitaUi } from '../../root';
import { KuiCalendarComponent } from '../calendar/kui-calendar.component';
import { KuiDropdownComponent } from '../dropdown';
import { KuiFieldComponent } from '../field/kui-field.component';
import { KuiDatePickerDirective } from './kui-date-picker.directive';

@Component({
  imports: [KuiFieldComponent, KuiDropdownComponent, KuiDatePickerDirective, KuiCalendarComponent],
  template: `
    <kui-field label="Date">
      <input kuiDatePicker [(value)]="value" [format]="format()" [messages]="messages()" />
      <kui-dropdown panelRole="dialog"><kui-calendar flat /></kui-dropdown>
    </kui-field>
  `,
})
class Host {
  readonly value = signal<Date | null>(null);
  readonly format = signal<string | undefined>(undefined);
  readonly messages = signal<{ dayPlaceholder?: string } | undefined>(undefined);
}

function setup(options: Parameters<typeof provideKikitaUi>[0] = {}) {
  TestBed.configureTestingModule({ providers: [provideKikitaUi(options)] });
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;

  return { fixture, input };
}

function type(fixture: { detectChanges(): void }, input: HTMLInputElement, text: string): void {
  input.value = text;
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();
}

describe('KuiDatePickerDirective locale', () => {
  it('shows and parses the numeric layout of the locale', () => {
    const { fixture, input } = setup({ locale: 'en-US' });

    expect(input.getAttribute('placeholder')).toBe('mm/dd/yyyy');
    type(fixture, input, '10/03/2026');
    expect(fixture.componentInstance.value()).toEqual(new Date(2026, 9, 3));

    fixture.componentInstance.value.set(new Date(2027, 0, 5));
    fixture.detectChanges();
    expect(input.value).toBe('01/05/2027');
  });

  it('follows the day, month and year order of other locales', () => {
    const { fixture, input } = setup({ locale: 'ja-JP' });

    expect(input.getAttribute('placeholder')).toBe('yyyy/mm/dd');
    type(fixture, input, '2026/10/03');
    expect(fixture.componentInstance.value()).toEqual(new Date(2026, 9, 3));
  });

  it('accepts a one digit day and month', () => {
    const { fixture, input } = setup({ locale: 'ru-RU' });

    type(fixture, input, '3.1.2026');
    expect(fixture.componentInstance.value()).toEqual(new Date(2026, 0, 3));
  });

  it('marks text that is not a date as invalid and keeps the value', () => {
    const { fixture, input } = setup({ locale: 'en-US' });

    type(fixture, input, '10/03/2026');
    type(fixture, input, '13/45/2026');

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.componentInstance.value()).toEqual(new Date(2026, 9, 3));
  });

  it('flags a leap day in a non-leap four-digit year after a valid early year', () => {
    const { fixture, input } = setup({ locale: 'en-US' });

    type(fixture, input, '02/29/0000');
    expect(input.getAttribute('aria-invalid')).toBeNull();
    type(fixture, input, '02/29/0001');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('restores a fixed layout with the format input and the defaults key', () => {
    const { fixture, input } = setup({ locale: 'en-US' });
    fixture.componentInstance.format.set('dd.MM.yyyy');
    fixture.detectChanges();

    expect(input.getAttribute('placeholder')).toBe('dd.mm.yyyy');
    type(fixture, input, '03.10.2026');
    expect(fixture.componentInstance.value()).toEqual(new Date(2026, 9, 3));

    TestBed.resetTestingModule();
    const configured = setup({
      locale: 'en-US',
      defaults: { datePicker: { format: 'yyyy-MM-dd' } },
    });
    expect(configured.input.getAttribute('placeholder')).toBe('yyyy-mm-dd');
  });

  it('reads the placeholder tokens from the messages and lets the instance override one', () => {
    const { fixture, input } = setup({
      locale: 'en-US',
      messages: { datePicker: { dayPlaceholder: 'DD', monthPlaceholder: 'MM' } },
    });

    expect(input.getAttribute('placeholder')).toBe('MM/DD/yyyy');

    fixture.componentInstance.messages.set({ dayPlaceholder: 'day' });
    fixture.detectChanges();
    expect(input.getAttribute('placeholder')).toBe('MM/day/yyyy');
  });

  it('names the calendar button from the messages', () => {
    const { fixture } = setup({ messages: { datePicker: { openCalendar: 'Pick a date' } } });
    const button = (fixture.nativeElement as HTMLElement).querySelector('.kui-date-picker-chevron');

    expect(button?.getAttribute('aria-label')).toBe('Pick a date');
  });
});
