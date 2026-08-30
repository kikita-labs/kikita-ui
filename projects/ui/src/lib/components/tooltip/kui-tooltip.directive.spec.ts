import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { afterEach, vi } from 'vitest';

import { kuiProvideTooltipOptions } from '../../tokens/kui-tooltip-options.token';
import { KuiTooltipDirective } from './kui-tooltip.directive';
import { KuiTooltipTriggerType } from './kui-tooltip-trigger.type';

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

@Component({
  imports: [KuiTooltipDirective],
  template: '<button [kuiTooltip]="\'Info\'" triggerType="auto">Info</button>',
})
class TouchTooltipHost {}

@Component({
  imports: [KuiTooltipDirective],
  providers: [kuiProvideTooltipOptions({ triggerType: KuiTooltipTriggerType.Hover })],
  template: '<button [kuiTooltip]="\'Info\'">Info</button>',
})
class ProviderTooltipHost {}

describe('KuiTooltipDirective', () => {
  afterEach(() => vi.useRealTimers());

  it('sets aria-describedby only while the tooltip element exists', () => {
    vi.useFakeTimers();
    const fixture = createFixture(TooltipHost);
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(btn.getAttribute('aria-describedby')).toBeNull();

    dispatchPointerEvent(btn, 'pointerenter');
    fixture.detectChanges();
    const describedById = btn.getAttribute('aria-describedby');

    expect(describedById).toMatch(/^kui-tooltip-\d+$/);
    expect(document.getElementById(describedById!)).not.toBeNull();

    dispatchPointerEvent(btn, 'pointerleave');
    vi.advanceTimersByTime(200);
    fixture.detectChanges();

    expect(btn.getAttribute('aria-describedby')).toBeNull();
  });

  it('renders tooltip in a CDK overlay pane on pointerenter and removes on pointerleave', () => {
    vi.useFakeTimers();
    const fixture = createFixture(TooltipHost);
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    dispatchPointerEvent(btn, 'pointerenter');
    fixture.detectChanges();
    const describedById = btn.getAttribute('aria-describedby')!;
    const tip = document.getElementById(describedById);
    expect(tip).not.toBeNull();
    expect(tip?.closest('.cdk-overlay-pane')).not.toBeNull();
    expect(tip?.getAttribute('role')).toBe('tooltip');
    expect(tip?.classList.contains('kui-tooltip')).toBe(true);
    expect(tip?.getAttribute('data-kui-placement')).toBe('bottom');

    dispatchPointerEvent(btn, 'pointerleave');
    vi.advanceTimersByTime(200);
    expect(document.getElementById(describedById)).toBeNull();
  });

  it('does not append tooltip when text is empty', () => {
    const fixture = createFixture(EmptyTooltipHost);
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    dispatchPointerEvent(btn, 'pointerenter');
    expect(btn.getAttribute('aria-describedby')).toBeNull();
    expect(document.querySelector('.kui-tooltip')).toBeNull();
  });

  it('does not describe or append tooltip when text is whitespace only', () => {
    const fixture = createFixture(WhitespaceTooltipHost);
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(btn.getAttribute('aria-describedby')).toBeNull();

    dispatchPointerEvent(btn, 'pointerenter');
    expect(document.querySelector('.kui-tooltip')).toBeNull();
  });

  it('does not create duplicate tooltips on repeated pointerenter', () => {
    vi.useFakeTimers();
    const fixture = createFixture(TooltipHost);
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    dispatchPointerEvent(btn, 'pointerenter');
    dispatchPointerEvent(btn, 'pointerenter');

    expect(document.querySelectorAll('.kui-tooltip').length).toBe(1);

    dispatchPointerEvent(btn, 'pointerleave');
    vi.advanceTimersByTime(200);
  });

  it('opens the same tooltip on a touch tap in auto mode and dismisses it outside', () => {
    vi.useFakeTimers();
    const fixture = createFixture(TouchTooltipHost);
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    dispatchPointerEvent(btn, 'pointerdown', 'touch');
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    const tooltip = document.querySelector('.kui-tooltip');
    expect(tooltip?.getAttribute('role')).toBe('tooltip');
    expect(tooltip?.textContent).toBe('Info');

    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    vi.advanceTimersByTime(200);
    expect(document.querySelector('.kui-tooltip')).toBeNull();
  });

  it('uses a scoped provider when no local trigger override is set', () => {
    const fixture = createFixture(ProviderTooltipHost);
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    dispatchPointerEvent(btn, 'pointerdown', 'touch');
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(document.querySelector('.kui-tooltip')).toBeNull();
  });

  it('uses the local trigger override over the provider', () => {
    @Component({
      imports: [KuiTooltipDirective],
      providers: [kuiProvideTooltipOptions({ triggerType: KuiTooltipTriggerType.None })],
      template: '<button [kuiTooltip]="\'Info\'" triggerType="click">Info</button>',
    })
    class LocalTooltipHost {}

    const fixture = createFixture(LocalTooltipHost);
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));

    expect(document.querySelector('.kui-tooltip')).not.toBeNull();
    fixture.destroy();
  });
});

function createFixture<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({ imports: [component] });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return fixture;
}

function dispatchPointerEvent(element: Element, type: string, pointerType?: string): void {
  const event = new Event(type, { bubbles: true }) as PointerEvent;
  if (pointerType) {
    Object.defineProperty(event, 'pointerType', { value: pointerType });
  }
  element.dispatchEvent(event);
}
