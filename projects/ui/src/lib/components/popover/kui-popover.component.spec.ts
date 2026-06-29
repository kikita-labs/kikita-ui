import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { afterEach, vi } from 'vitest';

import { KuiPopoverComponent } from './kui-popover.component';
import { KuiPopoverForDirective } from './kui-popover-for.directive';

// Host fixtures

@Component({
  imports: [KuiPopoverComponent, KuiPopoverForDirective],
  template: `
    <button [kuiPopoverFor]="pop" id="trigger">Open</button>
    <kui-popover #pop placement="bottom">
      <p>Content</p>
    </kui-popover>
  `,
})
class ClickHost {
  readonly pop = viewChild.required(KuiPopoverComponent);
}

@Component({
  imports: [KuiPopoverComponent, KuiPopoverForDirective],
  template: `
    <button [kuiPopoverFor]="pop" id="trigger">Hover me</button>
    <kui-popover #pop triggerType="hover" [hoverDelay]="50">
      <p>Hover content</p>
    </kui-popover>
  `,
})
class HoverHost {
  readonly pop = viewChild.required(KuiPopoverComponent);
}

@Component({
  imports: [KuiPopoverComponent, KuiPopoverForDirective],
  template: `
    <button [kuiPopoverFor]="pop" id="trigger">Open</button>
    <kui-popover #pop [arrow]="true">
      <p>Arrow content</p>
    </kui-popover>
  `,
})
class ArrowHost {
  readonly pop = viewChild.required(KuiPopoverComponent);
}

@Component({
  imports: [KuiPopoverComponent, KuiPopoverForDirective],
  template: `
    <button [kuiPopoverFor]="pop" id="trigger">Open</button>
    <kui-popover #pop ariaLabel="Account actions">
      <p>Content</p>
    </kui-popover>
  `,
})
class LabelHost {
  readonly pop = viewChild.required(KuiPopoverComponent);
}

// Helpers

function createFixture<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({ imports: [component] });
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  return fixture;
}

function getTrigger(fixture: ComponentFixture<unknown>): HTMLButtonElement {
  return fixture.nativeElement.querySelector('#trigger') as HTMLButtonElement;
}

function getPanel(): HTMLElement | null {
  return document.querySelector('.kui-popover');
}

function cleanOverlay(): void {
  TestBed.inject(OverlayContainer).getContainerElement().innerHTML = '';
}

// Tests

describe('KuiPopoverForDirective - aria attributes', () => {
  afterEach(() => {
    vi.useRealTimers();
    cleanOverlay();
  });

  it('sets aria-haspopup=dialog on trigger', () => {
    const fixture = createFixture(ClickHost);
    expect(getTrigger(fixture).getAttribute('aria-haspopup')).toBe('dialog');
  });

  it('sets aria-expanded=false initially', () => {
    const fixture = createFixture(ClickHost);
    expect(getTrigger(fixture).getAttribute('aria-expanded')).toBe('false');
  });

  it('sets aria-expanded=true after trigger click', () => {
    const fixture = createFixture(ClickHost);
    const trigger = getTrigger(fixture);

    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });
});

describe('KuiPopoverComponent - click trigger', () => {
  afterEach(() => {
    vi.useRealTimers();
    cleanOverlay();
  });

  it('openFor() attaches panel with role=dialog and open=true', () => {
    const fixture = createFixture(ClickHost);
    const pop = fixture.componentInstance.pop();

    pop.openFor(getTrigger(fixture));
    fixture.detectChanges();

    expect(pop.open()).toBe(true);
    expect(getPanel()).not.toBeNull();
    expect(getPanel()?.getAttribute('role')).toBe('dialog');
  });

  it('sets a default accessible name on the dialog panel', () => {
    const fixture = createFixture(ClickHost);

    getTrigger(fixture).click();
    fixture.detectChanges();

    expect(getPanel()?.getAttribute('aria-label')).toBe('Popover');
  });

  it('supports a custom accessible name for the dialog panel', () => {
    const fixture = createFixture(LabelHost);

    getTrigger(fixture).click();
    fixture.detectChanges();

    expect(getPanel()?.getAttribute('aria-label')).toBe('Account actions');
  });

  it('click on trigger opens popover', () => {
    const fixture = createFixture(ClickHost);

    getTrigger(fixture).click();
    fixture.detectChanges();

    expect(fixture.componentInstance.pop().open()).toBe(true);
    expect(getPanel()).not.toBeNull();
  });

  it('second click on trigger starts closing animation', () => {
    const fixture = createFixture(ClickHost);
    const pop = fixture.componentInstance.pop();

    getTrigger(fixture).click();
    fixture.detectChanges();

    getTrigger(fixture).click();
    fixture.detectChanges();

    expect(getPanel()?.classList.contains('kui-popover--out')).toBe(true);
  });

  it('sets data-side from placement input', () => {
    const fixture = createFixture(ClickHost);

    getTrigger(fixture).click();
    fixture.detectChanges();

    expect(getPanel()?.getAttribute('data-side')).toBe('bottom');
  });

  it('sets data-align from align input', () => {
    const fixture = createFixture(ClickHost);

    getTrigger(fixture).click();
    fixture.detectChanges();

    expect(getPanel()?.getAttribute('data-align')).toBe('center');
  });
});

describe('KuiPopoverComponent - hover trigger', () => {
  afterEach(() => {
    vi.useRealTimers();
    cleanOverlay();
  });

  it('mouseenter on trigger opens popover', () => {
    const fixture = createFixture(HoverHost);

    getTrigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    expect(fixture.componentInstance.pop().open()).toBe(true);
    expect(getPanel()).not.toBeNull();
  });

  it('mouseleave on trigger schedules close after hoverDelay', () => {
    vi.useFakeTimers();
    const fixture = createFixture(HoverHost);
    const pop = fixture.componentInstance.pop();

    getTrigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    getTrigger(fixture).dispatchEvent(new MouseEvent('mouseleave'));
    vi.advanceTimersByTime(49);
    fixture.detectChanges();
    expect(getPanel()?.classList.contains('kui-popover--out')).toBeFalsy();

    vi.advanceTimersByTime(10);
    fixture.detectChanges();
    expect(getPanel()?.classList.contains('kui-popover--out')).toBe(true);
  });

  it('cancelClose() aborts a scheduled close', () => {
    vi.useFakeTimers();
    const fixture = createFixture(HoverHost);
    const pop = fixture.componentInstance.pop();

    getTrigger(fixture).dispatchEvent(new MouseEvent('mouseenter'));
    fixture.detectChanges();

    getTrigger(fixture).dispatchEvent(new MouseEvent('mouseleave'));
    pop.cancelClose();
    vi.advanceTimersByTime(500);
    fixture.detectChanges();

    expect(pop.open()).toBe(true);
    expect(getPanel()?.classList.contains('kui-popover--out')).toBeFalsy();
  });
});

describe('KuiPopoverComponent - arrow', () => {
  afterEach(() => {
    vi.useRealTimers();
    cleanOverlay();
  });

  it('renders arrow element when arrow=true', () => {
    const fixture = createFixture(ArrowHost);

    getTrigger(fixture).click();
    fixture.detectChanges();

    expect(document.querySelector('.kui-popover-arrow')).not.toBeNull();
  });

  it('does not render arrow element when arrow=false (default)', () => {
    const fixture = createFixture(ClickHost);

    getTrigger(fixture).click();
    fixture.detectChanges();

    expect(document.querySelector('.kui-popover-arrow')).toBeNull();
  });
});
