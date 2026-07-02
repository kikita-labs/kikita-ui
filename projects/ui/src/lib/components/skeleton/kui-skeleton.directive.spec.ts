import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KuiSkeletonDirective } from './kui-skeleton.directive';

@Component({
  imports: [KuiSkeletonDirective],
  template: '<span kuiSkeleton shape="circle" animation="pulse"></span>',
})
class SkeletonHost {}

describe('KuiSkeletonDirective', () => {
  it('adds skeleton host attributes and hides the placeholder from assistive tech', () => {
    const fixture = createFixture(SkeletonHost);

    const skeleton = fixture.nativeElement.querySelector('span') as HTMLSpanElement;

    expect(skeleton.classList.contains('kui-skeleton')).toBe(true);
    expect(skeleton.getAttribute('data-kui-shape')).toBe('circle');
    expect(skeleton.getAttribute('data-kui-animation')).toBe('pulse');
    expect(skeleton.getAttribute('aria-hidden')).toBe('true');
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
