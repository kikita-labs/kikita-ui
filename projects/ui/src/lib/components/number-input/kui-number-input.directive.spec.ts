import { Component, PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, it, expect, beforeEach } from 'vitest';

import { KuiNumberInputDirective } from './kui-number-input.directive';

@Component({
  template: `
    <input
      type="number"
      kuiNumberInput
      [attr.min]="min()"
      [attr.max]="max()"
      [attr.step]="step()"
      [attr.value]="value()"
      [size]="size()"
      [variant]="variant()"
      [invalid]="invalid()"
      [attr.disabled]="disabled() || null"
      [attr.readonly]="readonly() || null"
    />
  `,
  imports: [KuiNumberInputDirective],
})
class TestHost {
  readonly value = signal(5);
  readonly min = signal(0);
  readonly max = signal(10);
  readonly step = signal(1);
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly variant = signal<'a' | 'b'>('b');
  readonly invalid = signal(false);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
}

@Component({
  template: `<input type="number" kuiNumberInput value="5" />`,
  imports: [KuiNumberInputDirective],
})
class ServerHost {}

describe('KuiNumberInputDirective', () => {
  let fixture: ComponentFixture<TestHost>;
  let host: TestHost;

  function container(): HTMLElement {
    return fixture.nativeElement.querySelector('.kui-number-input') as HTMLElement;
  }

  function nativeInput(): HTMLInputElement {
    return fixture.nativeElement.querySelector('.kui-number-input__input') as HTMLInputElement;
  }

  function decBtn(): HTMLElement {
    return fixture.nativeElement.querySelector(
      '.kui-number-input__btn--dec, .kui-number-input__arrow--dec',
    ) as HTMLElement;
  }

  function incBtn(): HTMLElement {
    return fixture.nativeElement.querySelector(
      '.kui-number-input__btn--inc, .kui-number-input__arrow--inc',
    ) as HTMLElement;
  }

  function fireMousedown(el: HTMLElement): void {
    el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [TestHost] }).compileComponents();
    fixture = TestBed.createComponent(TestHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('wraps native input in .kui-number-input container', () => {
    expect(container()).toBeTruthy();
  });

  it('native input has class kui-number-input__input', () => {
    expect(nativeInput().classList.contains('kui-number-input__input')).toBe(true);
  });

  it('sets data-kui-size on container', () => {
    expect(container().dataset['kuiSize']).toBe('md');
  });

  it('updates data-kui-size when size changes', () => {
    host.size.set('lg');
    fixture.detectChanges();
    expect(container().dataset['kuiSize']).toBe('lg');
  });

  it('variant b renders dec and inc side buttons', () => {
    expect(fixture.nativeElement.querySelector('.kui-number-input__btn--dec')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.kui-number-input__btn--inc')).not.toBeNull();
  });

  it('increments native input value on inc button press', () => {
    fireMousedown(incBtn());
    expect(parseFloat(nativeInput().value)).toBe(6);
  });

  it('increments native input value from keyboard activation', () => {
    incBtn().dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();
    expect(parseFloat(nativeInput().value)).toBe(6);
  });

  it('decrements native input value on dec button press', () => {
    fireMousedown(decBtn());
    expect(parseFloat(nativeInput().value)).toBe(4);
  });

  it('respects step attribute', () => {
    host.step.set(2);
    fixture.detectChanges();
    fireMousedown(incBtn());
    expect(parseFloat(nativeInput().value)).toBe(7);
  });

  it('clamps at max on increment', () => {
    host.value.set(10);
    fixture.detectChanges();
    fireMousedown(incBtn());
    expect(parseFloat(nativeInput().value)).toBe(10);
  });

  it('clamps at min on decrement', () => {
    host.value.set(0);
    fixture.detectChanges();
    fireMousedown(decBtn());
    expect(parseFloat(nativeInput().value)).toBe(0);
  });

  it('dec button has aria-disabled at min', () => {
    host.value.set(0);
    fixture.detectChanges();
    expect(decBtn().getAttribute('aria-disabled')).toBe('true');
  });

  it('inc button has aria-disabled at max', () => {
    host.value.set(10);
    fixture.detectChanges();
    expect(incBtn().getAttribute('aria-disabled')).toBe('true');
  });

  it('inc button has disabled attribute at max', () => {
    host.value.set(10);
    fixture.detectChanges();
    expect(incBtn().hasAttribute('disabled')).toBe(true);
  });

  it('no aria-disabled on dec when not at min', () => {
    host.value.set(5);
    fixture.detectChanges();
    expect(decBtn().getAttribute('aria-disabled')).toBeNull();
  });

  it('no aria-disabled on inc when not at max', () => {
    host.value.set(5);
    fixture.detectChanges();
    expect(incBtn().getAttribute('aria-disabled')).toBeNull();
  });

  it('sets data-kui-disabled on container when native input is disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    expect(container().hasAttribute('data-kui-disabled')).toBe(true);
  });

  it('disables generated buttons when native input is disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    expect(decBtn().hasAttribute('disabled')).toBe(true);
    expect(incBtn().hasAttribute('disabled')).toBe(true);
    expect(decBtn().getAttribute('aria-disabled')).toBe('true');
    expect(incBtn().getAttribute('aria-disabled')).toBe('true');
  });

  it('removes data-kui-disabled when no longer disabled', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    host.disabled.set(false);
    fixture.detectChanges();
    expect(container().hasAttribute('data-kui-disabled')).toBe(false);
  });

  it('sets data-kui-readonly on container when native input is readonly', () => {
    host.readonly.set(true);
    fixture.detectChanges();
    expect(container().hasAttribute('data-kui-readonly')).toBe(true);
  });

  it('buttons have aria-disabled when readonly', () => {
    host.readonly.set(true);
    fixture.detectChanges();
    expect(decBtn().getAttribute('aria-disabled')).toBe('true');
    expect(incBtn().getAttribute('aria-disabled')).toBe('true');
  });

  it('sets data-kui-invalid on container when invalid input is true', () => {
    host.invalid.set(true);
    fixture.detectChanges();
    expect(container().hasAttribute('data-kui-invalid')).toBe(true);
  });

  it('removes data-kui-invalid when invalid is false', () => {
    host.invalid.set(true);
    fixture.detectChanges();
    host.invalid.set(false);
    fixture.detectChanges();
    expect(container().hasAttribute('data-kui-invalid')).toBe(false);
  });

  it('native input has aria-invalid when invalid', () => {
    host.invalid.set(true);
    fixture.detectChanges();
    expect(nativeInput().getAttribute('aria-invalid')).toBe('true');
  });

  it('dispatches input event on step so Angular forms are notified', () => {
    let eventFired = false;
    nativeInput().addEventListener('input', () => {
      eventFired = true;
    });
    fireMousedown(incBtn());
    expect(eventFired).toBe(true);
  });

  it('syncs button state after generated stepping', () => {
    host.value.set(9);
    fixture.detectChanges();
    fireMousedown(incBtn());
    expect(nativeInput().value).toBe('10');
    expect(incBtn().getAttribute('aria-disabled')).toBe('true');
    expect(incBtn().hasAttribute('disabled')).toBe(true);
  });

  it('syncs button state after native input changes', () => {
    nativeInput().value = '10';
    nativeInput().dispatchEvent(new Event('input', { bubbles: true }));
    fixture.detectChanges();
    expect(incBtn().getAttribute('aria-disabled')).toBe('true');
    expect(incBtn().hasAttribute('disabled')).toBe(true);
  });

  it('steps immediately on mousedown before interval starts', () => {
    host.value.set(0);
    host.max.set(100);
    fixture.detectChanges();
    // mousedown fires the first step immediately (synchronously before the timer).
    incBtn().dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    expect(parseFloat(nativeInput().value)).toBe(1);
    incBtn().dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
  });

  it('removes generated wrapper when directive is destroyed', () => {
    fixture.destroy();
    expect(fixture.nativeElement.querySelector('.kui-number-input')).toBeNull();
  });
});

describe('KuiNumberInputDirective on the server', () => {
  it('leaves the native input unwrapped so hydration can match the template DOM', async () => {
    await TestBed.configureTestingModule({
      imports: [ServerHost],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    }).compileComponents();

    const fixture = TestBed.createComponent(ServerHost);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.kui-number-input')).toBeNull();
    expect(fixture.nativeElement.querySelector('input[kuiNumberInput]')).not.toBeNull();
  });
});
