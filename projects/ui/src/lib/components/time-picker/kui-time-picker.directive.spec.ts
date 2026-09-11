import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { KuiDropdownComponent } from '../dropdown';
import { KuiFieldComponent } from '../field/kui-field.component';
import { KuiTimePickerDirective } from './kui-time-picker.directive';
import { KuiTimePickerPanelComponent } from './kui-time-picker-panel.component';

@Component({
  template: `
    <kui-field label="Time">
      <input
        kuiTimePicker
        [(value)]="value"
        [format]="format()"
        [showSeconds]="showSeconds()"
        [hourStep]="hourStep()"
        [minuteStep]="minuteStep()"
        [disabledMinutes]="disabledMinutes()"
        [disabled]="disabled()"
        [readonly]="readonly()"
      />
      <kui-dropdown panelRole="dialog" panelWidth="auto" maxHeight="280px">
        <kui-time-picker-panel />
      </kui-dropdown>
    </kui-field>
  `,
  imports: [
    KuiFieldComponent,
    KuiDropdownComponent,
    KuiTimePickerDirective,
    KuiTimePickerPanelComponent,
  ],
})
class TestTimePickerHost {
  readonly value = signal<Date | null>(null);
  readonly format = signal<'24h' | '12h'>('24h');
  readonly showSeconds = signal(false);
  readonly hourStep = signal(1);
  readonly minuteStep = signal(1);
  readonly disabledMinutes = signal<((hour: number) => readonly number[]) | undefined>(undefined);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
}

function clickInput(input: HTMLInputElement): void {
  input.dispatchEvent(new Event('pointerdown', { bubbles: true }));
  input.click();
}

describe('KuiTimePickerDirective', () => {
  let fixture: ComponentFixture<TestTimePickerHost>;
  let host: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestTimePickerHost] }).compileComponents();
    fixture = TestBed.createComponent(TestTimePickerHost);
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

  it('parses a valid HH:mm time and updates the shared value', () => {
    const input = getInput();
    input.value = '14:32';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const value = fixture.componentInstance.value();
    expect(value?.getHours()).toBe(14);
    expect(value?.getMinutes()).toBe(32);
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('auto-inserts the colon separator as digits are typed', () => {
    const input = getInput();
    input.value = '2214';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('22:14');
  });

  it('strips characters that can never be part of a valid value', () => {
    const input = getInput();
    input.value = 'abc2214xyz';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('22:14');
  });

  it('marks an incomplete (still-being-typed) time as aria-invalid without clearing the previous value', () => {
    const input = getInput();
    input.value = '14:32';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // "221" masks to "22:1" -- a single-digit minute doesn't match the parser's `\d{2}` yet.
    input.value = '221';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('22:1');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.componentInstance.value()?.getHours()).toBe(14);
  });

  it('clamps a typed hour/minute to the valid maximum instead of leaving an out-of-range value', () => {
    const input = getInput();
    input.value = '5599';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(input.value).toBe('23:59');
    expect(input.getAttribute('aria-invalid')).toBeNull();
    expect(fixture.componentInstance.value()?.getHours()).toBe(23);
    expect(fixture.componentInstance.value()?.getMinutes()).toBe(59);
  });

  it('snaps a typed minute to the nearest minuteStep instead of leaving an off-step value', () => {
    fixture.componentInstance.minuteStep.set(15);
    fixture.detectChanges();

    const input = getInput();
    input.value = '1412';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()?.getMinutes()).toBe(15);
    expect(input.value).toBe('14:15');
  });

  it('snaps a typed hour to the nearest hourStep instead of leaving an off-step value', () => {
    fixture.componentInstance.hourStep.set(3);
    fixture.detectChanges();

    const input = getInput();
    input.value = '0859';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()?.getHours()).toBe(9);
    expect(input.value).toBe('09:59');
  });

  /**
   * Regression test: the auto-mask used to require the whole "AM"/"PM" in one match, stripping a
   * lone "P" right back out before the "M" could ever arrive (rebuild-from-scratch reprocesses
   * the *previous, already-stripped* result on every keystroke) -- making it impossible to type
   * the period one character at a time, which is how a real keyboard always types it.
   */
  it('lets AM/PM be typed one character at a time, auto-inserting the leading space', () => {
    fixture.componentInstance.format.set('12h');
    fixture.detectChanges();

    const input = getInput();
    const typeChar = (existing: string, char: string) => {
      input.value = existing + char;
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      return input.value;
    };

    let text = typeChar('', '1');
    text = typeChar(text, '2');
    text = typeChar(text, '3');
    text = typeChar(text, '0');
    // Digits alone are already enough to commit (period defaults from `base`, see
    // parseDisplayTime's doc) -- the field reformats to show that default immediately.
    expect(text).toBe('12:30 AM');

    // Typing "P" appends to the current "12:30 AM" text (a real keyboard would too); the mask
    // still recovers correctly -- it strips the stray "AM" and keeps only the trailing "P".
    text = typeChar(text, 'P');
    expect(text).toBe('12:30 P');

    text = typeChar(text, 'M');
    expect(text).toBe('12:30 PM');
    expect(fixture.componentInstance.value()?.getHours()).toBe(12);
    expect(fixture.componentInstance.value()?.getMinutes()).toBe(30);
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  /**
   * Regression test for the reported bug: typing digits without the AM/PM suffix used to leave
   * `value` completely untouched (parse failed outright), so clicking the AM/PM toggle afterward
   * acted on stale old data -- silently discarding everything just typed. Digits alone must now
   * commit (defaulting the period), so the toggle flips the period on the just-typed value.
   */
  it('typing digits without AM/PM still commits the value, defaulting the period', () => {
    fixture.componentInstance.format.set('12h');
    fixture.componentInstance.value.set(new Date(2026, 0, 1, 14, 15, 0)); // 02:15 PM
    fixture.detectChanges();

    const input = getInput();
    input.value = '1232';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    // Defaults from the previous value's period (PM), not a hardcoded AM -- so it doesn't flip
    // the period out from under the user either.
    expect(fixture.componentInstance.value()?.getHours()).toBe(12);
    expect(fixture.componentInstance.value()?.getMinutes()).toBe(32);
    expect(input.value).toBe('12:32 PM');
  });

  it('marks a typed time landing on a disabledMinutes slot as aria-invalid, same as out-of-range min/max', () => {
    fixture.componentInstance.disabledMinutes.set(() => [0, 15, 30, 45]);
    fixture.detectChanges();

    const input = getInput();
    input.value = '1400';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(fixture.componentInstance.value()?.getMinutes()).toBe(0);
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('clears the value through the clear button', () => {
    const input = getInput();
    input.value = '14:32';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const clearBtn = host.querySelector<HTMLButtonElement>('.kui-timepicker-clear');
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

  it('pushes the typed value into the unbound sibling panel (auto-wire)', () => {
    const input = getInput();
    input.value = '14:32';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    clickInput(input);
    fixture.detectChanges();

    const cols = document.querySelectorAll<HTMLElement>('.kui-timepicker-col');
    const hourCell = Array.from(cols[0].querySelectorAll<HTMLElement>('.kui-timepicker-opt')).find(
      (o) => o.textContent?.trim() === '14',
    );
    expect(hourCell?.getAttribute('aria-selected')).toBe('true');
  });

  it('clicking a minute cell updates the input without closing the panel', () => {
    const input = getInput();
    input.value = '14:32';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const cols = document.querySelectorAll<HTMLElement>('.kui-timepicker-col');
    const minuteCell = Array.from(
      cols[1].querySelectorAll<HTMLElement>('.kui-timepicker-opt'),
    ).find((o) => o.textContent?.trim() === '45');
    minuteCell?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.value()?.getMinutes()).toBe(45);
    expect(document.querySelector('.kui-dropdown')).toBeTruthy();
    expect(document.querySelector('.kui-dropdown--closing')).toBeNull();
  });

  it('"Done" closes the panel keeping the current selection', () => {
    const input = getInput();
    clickInput(input);
    fixture.detectChanges();

    const doneBtn = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(
      (b) => b.textContent?.trim() === 'Done',
    );
    doneBtn?.click();
    fixture.detectChanges();

    expect(document.querySelector('.kui-dropdown--closing')).toBeTruthy();
  });

  it('shows a seconds column only when showSeconds is set', () => {
    clickInput(getInput());
    fixture.detectChanges();
    expect(document.querySelectorAll('.kui-timepicker-col').length).toBe(2);

    document.querySelector<HTMLElement>('.kui-timepicker-chevron')?.click();
    fixture.detectChanges();

    fixture.componentInstance.showSeconds.set(true);
    fixture.detectChanges();
    clickInput(getInput());
    fixture.detectChanges();
    expect(document.querySelectorAll('.kui-timepicker-col').length).toBe(3);
  });
});
