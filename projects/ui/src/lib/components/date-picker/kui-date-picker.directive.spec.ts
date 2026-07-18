import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { KuiCalendarComponent } from '../calendar/kui-calendar.component';
import { KuiDropdownComponent } from '../dropdown';
import { KuiFieldComponent } from '../field/kui-field.component';
import { KuiDatePickerDirective } from './kui-date-picker.directive';

@Component({
  template: `
    <kui-field label="Meeting date">
      <input
        kuiDatePicker
        [(value)]="value"
        [minDate]="minDate()"
        [disabled]="disabled()"
        [readonly]="readonly()"
      />
      <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="420px">
        <kui-calendar flat [(value)]="value" />
      </kui-dropdown>
    </kui-field>
  `,
  imports: [KuiFieldComponent, KuiDropdownComponent, KuiDatePickerDirective, KuiCalendarComponent],
})
class TestDatePickerHost {
  readonly value = signal<Date | null>(null);
  readonly minDate = signal<Date | undefined>(undefined);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
}

function clickInput(input: HTMLInputElement): void {
  input.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  input.click();
}

describe('KuiDatePickerDirective', () => {
  let fixture: ComponentFixture<TestDatePickerHost>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestDatePickerHost] }).compileComponents();
    fixture = TestBed.createComponent(TestDatePickerHost);
    host = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  });

  afterEach(() => {
    document.querySelector('.cdk-overlay-container')?.replaceChildren();
  });

  function getInput(): HTMLInputElement {
    return host.querySelector('input') as HTMLInputElement;
  }

  it('opens the popover with a role of dialog, not listbox', () => {
    clickInput(getInput());
    fixture.detectChanges();

    const panel = document.querySelector('.kui-dropdown');
    expect(panel).toBeTruthy();
    expect(panel?.getAttribute('role')).toBe('dialog');
  });

  it('parses a valid dd.MM.yyyy date and updates the shared value', () => {
    const input = getInput();
    input.value = '17.07.2026';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const value = fixture.componentInstance.value();
    expect(value?.getFullYear()).toBe(2026);
    expect(value?.getMonth()).toBe(6);
    expect(value?.getDate()).toBe(17);
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('marks an invalid date as aria-invalid without clearing the previous value', () => {
    const input = getInput();
    input.value = '17.07.2026';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    input.value = '32.13.2026';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.componentInstance.value()?.getDate()).toBe(17);
  });

  it('marks a date before minDate as invalid', () => {
    fixture.componentInstance.minDate.set(new Date(2026, 6, 20));
    fixture.detectChanges();

    const input = getInput();
    input.value = '17.07.2026';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('selecting a day in the linked calendar formats it back into the input', () => {
    clickInput(getInput());
    fixture.detectChanges();

    const dayButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        '.kui-calendar-day:not(.kui-calendar-day--muted)',
      ),
    );
    const today = new Date();
    const cell = dayButtons.find((b) => b.textContent?.trim() === String(today.getDate()));
    cell?.click();
    fixture.detectChanges();

    const input = getInput();
    expect(input.value).toMatch(/^\d{2}\.\d{2}\.\d{4}$/);
    expect(fixture.componentInstance.value()).not.toBeNull();
  });

  it('clears the value through the clear button', () => {
    const input = getInput();
    input.value = '17.07.2026';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const clearBtn = host.querySelector<HTMLButtonElement>('.kui-date-picker-clear');
    clearBtn?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()).toBeNull();
    expect(input.value).toBe('');
  });

  it('does not open the popover when disabled or readonly', () => {
    fixture.componentInstance.disabled.set(true);
    fixture.detectChanges();

    clickInput(getInput());
    fixture.detectChanges();
    expect(document.querySelector('.kui-dropdown')).toBeNull();

    fixture.componentInstance.disabled.set(false);
    fixture.componentInstance.readonly.set(true);
    fixture.detectChanges();

    clickInput(getInput());
    fixture.detectChanges();
    expect(document.querySelector('.kui-dropdown')).toBeNull();
  });

  it('Escape starts closing the popover and keeps focus in the field', () => {
    const input = getInput();
    clickInput(input);
    fixture.detectChanges();
    expect(document.querySelector('.kui-dropdown')).toBeTruthy();

    input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(document.querySelector('.kui-dropdown--closing')).toBeTruthy();
    expect(document.activeElement).toBe(input);
  });
});
