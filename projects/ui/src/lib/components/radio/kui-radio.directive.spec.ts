import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KuiFieldComponent } from '../field';
import { KuiRadioDirective } from './kui-radio.directive';

@Component({
  imports: [KuiRadioDirective],
  template: '<input kuiRadio type="radio" size="sm" invalid />',
})
class StandaloneRadioHost {}

@Component({
  imports: [KuiFieldComponent, KuiRadioDirective],
  template: `
    <kui-field label="Plan" hint="Choose one" error="Required">
      <input kuiRadio type="radio" name="plan" />
    </kui-field>
  `,
})
class FieldRadioHost {}

describe('KuiRadioDirective', () => {
  it('adds radio host attributes for size and invalid state', () => {
    const fixture = createFixture(StandaloneRadioHost);

    const radio = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(radio.classList.contains('kui-radio')).toBe(true);
    expect(radio.getAttribute('data-kui-size')).toBe('sm');
    expect(radio.getAttribute('aria-invalid')).toBe('true');
  });

  it('uses parent field ids for label and descriptions', () => {
    const fixture = createFixture(FieldRadioHost);

    const field = fixture.nativeElement.querySelector('kui-field') as HTMLElement;
    const label = field.querySelector('label') as HTMLLabelElement;
    const radio = field.querySelector('input') as HTMLInputElement;

    expect(radio.id).toBeTruthy();
    expect(label.getAttribute('for')).toBe(radio.id);
    expect(radio.getAttribute('aria-invalid')).toBe('true');
    expect(radio.getAttribute('aria-describedby')).toContain(`${radio.id}-hint`);
    expect(radio.getAttribute('aria-describedby')).toContain(`${radio.id}-error`);
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
