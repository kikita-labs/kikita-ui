import { OverlayContainer } from '@angular/cdk/overlay';
import { Component, signal, viewChild } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { afterEach } from 'vitest';

import { KuiDropdownComponent } from './kui-dropdown.component';
import { KuiDropdownForDirective } from './kui-dropdown-for.directive';
import { KuiOptionDirective } from './kui-option.directive';

@Component({
  imports: [KuiDropdownComponent, KuiDropdownForDirective, KuiOptionDirective],
  template: `
    <button id="trigger" type="button" [kuiDropdownFor]="dropdown">Open</button>
    <kui-dropdown #dropdown [(open)]="open">
      <div kuiOption value="first">First</div>
      <div kuiOption value="second">Second</div>
    </kui-dropdown>
  `,
})
class ControlledDropdownHost {
  readonly open = signal(false);
  readonly dropdown = viewChild.required(KuiDropdownComponent);
}

describe('KuiDropdownComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().innerHTML = '';
  });

  it('opens from an externally controlled model value', async () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;

    host.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(host.dropdown().isOpen()).toBe(true);
    expect(document.querySelector('.kui-dropdown')).not.toBeNull();
  });

  it('synchronizes the model when the imperative API opens the panel', () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;

    host.dropdown().open();
    fixture.detectChanges();

    expect(host.open()).toBe(true);
    expect(host.dropdown().isOpen()).toBe(true);
  });

  it('synchronizes the model when the imperative API starts closing the panel', () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;

    host.dropdown().open();
    fixture.detectChanges();
    host.dropdown().close();
    fixture.detectChanges();

    expect(host.open()).toBe(false);
    expect(document.querySelector('.kui-dropdown--closing')).not.toBeNull();
  });

  it('starts the close animation when the controlled model becomes false', async () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;

    host.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    host.open.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(document.querySelector('.kui-dropdown--closing')).not.toBeNull();
  });

  it('closes after keyboard option selection in standalone mode', async () => {
    const fixture = createFixture();
    const host = fixture.componentInstance;

    host.open.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const option = document.querySelector<HTMLElement>('.kui-listbox-option');
    expect(option).not.toBeNull();

    option!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
    fixture.detectChanges();

    expect(host.open()).toBe(false);
    expect(document.querySelector('.kui-dropdown--closing')).not.toBeNull();
  });
});

function createFixture(): ComponentFixture<ControlledDropdownHost> {
  TestBed.configureTestingModule({ imports: [ControlledDropdownHost] });
  const fixture = TestBed.createComponent(ControlledDropdownHost);
  fixture.detectChanges();
  return fixture;
}
