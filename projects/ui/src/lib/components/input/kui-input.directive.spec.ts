import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { provideKikitaUi } from '../../providers';
import { KuiFieldComponent } from '../field';
import { KuiInputDirective } from './kui-input.directive';

@Component({
  imports: [KuiInputDirective],
  template: '<input kuiInput size="sm" invalid />',
})
class StandaloneInputHost {}

@Component({
  imports: [KuiFieldComponent, KuiInputDirective],
  template: `
    <kui-field label="Email" hint="Use work email" error="Required">
      <input kuiInput />
    </kui-field>
  `,
})
class FieldInputHost {}

@Component({
  imports: [KuiInputDirective],
  template: '<input kuiInput />',
})
class DefaultInputHost {}

@Component({
  imports: [KuiFieldComponent, KuiInputDirective],
  template: `
    <kui-field label="Email" size="lg">
      <input kuiInput />
    </kui-field>
  `,
})
class FieldSizedInputHost {}

describe('KuiInputDirective', () => {
  it('adds input host attributes for size and invalid state', () => {
    const fixture = createFixture(StandaloneInputHost);

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.classList.contains('kui-input')).toBe(true);
    expect(input.getAttribute('data-kui-size')).toBe('sm');
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('uses parent field ids for label and descriptions', () => {
    const fixture = createFixture(FieldInputHost);

    const field = fixture.nativeElement.querySelector('kui-field') as HTMLElement;
    const label = field.querySelector('label') as HTMLLabelElement;
    const input = field.querySelector('input') as HTMLInputElement;

    expect(input.id).toBeTruthy();
    expect(label.getAttribute('for')).toBe(input.id);
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(input.getAttribute('aria-describedby')).toContain(`${input.id}-hint`);
    expect(input.getAttribute('aria-describedby')).toContain(`${input.id}-error`);
  });

  it('uses the root size default when no local size or field size is set', () => {
    TestBed.configureTestingModule({
      imports: [DefaultInputHost],
      providers: [provideKikitaUi({ defaults: { size: 'sm' } })],
    });

    const fixture = TestBed.createComponent(DefaultInputHost);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.getAttribute('data-kui-size')).toBe('sm');
  });

  it('inherits parent field size before falling back to the root default', () => {
    TestBed.configureTestingModule({
      imports: [FieldSizedInputHost],
      providers: [provideKikitaUi({ defaults: { size: 'sm' } })],
    });

    const fixture = TestBed.createComponent(FieldSizedInputHost);
    fixture.detectChanges();

    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(input.getAttribute('data-kui-size')).toBe('lg');
  });
});

function createFixture<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({
    imports: [component],
  });

  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();

  return fixture;
}
