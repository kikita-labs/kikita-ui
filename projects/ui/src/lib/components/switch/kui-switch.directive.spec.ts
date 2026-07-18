import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiFieldComponent } from '../field';
import { KuiSwitchDirective } from './kui-switch.directive';

@Component({
  imports: [KuiSwitchDirective],
  template: '<input kuiSwitch type="checkbox" size="sm" invalid />',
})
class StandaloneSwitchHost {}

@Component({
  imports: [KuiFieldComponent, KuiSwitchDirective],
  template: `
    <kui-field label="Enabled" hint="Optional" error="Required" size="lg">
      <input kuiSwitch type="checkbox" />
    </kui-field>
  `,
})
class FieldSwitchHost {}

describe('KuiSwitchDirective', () => {
  it('adds switch host attributes for size, role, and invalid state', () => {
    const fixture = createFixture(StandaloneSwitchHost);

    const control = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    expect(control.classList.contains('kui-switch')).toBe(true);
    expect(control.getAttribute('role')).toBe('switch');
    expect(control.getAttribute('data-kui-size')).toBe('sm');
    expect(control.getAttribute('aria-invalid')).toBe('true');
  });

  it('uses parent field ids for label and descriptions', () => {
    const fixture = createFixture(FieldSwitchHost);

    const field = fixture.nativeElement.querySelector('kui-field') as HTMLElement;
    const label = field.querySelector('label') as HTMLLabelElement;
    const control = field.querySelector('input') as HTMLInputElement;

    expect(control.id).toBeTruthy();
    expect(label.getAttribute('for')).toBe(control.id);
    expect(control.getAttribute('data-kui-size')).toBe('lg');
    expect(control.getAttribute('aria-invalid')).toBe('true');
    expect(control.getAttribute('aria-describedby')).toContain(`${control.id}-hint`);
    expect(control.getAttribute('aria-describedby')).toContain(`${control.id}-error`);
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
