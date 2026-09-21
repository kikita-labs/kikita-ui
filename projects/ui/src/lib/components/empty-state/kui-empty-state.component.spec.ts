import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiEmptyStateComponent } from './kui-empty-state.component';
import { KuiEmptyStateActionsDirective } from './kui-empty-state-actions.directive';
import { KuiEmptyStateIconDirective } from './kui-empty-state-icon.directive';

@Component({
  imports: [KuiEmptyStateActionsDirective, KuiEmptyStateComponent, KuiEmptyStateIconDirective],
  template: `
    <kui-empty-state
      heading="No results"
      description="Change filters"
      context="no-results"
      size="sm"
    >
      <span kuiEmptyStateIcon>icon</span>
      <button kuiEmptyStateActions type="button">Reset</button>
    </kui-empty-state>
  `,
})
class EmptyStateHost {}

@Component({
  imports: [KuiEmptyStateComponent],
  template: `<kui-empty-state description="Change filters" />`,
})
class DescriptionOnlyEmptyStateHost {}

describe('KuiEmptyStateComponent', () => {
  it('renders context, size, title, description, and projected slots', () => {
    const fixture = createFixture(EmptyStateHost);

    const empty = fixture.nativeElement.querySelector('kui-empty-state') as HTMLElement;
    const icon = fixture.nativeElement.querySelector('[kuiemptystateicon]') as HTMLElement;
    const actions = fixture.nativeElement.querySelector('[kuiemptystateactions]') as HTMLElement;

    expect(empty.classList.contains('kui-empty')).toBe(true);
    expect(empty.getAttribute('data-kui-context')).toBe('no-results');
    expect(empty.getAttribute('data-kui-size')).toBe('sm');
    expect(empty.textContent).toContain('No results');
    expect(empty.textContent).toContain('Change filters');
    expect(icon.classList.contains('kui-empty__icon')).toBe(true);
    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(actions.classList.contains('kui-empty__actions')).toBe(true);
  });

  it('supports a description without a heading', () => {
    const fixture = createFixture(DescriptionOnlyEmptyStateHost);

    expect(fixture.nativeElement.querySelector('.kui-empty__title')).toBeNull();
    expect(fixture.nativeElement.querySelector('.kui-empty__description')?.textContent).toContain(
      'Change filters',
    );
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
