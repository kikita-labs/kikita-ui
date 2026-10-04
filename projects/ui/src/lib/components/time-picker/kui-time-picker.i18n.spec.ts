import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { describe, expect, it } from 'vitest';

import { provideKikitaUi } from '../../root';
import { KuiDropdown } from '../dropdown';
import { KuiField } from '../field/kui-field.component';
import { KuiTimePicker } from './kui-time-picker.directive';
import { KuiTimePickerPanel } from './kui-time-picker-panel.component';

@Component({
  imports: [KuiField, KuiDropdown, KuiTimePicker, KuiTimePickerPanel],
  template: `
    <kui-field label="Time">
      <input kuiTimePicker [(value)]="value" />
      <kui-dropdown panelRole="dialog"><kui-time-picker-panel /></kui-dropdown>
    </kui-field>
  `,
})
class Host {
  readonly value = signal<Date | null>(new Date(2026, 9, 3, 15, 4, 5));
}

function setup(options: Parameters<typeof provideKikitaUi>[0] = {}) {
  TestBed.configureTestingModule({ providers: [provideKikitaUi(options)] });
  const fixture = TestBed.createComponent(Host);
  fixture.detectChanges();
  const input = (fixture.nativeElement as HTMLElement).querySelector('input')!;

  return { fixture, input };
}

function type(fixture: { detectChanges(): void }, input: HTMLInputElement, text: string): string {
  input.value = text;
  input.dispatchEvent(new Event('input'));
  fixture.detectChanges();

  return input.value;
}

describe('KuiTimePicker locale', () => {
  it('defaults to the hour cycle of the locale', () => {
    expect(setup({ locale: 'en-US' }).input.value).toBe('03:04 PM');
    TestBed.resetTestingModule();
    expect(setup({ locale: 'ru-RU' }).input.value).toBe('15:04');
  });

  it('uses the separator of the locale when typing and showing', () => {
    const { fixture, input } = setup({ locale: 'da-DK' });

    expect(input.value).toBe('15.04');
    expect(type(fixture, input, '2230')).toBe('22.30');
    expect(fixture.componentInstance.value()?.getHours()).toBe(22);
  });

  it('shows the day period before the time where the locale puts it first', () => {
    const { input } = setup({ locale: 'ja-JP', defaults: { timePicker: { format: '12h' } } });

    expect(input.value.startsWith('午後')).toBe(true);
  });

  it('accepts the locale day period text and the ASCII abbreviation', () => {
    const { fixture, input } = setup({ locale: 'en-US' });

    expect(type(fixture, input, '0930 a')).toBe('09:30 a');
    expect(type(fixture, input, '09:30 AM')).toBe('09:30 AM');
    expect(fixture.componentInstance.value()?.getHours()).toBe(9);

    type(fixture, input, '09:30 pm');
    expect(fixture.componentInstance.value()?.getHours()).toBe(21);
  });

  it('flags an unfinished day period as invalid until it is complete', () => {
    const { fixture, input } = setup({ locale: 'en-US' });

    type(fixture, input, '0230');
    type(fixture, input, `${input.value}a`);
    expect(input.value).toBe('02:30 a');
    expect(input.getAttribute('aria-invalid')).toBe('true');

    type(fixture, input, `${input.value}m`);
    expect(input.value).toBe('02:30 AM');
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('reads the placeholder tokens from the messages', () => {
    const { input } = setup({
      locale: 'ru-RU',
      messages: { timePicker: { hourPlaceholder: 'HH', minutePlaceholder: 'MM' } },
    });

    expect(input.getAttribute('placeholder')).toBe('HH:MM');
  });

  it('names the picker button from the messages', () => {
    const { fixture } = setup({ messages: { timePicker: { openPicker: 'Pick a time' } } });
    const root = fixture.nativeElement as HTMLElement;

    expect(root.querySelector('.kui-timepicker-chevron')?.getAttribute('aria-label')).toBe(
      'Pick a time',
    );
  });
});
