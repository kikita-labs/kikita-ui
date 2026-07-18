import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiSeparatorDirective } from './kui-separator.directive';

@Component({
  imports: [KuiSeparatorDirective],
  template: '<hr kuiSeparator appearance="strong" orientation="vertical" spacing="xs" />',
})
class SeparatorHost {}

describe('KuiSeparatorDirective', () => {
  it('adds separator host attributes for appearance, orientation, and spacing', () => {
    const fixture = createFixture(SeparatorHost);

    const separator = fixture.nativeElement.querySelector('hr') as HTMLHRElement;

    expect(separator.classList.contains('kui-separator')).toBe(true);
    expect(separator.getAttribute('data-kui-appearance')).toBe('strong');
    expect(separator.getAttribute('data-kui-orientation')).toBe('vertical');
    expect(separator.getAttribute('data-kui-spacing')).toBe('xs');
    expect(separator.getAttribute('aria-orientation')).toBe('vertical');
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
