import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiLoaderDirective } from './kui-loader.directive';

@Component({
  imports: [KuiLoaderDirective],
  template: '<span kuiLoader size="lg" label="Saving"></span>',
})
class LoaderHost {}

describe('KuiLoaderDirective', () => {
  it('adds loader host attributes for size and accessibility', () => {
    const fixture = createFixture(LoaderHost);

    const loader = fixture.nativeElement.querySelector('span') as HTMLSpanElement;

    expect(loader.classList.contains('kui-loader')).toBe(true);
    expect(loader.getAttribute('data-kui-size')).toBe('lg');
    expect(loader.getAttribute('role')).toBe('status');
    expect(loader.getAttribute('aria-live')).toBe('polite');
    expect(loader.getAttribute('aria-label')).toBe('Saving');
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
