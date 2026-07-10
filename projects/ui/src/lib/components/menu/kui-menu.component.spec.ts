import { Component, viewChild } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OverlayContainer } from '@angular/cdk/overlay';
import { afterEach } from 'vitest';

import { KuiMenuComponent } from './kui-menu.component';
import { KuiMenuForDirective } from './kui-menu-for.directive';
import { KuiMenuHeaderDirective } from './kui-menu-header.directive';
import { KuiMenuItemDirective } from './kui-menu-item.directive';
import { KuiSeparatorDirective } from '../separator';

@Component({
  imports: [
    KuiMenuComponent,
    KuiMenuForDirective,
    KuiMenuHeaderDirective,
    KuiMenuItemDirective,
    KuiSeparatorDirective,
  ],
  template: `
    <button type="button" [kuiMenuFor]="menu" id="trigger">Actions</button>
    <kui-menu #menu ariaLabel="Project actions">
      <div kuiMenuHeader>Project</div>
      <button type="button" kuiMenuItem>Rename</button>
      <button type="button" kuiMenuItem disabled>Export</button>
      <hr kuiSeparator spacing="xs" />
      <button type="button" kuiMenuItem appearance="destructive">Delete</button>
    </kui-menu>
    <button type="button" id="after">After</button>
  `,
})
class MenuHost {
  readonly menu = viewChild.required(KuiMenuComponent);
}

describe('KuiMenuComponent', () => {
  afterEach(() => {
    TestBed.inject(OverlayContainer).getContainerElement().innerHTML = '';
  });

  it('sets menu trigger semantics', () => {
    const fixture = createFixture();
    const trigger = getTrigger(fixture);

    expect(trigger.getAttribute('aria-haspopup')).toBe('menu');
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
    expect(trigger.getAttribute('aria-controls')).toBeNull();
  });

  it('opens an accessible menu panel and sets aria-controls only while open', () => {
    const fixture = createFixture();
    const trigger = getTrigger(fixture);

    trigger.click();
    fixture.detectChanges();

    expect(trigger.getAttribute('aria-expanded')).toBe('true');
    expect(trigger.getAttribute('aria-controls')).toBe(fixture.componentInstance.menu().panelId);
    expect(getPanel()?.getAttribute('role')).toBe('menu');
    expect(getPanel()?.getAttribute('aria-label')).toBe('Project actions');
  });

  it('renders item, separator, header, destructive, and disabled semantics', () => {
    const fixture = createFixture();

    getTrigger(fixture).click();
    fixture.detectChanges();

    const panel = getPanel()!;
    const items = panel.querySelectorAll('.kui-menu-item');

    expect(panel.querySelector('.kui-menu-group-header')?.getAttribute('role')).toBe(
      'presentation',
    );
    expect(panel.querySelector('.kui-separator')?.tagName).toBe('HR');
    expect(items[0]?.getAttribute('role')).toBe('menuitem');
    expect(items[1]?.getAttribute('aria-disabled')).toBe('true');
    expect(items[2]?.getAttribute('data-kui-appearance')).toBe('destructive');
  });

  it('ArrowDown opens the menu and focuses the first enabled item', () => {
    const fixture = createFixture();
    const trigger = getTrigger(fixture);

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();

    const firstItem = getPanel()?.querySelector('.kui-menu-item') as HTMLElement;
    expect(document.activeElement).toBe(firstItem);
  });

  it('ArrowDown focuses the first enabled item after pointer opening', () => {
    const fixture = createFixture();
    const trigger = getTrigger(fixture);

    trigger.focus();
    trigger.dispatchEvent(new MouseEvent('click', { detail: 1, bubbles: true }));
    fixture.detectChanges();
    expect(document.activeElement).toBe(trigger);

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();

    const firstItem = getPanel()?.querySelector('.kui-menu-item') as HTMLElement;
    expect(document.activeElement).toBe(firstItem);
  });

  it('does not restore focus to the trigger when Tab closes the menu', () => {
    const fixture = createFixture();
    const trigger = getTrigger(fixture);
    const after = fixture.nativeElement.querySelector('#after') as HTMLButtonElement;

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();

    const panel = getPanel()!;
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Tab', bubbles: true }));
    after.focus();
    panel.dispatchEvent(animationEndEvent());
    fixture.detectChanges();

    expect(document.activeElement).toBe(after);
  });

  it('restores focus to the trigger when Escape closes the menu', () => {
    const fixture = createFixture();
    const trigger = getTrigger(fixture);

    trigger.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
    fixture.detectChanges();

    const panel = getPanel()!;
    panel.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    panel.dispatchEvent(animationEndEvent());
    fixture.detectChanges();

    expect(document.activeElement).toBe(trigger);
  });
});

function createFixture(): ComponentFixture<MenuHost> {
  TestBed.configureTestingModule({
    imports: [MenuHost],
  });

  const fixture = TestBed.createComponent(MenuHost);
  fixture.detectChanges();
  return fixture;
}

function getTrigger(fixture: ComponentFixture<MenuHost>): HTMLButtonElement {
  return fixture.nativeElement.querySelector('#trigger') as HTMLButtonElement;
}

function getPanel(): HTMLElement | null {
  return document.querySelector('.kui-menu');
}

function animationEndEvent(): Event {
  const event = new Event('animationend', { bubbles: true });
  Object.defineProperty(event, 'animationName', { value: 'kui-menu-out' });
  return event;
}
