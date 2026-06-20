import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KuiBadgeDirective } from './kui-badge.directive';

@Component({
  imports: [KuiBadgeDirective],
  template: '<span kuiBadge appearance="success" size="sm">Ready</span>',
})
class BadgeHost {}

describe('KuiBadgeDirective', () => {
  it('adds badge host attributes for appearance and size', () => {
    const fixture = createFixture(BadgeHost);

    const badge = fixture.nativeElement.querySelector('span') as HTMLSpanElement;

    expect(badge.classList.contains('kui-badge')).toBe(true);
    expect(badge.getAttribute('data-kui-appearance')).toBe('success');
    expect(badge.getAttribute('data-kui-size')).toBe('sm');
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
