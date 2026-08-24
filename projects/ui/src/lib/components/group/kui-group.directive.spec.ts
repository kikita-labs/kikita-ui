import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiGroupDirective } from './kui-group.directive';

@Component({
  imports: [KuiGroupDirective],
  template: '<div kuiGroup orientation="vertical" size="sm" collapsed></div>',
})
class GroupHost {}

@Component({
  imports: [KuiGroupDirective],
  template: `
    <div kuiGroup>
      <button type="button">Action</button>
      <button type="button">Action</button>
    </div>
  `,
})
class NoFieldHost {}

@Component({
  imports: [KuiGroupDirective],
  template: `
    <div kuiGroup>
      <div class="kui-field"></div>
      <div class="kui-field"></div>
    </div>
  `,
})
class TwoFieldsHost {}

@Component({
  imports: [KuiGroupDirective],
  template: `
    <div kuiGroup>
      <button type="button">Action</button>
      <div class="kui-field"></div>
      <button type="button">Action</button>
    </div>
  `,
})
class FieldBetweenButtonsHost {}

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

  it('leaves grid-template-columns unset without a kui-field child', () => {
    const fixture = createFixture(NoFieldHost);

    const group = fixture.nativeElement.querySelector('[kuiGroup]') as HTMLDivElement;

    expect(group.style.gridTemplateColumns).toBe('');
  });

  it('grows every kui-field column evenly regardless of count', () => {
    const fixture = createFixture(TwoFieldsHost);

    const group = fixture.nativeElement.querySelector('[kuiGroup]') as HTMLDivElement;

    expect(group.style.gridTemplateColumns).toBe('minmax(0, 1fr) minmax(0, 1fr)');
  });

  it('keeps buttons before a field auto-sized and stops the explicit list at the last field', () => {
    const fixture = createFixture(FieldBetweenButtonsHost);

    const group = fixture.nativeElement.querySelector('[kuiGroup]') as HTMLDivElement;

    expect(group.style.gridTemplateColumns).toBe('auto minmax(0, 1fr)');
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
