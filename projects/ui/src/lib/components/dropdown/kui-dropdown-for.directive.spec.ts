import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, viewChild } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { afterEach } from 'vitest';

import { KuiDropdownComponent } from './kui-dropdown.component';
import { KuiDropdownForDirective } from './kui-dropdown-for.directive';
import { KuiOptionDirective } from './kui-option.directive';

@Component({
  imports: [KuiDropdownComponent, KuiDropdownForDirective, KuiOptionDirective],
  template: `
    <button type="button" [kuiDropdownFor]="menu">Actions</button>
    <kui-dropdown #menu>
      <button type="button" kuiOption value="edit">Edit</button>
    </kui-dropdown>
  `,
})
class DropdownForHost {
  readonly menu = viewChild.required(KuiDropdownComponent);
}

describe('KuiDropdownForDirective', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().innerHTML = '';
  });

  function createFixture(): ComponentFixture<DropdownForHost> {
    TestBed.configureTestingModule({ imports: [DropdownForHost] });
    const fixture = TestBed.createComponent(DropdownForHost);
    fixture.detectChanges();
    return fixture;
  }

  function trigger(fixture: ComponentFixture<DropdownForHost>): HTMLButtonElement {
    return fixture.nativeElement.querySelector('button') as HTMLButtonElement;
  }

  it('exposes listbox trigger semantics', () => {
    const fixture = createFixture();

    expect(trigger(fixture).getAttribute('aria-haspopup')).toBe('listbox');
    expect(trigger(fixture).getAttribute('aria-expanded')).toBe('false');
  });

  it('sets aria-controls only while the dropdown panel is open', () => {
    const fixture = createFixture();
    const button = trigger(fixture);

    expect(button.getAttribute('aria-controls')).toBeNull();

    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(button.getAttribute('aria-controls')).toBe(
      fixture.componentInstance.menu().getPanelId(),
    );
    expect(document.getElementById(button.getAttribute('aria-controls')!)).not.toBeNull();
  });
});
