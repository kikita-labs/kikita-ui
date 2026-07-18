import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiGroupDirective } from './kui-group.directive';

@Component({
  imports: [KuiGroupDirective],
  template: '<div kuiGroup orientation="vertical" size="sm" collapsed></div>',
})
class GroupHost {}

describe('KuiGroupDirective', () => {
  it('adds group layout attributes', () => {
    const fixture = createFixture(GroupHost);

    const group = fixture.nativeElement.querySelector('div') as HTMLDivElement;

    expect(group.classList.contains('kui-group')).toBe(true);
    expect(group.getAttribute('data-kui-orientation')).toBe('vertical');
    expect(group.getAttribute('data-kui-size')).toBe('sm');
    expect(group.hasAttribute('data-kui-collapsed')).toBe(true);
    expect(group.hasAttribute('data-kui-rounded')).toBe(true);
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
