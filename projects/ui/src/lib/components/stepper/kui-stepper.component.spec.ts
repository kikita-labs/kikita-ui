import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { KuiStepComponent } from './kui-step.component';
import { KuiStepperComponent } from './kui-stepper.component';

@Component({
  imports: [KuiStepperComponent, KuiStepComponent],
  template: `
    <kui-stepper [(currentIndex)]="current" [linear]="linear()" aria-label="Progress">
      <kui-step label="A" />
      <kui-step label="B" [hasError]="errorB()" />
      <kui-step label="C" />
    </kui-stepper>
  `,
})
class StepperHost {
  readonly current = signal(1);
  readonly linear = signal(true);
  readonly errorB = signal(false);
}

describe('KuiStepperComponent', () => {
  let fixture: ComponentFixture<StepperHost>;
  let host: StepperHost;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [StepperHost] });
    fixture = TestBed.createComponent(StepperHost);
    host = fixture.componentInstance;
    fixture.detectChanges();
  });

  function steps(): HTMLElement[] {
    return fixture.debugElement.queryAll(By.css('kui-step')).map((de) => de.nativeElement);
  }

  it('renders role=list and role=listitem', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('[role="list"]')).not.toBeNull();
    expect(el.querySelectorAll('[role="listitem"]').length).toBe(3);
  });

  it('derives done/current/upcoming from currentIndex', () => {
    const items = steps();
    expect(items[0].getAttribute('data-kui-state')).toBe('done');
    expect(items[1].getAttribute('data-kui-state')).toBe('current');
    expect(items[2].getAttribute('data-kui-state')).toBe('upcoming');
    expect(items[1].getAttribute('aria-current')).toBe('step');
  });

  it('renders a clickable button on done steps only', () => {
    const items = steps();
    expect(items[0].querySelector('button.kui-step-circle')).not.toBeNull();
    expect(items[1].querySelector('button.kui-step-circle')).toBeNull();
    expect(items[2].querySelector('button.kui-step-circle')).toBeNull();
  });

  it('clicking a done step circle navigates back', () => {
    const button = steps()[0].querySelector('button.kui-step-circle') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();
    expect(host.current()).toBe(0);
  });

  it('does not allow jumping to an upcoming step when linear', () => {
    host.current.set(0);
    fixture.detectChanges();
    expect(steps()[2].querySelector('button.kui-step-circle')).toBeNull();
  });

  it('allows jumping to an upcoming step when not linear', () => {
    host.current.set(0);
    host.linear.set(false);
    fixture.detectChanges();
    const button = steps()[2].querySelector('button.kui-step-circle') as HTMLButtonElement;
    expect(button).not.toBeNull();
    button.click();
    fixture.detectChanges();
    expect(host.current()).toBe(2);
  });

  it('marks a step with hasError as error and disables steps after it', () => {
    host.errorB.set(true);
    fixture.detectChanges();
    const items = steps();
    expect(items[1].getAttribute('data-kui-state')).toBe('error');
    expect(items[2].getAttribute('data-kui-state')).toBe('disabled');
  });
});
