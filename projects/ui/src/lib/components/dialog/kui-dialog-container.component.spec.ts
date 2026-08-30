import { ComponentPortal } from '@angular/cdk/portal';
import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { describe, expect, it } from 'vitest';

import { KuiDialogContainerComponent } from './kui-dialog-container.component';

@Component({
  template: `
    <div class="kui-dialog-header">
      <h2 class="kui-dialog-title">Legacy dialog</h2>
      <button class="kui-dialog-close" type="button" aria-label="Close">manual</button>
    </div>
  `,
})
class ManualCloseContent {}

@Component({
  template: `<div class="kui-dialog-header"><h2 class="kui-dialog-title">Plain</h2></div>`,
})
class PlainContent {}

describe('KuiDialogContainerComponent', () => {
  function create(): ComponentFixture<KuiDialogContainerComponent> {
    return TestBed.createComponent(KuiDialogContainerComponent);
  }

  it('renders the close button by default', () => {
    const fixture = create();
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('.kui-dialog-close');
    expect(button).not.toBeNull();
    expect(button.getAttribute('aria-label')).toBe('Close');
  });

  it('hides the close button when _closable is false', () => {
    const fixture = create();
    fixture.componentInstance._closable.set(false);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.kui-dialog-close')).toBeNull();
  });

  it('starts the close animation when the close button is clicked', () => {
    const fixture = create();
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('.kui-dialog-close');
    button.click();
    fixture.detectChanges();

    const panel = fixture.nativeElement.querySelector('.kui-dialog');
    expect(panel.classList.contains('kui-dialog--closing')).toBe(true);
  });

  it('does not close when a pointer starts inside the panel and ends on the backdrop', () => {
    const fixture = create();
    fixture.detectChanges();

    const panel: HTMLElement = fixture.nativeElement.querySelector('.kui-dialog');
    const backdrop: HTMLElement = fixture.nativeElement.querySelector('.kui-dialog-backdrop');

    panel.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(panel.classList.contains('kui-dialog--closing')).toBe(false);
  });

  it('closes when a pointer starts on the backdrop', () => {
    const fixture = create();
    fixture.detectChanges();

    const panel: HTMLElement = fixture.nativeElement.querySelector('.kui-dialog');
    const backdrop: HTMLElement = fixture.nativeElement.querySelector('.kui-dialog-backdrop');

    backdrop.dispatchEvent(new Event('pointerdown', { bubbles: true }));
    backdrop.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(panel.classList.contains('kui-dialog--closing')).toBe(true);
  });

  it('toggles the close button on a later detectChanges call', () => {
    const fixture = create();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.kui-dialog-close').length).toBe(1);

    fixture.componentInstance._closable.set(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('.kui-dialog-close').length).toBe(0);
  });

  it('still renders the auto close button for plain projected content', () => {
    const fixture = create();
    fixture.detectChanges();

    fixture.componentInstance.attachContent(new ComponentPortal(PlainContent));
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.kui-dialog-close');
    expect(buttons.length).toBe(1);
    expect(buttons[0].getAttribute('aria-label')).toBe('Close');
  });

  it('skips the auto close button when projected content already has one', () => {
    const fixture = create();
    fixture.detectChanges();

    fixture.componentInstance.attachContent(new ComponentPortal(ManualCloseContent));
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('.kui-dialog-close');
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent).toContain('manual');
  });
});
