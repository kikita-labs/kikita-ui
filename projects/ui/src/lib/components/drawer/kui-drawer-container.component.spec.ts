import { ComponentPortal } from '@angular/cdk/portal';
import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { describe, expect, it } from 'vitest';

import { KuiDrawerContainerComponent } from './kui-drawer-container.component';

@Component({
  template: `
    <div class="kui-drawer-header">
      <h2 class="kui-drawer-title">Legacy drawer</h2>
      <button class="kui-drawer-close" type="button" aria-label="Close">manual</button>
    </div>
  `,
})
class ManualCloseContent {}

@Component({
  template: `<div class="kui-drawer-header"><h2 class="kui-drawer-title">Plain</h2></div>`,
})
class PlainContent {}

describe('KuiDrawerContainerComponent', () => {
  function create(): ComponentFixture<KuiDrawerContainerComponent> {
    return TestBed.createComponent(KuiDrawerContainerComponent);
  }

  it('renders the close button by default', () => {
    const fixture = create();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.kui-drawer-close');
    expect(button).not.toBeNull();
    expect(button.getAttribute('aria-label')).toBe('Close');
  });

  it('hides the close button when _closable is false', () => {
    const fixture = create();
    fixture.componentInstance._closable.set(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.kui-drawer-close')).toBeNull();
  });

  it('starts the close animation when the close button is clicked', () => {
    const fixture = create();
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.kui-drawer-close');
    button.click();
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.kui-drawer');
    expect(panel.classList.contains('kui-drawer--closing')).toBe(true);
  });

  it('toggles the close button on a later detectChanges call', () => {
    const fixture = create();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.kui-drawer-close').length).toBe(1);

    fixture.componentInstance._closable.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.kui-drawer-close').length).toBe(0);
  });

  it('still renders the auto close button for plain projected content', () => {
    const fixture = create();
    fixture.detectChanges();

    fixture.componentInstance.attachContent(new ComponentPortal(PlainContent));
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.kui-drawer-close');
    expect(buttons.length).toBe(1);
    expect(buttons[0].getAttribute('aria-label')).toBe('Close');
  });

  it('skips the auto close button when projected content already has one', () => {
    const fixture = create();
    fixture.detectChanges();

    fixture.componentInstance.attachContent(new ComponentPortal(ManualCloseContent));
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.kui-drawer-close');
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent).toContain('manual');
  });
});
