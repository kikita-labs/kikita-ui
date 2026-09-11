import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';
import { form, FormField, required } from '@angular/forms/signals';

import { KuiFieldComponent } from '../field';
import { KuiOtpInputComponent } from './kui-otp-input.component';

@Component({
  imports: [KuiOtpInputComponent],
  template: `<kui-otp-input [(value)]="code" [length]="4" [autoFocus]="autoFocus()" />`,
})
class OtpInputHost {
  readonly code = signal('');
  readonly autoFocus = signal(false);
}

@Component({
  imports: [KuiOtpInputComponent],
  template: `<kui-otp-input [(value)]="code" [length]="4" (complete)="onComplete($event)" />`,
})
class OtpInputCompleteHost {
  readonly code = signal('');
  readonly completed: string[] = [];

  onComplete(value: string): void {
    this.completed.push(value);
  }
}

@Component({
  imports: [KuiOtpInputComponent],
  template: `<kui-otp-input [(value)]="code" [length]="4" [integerOnly]="false" />`,
})
class OtpInputAlphaHost {
  readonly code = signal('');
}

@Component({
  imports: [FormField, KuiFieldComponent, KuiOtpInputComponent],
  template: `
    <kui-field label="Code">
      <kui-otp-input [formField]="signInForm.code" [length]="4" />
    </kui-field>
  `,
})
class OtpInputSignalFormsHost {
  readonly model = signal({ code: '' });
  readonly signInForm = form(this.model);
}

@Component({
  imports: [KuiFieldComponent, KuiOtpInputComponent],
  template: `
    <kui-field label="Code from email" hint="Sent to your email" error="Wrong code">
      <kui-otp-input [length]="4" />
    </kui-field>
  `,
})
class OtpInputFieldHost {}

@Component({
  imports: [FormField, KuiFieldComponent, KuiOtpInputComponent],
  template: `
    <kui-field label="Code">
      <kui-otp-input [formField]="signInForm.code" [length]="4" />
    </kui-field>
  `,
})
class OtpInputValidatorHost {
  readonly model = signal({ code: '' });
  readonly signInForm = form(this.model, (path) => {
    required(path.code, { message: 'Code is required' });
  });
}

describe('KuiOtpInputComponent', () => {
  function createFixture(): ComponentFixture<OtpInputHost> {
    TestBed.configureTestingModule({ imports: [OtpInputHost] });
    const fixture = TestBed.createComponent(OtpInputHost);
    fixture.detectChanges();
    return fixture;
  }

  function cells(fixture: ComponentFixture<unknown>): HTMLInputElement[] {
    return Array.from(fixture.nativeElement.querySelectorAll('input'));
  }

  function typeInto(input: HTMLInputElement, char: string): void {
    input.value = char;
    input.dispatchEvent(new Event('input'));
  }

  it('renders one input cell per length with a group role and aria-label', () => {
    const fixture = createFixture();
    const host = fixture.nativeElement.querySelector('kui-otp-input') as HTMLElement;

    expect(host.getAttribute('role')).toBe('group');
    expect(host.getAttribute('aria-label')).toBe('Verification code');
    expect(cells(fixture).length).toBe(4);
  });

  it('gives each cell a unique, descriptive aria-label', () => {
    const fixture = createFixture();
    const [c0, c1] = cells(fixture);

    expect(c0.getAttribute('aria-label')).toBe('Digit 1 of 4');
    expect(c1.getAttribute('aria-label')).toBe('Digit 2 of 4');
  });

  it('auto-advances focus and joins characters into value', () => {
    const fixture = createFixture();
    const [c0, c1] = cells(fixture);

    typeInto(c0, '4');
    fixture.detectChanges();

    expect(document.activeElement).toBe(c1);
    expect(fixture.componentInstance.code()).toBe('4');
  });

  it('rejects non-digit characters by default', () => {
    const fixture = createFixture();
    const [c0] = cells(fixture);

    typeInto(c0, 'x');
    fixture.detectChanges();

    expect(fixture.componentInstance.code()).toBe('');
  });

  it('accepts and uppercases letters when integerOnly is false', () => {
    TestBed.configureTestingModule({ imports: [OtpInputAlphaHost] });
    const fixture = TestBed.createComponent(OtpInputAlphaHost);
    fixture.detectChanges();
    const [c0] = cells(fixture);

    typeInto(c0, 'a');
    fixture.detectChanges();

    expect(fixture.componentInstance.code()).toBe('A');
  });

  it('Backspace on an empty cell clears and refocuses the previous cell', () => {
    const fixture = createFixture();
    const [c0, c1] = cells(fixture);

    typeInto(c0, '1');
    fixture.detectChanges();
    c1.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(c0);
    expect(fixture.componentInstance.code()).toBe('');
  });

  it('ArrowLeft/ArrowRight move focus without changing value', () => {
    const fixture = createFixture();
    const [c0, c1] = cells(fixture);

    typeInto(c0, '1');
    fixture.detectChanges();
    c1.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowLeft', bubbles: true }));
    fixture.detectChanges();

    expect(document.activeElement).toBe(c0);
    expect(fixture.componentInstance.code()).toBe('1');
  });

  it('Home/End jump to the first/last cell', () => {
    const fixture = createFixture();
    const [c0, , , c3] = cells(fixture);

    c0.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(c3);

    c3.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(c0);
  });

  it('distributes pasted text across cells starting from the first cell', () => {
    const fixture = createFixture();
    const [c0] = cells(fixture);

    const clipboardData = { getData: () => '12 34' } as unknown as DataTransfer;
    c0.dispatchEvent(
      Object.assign(new Event('paste', { bubbles: true, cancelable: true }), { clipboardData }),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.code()).toBe('1234');
  });

  it('emits complete exactly once when every cell becomes filled', () => {
    TestBed.configureTestingModule({ imports: [OtpInputCompleteHost] });
    const fixture = TestBed.createComponent(OtpInputCompleteHost);
    fixture.detectChanges();
    const inputs = cells(fixture);

    for (const [i, input] of inputs.entries()) {
      typeInto(input, String(i + 1));
      fixture.detectChanges();
    }

    expect(fixture.componentInstance.completed).toEqual(['1234']);
  });

  it('reflects invalid/disabled/loading on every cell', () => {
    @Component({
      imports: [KuiOtpInputComponent],
      template: `<kui-otp-input [length]="2" invalid disabled loading />`,
    })
    class StatesHost {}

    TestBed.configureTestingModule({ imports: [StatesHost] });
    const fixture = TestBed.createComponent(StatesHost);
    fixture.detectChanges();
    const inputs = cells(fixture);

    for (const input of inputs) {
      expect(input.getAttribute('data-kui-invalid')).toBe('');
      expect(input.disabled).toBe(true);
    }
    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('.kui-otp-input__loader')).not.toBeNull();
    // `loading` blurs the cells in place (via CSS keyed on `[data-kui-loading]`) instead of
    // hiding or covering them -- they stay real, still-rendered `<input>` elements underneath.
    expect(host.querySelector('kui-otp-input')?.getAttribute('data-kui-loading')).toBe('');
  });

  it('the kui-field label targets the first cell id, so a native label click focuses it', () => {
    // jsdom does not implement native label-activation behavior (clicking a real <label for> in a
    // real browser moves focus to its target), so this only asserts the id/for correspondence a
    // browser relies on -- verified end to end in tests/e2e/behavior.spec.ts.
    TestBed.configureTestingModule({ imports: [OtpInputFieldHost] });
    const fixture = TestBed.createComponent(OtpInputFieldHost);
    fixture.detectChanges();

    const label = fixture.nativeElement.querySelector('.kui-field__label') as HTMLLabelElement;
    const [c0] = cells(fixture);

    expect(label.getAttribute('for')).toBe(c0.id);
  });

  it('binds to Signal Forms via [formField]', () => {
    TestBed.configureTestingModule({ imports: [OtpInputSignalFormsHost] });
    const fixture = TestBed.createComponent(OtpInputSignalFormsHost);
    fixture.detectChanges();
    const [c0] = cells(fixture);

    typeInto(c0, '7');
    fixture.detectChanges();

    expect(fixture.componentInstance.model().code).toBe('7');
  });

  it('forwards the ancestor kui-field hint/error ids as aria-describedby on the group', () => {
    TestBed.configureTestingModule({ imports: [OtpInputFieldHost] });
    const fixture = TestBed.createComponent(OtpInputFieldHost);
    fixture.detectChanges();

    const group = fixture.nativeElement.querySelector('kui-otp-input') as HTMLElement;
    const describedBy = group.getAttribute('aria-describedby') ?? '';
    const ids = describedBy.split(' ').filter(Boolean);

    expect(ids.length).toBe(2);
    for (const id of ids) {
      expect(fixture.nativeElement.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it('does not mark cells invalid from a failing [formField] validator before the field is touched', () => {
    TestBed.configureTestingModule({ imports: [OtpInputValidatorHost] });
    const fixture = TestBed.createComponent(OtpInputValidatorHost);
    fixture.detectChanges();

    for (const input of cells(fixture)) {
      expect(input.hasAttribute('data-kui-invalid')).toBe(false);
    }
    expect(fixture.nativeElement.querySelector('.kui-field__error')).toBeNull();
  });

  it('marks cells invalid and renders the kui-field error once the field is touched', () => {
    TestBed.configureTestingModule({ imports: [OtpInputValidatorHost] });
    const fixture = TestBed.createComponent(OtpInputValidatorHost);
    fixture.detectChanges();

    fixture.componentInstance.signInForm.code().markAsTouched();
    fixture.detectChanges();

    for (const input of cells(fixture)) {
      expect(input.getAttribute('data-kui-invalid')).toBe('');
    }
    expect(fixture.nativeElement.querySelector('.kui-field__error')?.textContent?.trim()).toBe(
      'Code is required',
    );
  });

  it('ignores paste on a read-only group', () => {
    @Component({
      imports: [KuiOtpInputComponent],
      template: `<kui-otp-input [(value)]="code" [length]="4" readOnly />`,
    })
    class ReadOnlyHost {
      readonly code = signal('1234');
    }

    TestBed.configureTestingModule({ imports: [ReadOnlyHost] });
    const fixture = TestBed.createComponent(ReadOnlyHost);
    fixture.detectChanges();
    const [c0] = cells(fixture);

    const clipboardData = { getData: () => '9999' } as unknown as DataTransfer;
    c0.dispatchEvent(
      Object.assign(new Event('paste', { bubbles: true, cancelable: true }), { clipboardData }),
    );
    fixture.detectChanges();

    expect(fixture.componentInstance.code()).toBe('1234');
  });

  it('ignores Backspace cross-cell clearing on a read-only group', () => {
    @Component({
      imports: [KuiOtpInputComponent],
      template: `<kui-otp-input [(value)]="code" [length]="4" readOnly />`,
    })
    class ReadOnlyHost {
      readonly code = signal('12');
    }

    TestBed.configureTestingModule({ imports: [ReadOnlyHost] });
    const fixture = TestBed.createComponent(ReadOnlyHost);
    fixture.detectChanges();
    const [, , c2] = cells(fixture);

    c2.dispatchEvent(new KeyboardEvent('keydown', { key: 'Backspace', bubbles: true }));
    fixture.detectChanges();

    expect(fixture.componentInstance.code()).toBe('12');
  });
});
