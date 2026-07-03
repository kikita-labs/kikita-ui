import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { describe, expect, it } from 'vitest';

import { KuiInputGroupDirective } from './kui-input-group.directive';

@Component({
  imports: [KuiInputGroupDirective],
  template: `
    <div class="kui-input-group">
      <span class="kui-field-affix">https://</span>
      <input class="kui-input" value="kikita" />
      <button class="kui-field-action" type="button">Clear</button>
    </div>
  `,
})
class InputGroupHost {}

@Component({
  imports: [KuiInputGroupDirective],
  template: `
    <div class="kui-input-group">
      <span class="kui-field-affix">https://</span>
      <input class="kui-input" value="kikita" disabled />
    </div>
  `,
})
class DisabledInputGroupHost {}

describe('KuiInputGroupDirective', () => {
  it('focuses the native control when non-interactive chrome is clicked', () => {
    const fixture = createFixture(InputGroupHost);
    const affix = fixture.nativeElement.querySelector('.kui-field-affix') as HTMLElement;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    affix.click();

    expect(document.activeElement).toBe(input);
  });

  it('does not steal clicks from action buttons', () => {
    const fixture = createFixture(InputGroupHost);
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    button.click();

    expect(document.activeElement).not.toBe(input);
  });

  it('does not focus disabled controls', () => {
    const fixture = createFixture(DisabledInputGroupHost);
    const affix = fixture.nativeElement.querySelector('.kui-field-affix') as HTMLElement;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;

    affix.click();

    expect(document.activeElement).not.toBe(input);
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
