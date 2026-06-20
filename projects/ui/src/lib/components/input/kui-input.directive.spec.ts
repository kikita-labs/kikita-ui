import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

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
});

function createFixture<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({
    imports: [component],
  });

  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();

  return fixture;
}
