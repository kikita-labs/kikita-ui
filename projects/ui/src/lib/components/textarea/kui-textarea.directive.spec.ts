import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiFieldComponent } from '../field';
import { KuiTextareaDirective } from './kui-textarea.directive';

@Component({
  imports: [KuiTextareaDirective],
  template: '<textarea kuiTextarea size="lg" invalid></textarea>',
})
class StandaloneTextareaHost {}

@Component({
  imports: [KuiFieldComponent, KuiTextareaDirective],
  template: `
    <kui-field label="Notes" hint="Short internal note" error="Required" size="sm">
      <textarea kuiTextarea></textarea>
    </kui-field>
  `,
})
class FieldTextareaHost {}

describe('KuiTextareaDirective', () => {
  it('adds textarea host attributes for size and invalid state', () => {
    const fixture = createFixture(StandaloneTextareaHost);

    const textarea = fixture.nativeElement.querySelector('textarea') as HTMLTextAreaElement;

    expect(textarea.classList.contains('kui-input')).toBe(true);
    expect(textarea.classList.contains('kui-textarea')).toBe(true);
    expect(textarea.getAttribute('data-kui-size')).toBe('lg');
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
  });

  it('uses parent field ids for label and descriptions', () => {
    const fixture = createFixture(FieldTextareaHost);

    const field = fixture.nativeElement.querySelector('kui-field') as HTMLElement;
    const label = field.querySelector('label') as HTMLLabelElement;
    const textarea = field.querySelector('textarea') as HTMLTextAreaElement;

    expect(textarea.id).toBeTruthy();
    expect(label.getAttribute('for')).toBe(textarea.id);
    expect(textarea.getAttribute('data-kui-size')).toBe('sm');
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
    expect(textarea.getAttribute('aria-describedby')).toContain(`${textarea.id}-hint`);
    expect(textarea.getAttribute('aria-describedby')).toContain(`${textarea.id}-error`);
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
