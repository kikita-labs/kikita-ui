import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { afterEach, vi } from 'vitest';

import { KuiTooltipDirective } from './kui-tooltip.directive';

@Component({
  imports: [KuiTooltipDirective],
  template: '<button [kuiTooltip]="\'Save\'" placement="bottom">Save</button>',
})
class TooltipHost {}

@Component({
  imports: [KuiTooltipDirective],
  template: '<button [kuiTooltip]="\'\'">No tooltip</button>',
})
class EmptyTooltipHost {}

@Component({
  imports: [KuiTooltipDirective],
  template: '<button [kuiTooltip]="\'   \'">Whitespace tooltip</button>',
})
class WhitespaceTooltipHost {}

describe('KuiTooltipDirective', () => {
  afterEach(() => vi.useRealTimers());

  it('sets aria-describedby only while the tooltip element exists', () => {
    vi.useFakeTimers();
    const fixture = createFixture(TooltipHost);
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(btn.getAttribute('aria-describedby')).toBeNull();

    btn.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    const describedById = btn.getAttribute('aria-describedby');

    expect(describedById).toMatch(/^kui-tooltip-\d+$/);
    expect(document.getElementById(describedById!)).not.toBeNull();

    btn.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(200);
    fixture.detectChanges();

    expect(btn.getAttribute('aria-describedby')).toBeNull();
  });

  it('renders tooltip in a CDK overlay pane on mouseenter and removes on mouseleave', () => {
    vi.useFakeTimers();
    const fixture = createFixture(TooltipHost);
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    btn.dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();
    const describedById = btn.getAttribute('aria-describedby')!;
    const tip = document.getElementById(describedById);
    expect(tip).not.toBeNull();
    expect(tip?.closest('.cdk-overlay-pane')).not.toBeNull();
    expect(tip?.getAttribute('role')).toBe('tooltip');
    expect(tip?.classList.contains('kui-tooltip')).toBe(true);
    expect(tip?.getAttribute('data-kui-placement')).toBe('bottom');

    btn.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(200);
    expect(document.getElementById(describedById)).toBeNull();
  });

  it('does not append tooltip when text is empty', () => {
    const fixture = createFixture(EmptyTooltipHost);
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    btn.dispatchEvent(new MouseEvent('mouseenter'));
    expect(btn.getAttribute('aria-describedby')).toBeNull();
    expect(document.querySelector('.kui-tooltip')).toBeNull();
  });

  it('does not describe or append tooltip when text is whitespace only', () => {
    const fixture = createFixture(WhitespaceTooltipHost);
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(btn.getAttribute('aria-describedby')).toBeNull();

    btn.dispatchEvent(new MouseEvent('mouseenter'));
    expect(document.querySelector('.kui-tooltip')).toBeNull();
  });

  it('does not create duplicate tooltips on repeated mouseenter', () => {
    vi.useFakeTimers();
    const fixture = createFixture(TooltipHost);
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    btn.dispatchEvent(new MouseEvent('mouseenter'));
    btn.dispatchEvent(new MouseEvent('mouseenter'));

    expect(document.querySelectorAll('.kui-tooltip').length).toBe(1);

    btn.dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(200);
  });
});

function createFixture<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({ imports: [component] });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return fixture;
}
