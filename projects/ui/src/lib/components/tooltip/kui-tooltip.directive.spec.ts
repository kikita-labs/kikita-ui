import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

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

describe('KuiTooltipDirective', () => {
  it('sets aria-describedby on the host element', () => {
    const fixture = createFixture(TooltipHost);

    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(btn.getAttribute('aria-describedby')).toMatch(/^kui-tooltip-\d+$/);
  });

  it('appends tooltip element to body on show and removes on hide', () => {
    const fixture = createFixture(TooltipHost);

    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const directive = fixture.debugElement.children[0].injector.get(KuiTooltipDirective);
    const describedById = btn.getAttribute('aria-describedby')!;

    expect(document.getElementById(describedById)).toBeNull();

    directive.show();
    const tip = document.getElementById(describedById);
    expect(tip).not.toBeNull();
    expect(tip?.getAttribute('role')).toBe('tooltip');
    expect(tip?.classList.contains('kui-tooltip')).toBe(true);
    expect(tip?.getAttribute('data-kui-placement')).toBe('bottom');

    directive.hide();
    expect(document.getElementById(describedById)).toBeNull();
  });

  it('does not append tooltip when text is empty', () => {
    const fixture = createFixture(EmptyTooltipHost);

    const directive = fixture.debugElement.children[0].injector.get(KuiTooltipDirective);
    const btn = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const describedById = btn.getAttribute('aria-describedby')!;

    directive.show();
    expect(document.getElementById(describedById)).toBeNull();
  });

  it('does not create duplicate tooltips on repeated show calls', () => {
    const fixture = createFixture(TooltipHost);

    const directive = fixture.debugElement.children[0].injector.get(KuiTooltipDirective);

    directive.show();
    directive.show();

    expect(document.querySelectorAll('.kui-tooltip').length).toBe(1);

    directive.hide();
  });
});

function createFixture<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({ imports: [component] });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return fixture;
}
