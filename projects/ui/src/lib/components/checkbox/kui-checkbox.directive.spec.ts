import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KuiFieldComponent } from '../field';
import { KuiCheckboxDirective } from './kui-checkbox.directive';

@Component({
  imports: [KuiCheckboxDirective],
  template: '<input kuiCheckbox type="checkbox" size="sm" invalid />',
})
class StandaloneCheckboxHost {}

@Component({
  imports: [KuiFieldComponent, KuiCheckboxDirective],
  template: `
    <kui-field label="Accept" hint="Required" error="Required">
      <input kuiCheckbox type="checkbox" />
    </kui-field>
  `,
})
class FieldCheckboxHost {}

describe('KuiCheckboxDirective', () => {
  it('adds checkbox host attributes for size and invalid state', () => {
    const fixture = createFixture(StandaloneCheckboxHost);

    const checkbox = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(checkbox.classList.contains('kui-checkbox')).toBe(true);
    expect(checkbox.getAttribute('data-kui-size')).toBe('sm');
    expect(checkbox.getAttribute('aria-invalid')).toBe('true');
  });

  it('uses parent field ids for label and descriptions', () => {
    const fixture = createFixture(FieldCheckboxHost);

    const field = fixture.nativeElement.querySelector('kui-field') as HTMLElement;
    const label = field.querySelector('label') as HTMLLabelElement;
    const checkbox = field.querySelector('input') as HTMLInputElement;

    expect(checkbox.id).toBeTruthy();
    expect(label.getAttribute('for')).toBe(checkbox.id);
    expect(checkbox.getAttribute('aria-invalid')).toBe('true');
    expect(checkbox.getAttribute('aria-describedby')).toContain(`${checkbox.id}-hint`);
    expect(checkbox.getAttribute('aria-describedby')).toContain(`${checkbox.id}-error`);
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
