import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KuiIconButtonDirective } from './kui-icon-button.directive';

@Component({
  imports: [KuiIconButtonDirective],
  template:
    '<button kuiIconButton shape="soft" appearance="warning" size="xs" aria-label="Settings"></button>',
})
class IconButtonHost {}

@Component({
  imports: [KuiIconButtonDirective],
  template: '<a kuiIconButton disabled href="/blocked" aria-label="Blocked"></a>',
})
class DisabledIconAnchorHost {}

describe('KuiIconButtonDirective', () => {
  it('adds icon button host attributes for appearance and size', () => {
    const fixture = createFixture(IconButtonHost);

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.classList.contains('kui-icon-button')).toBe(true);
    expect(button.getAttribute('data-kui-shape')).toBe('soft');
    expect(button.getAttribute('data-kui-appearance')).toBe('warning');
    expect(button.getAttribute('data-kui-size')).toBe('xs');
    expect(button.getAttribute('aria-label')).toBe('Settings');
  });

  it('marks disabled anchor icon buttons as aria-disabled and prevents clicks', () => {
    const fixture = createFixture(DisabledIconAnchorHost);

    const anchor = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const allowed = anchor.dispatchEvent(event);

    expect(anchor.getAttribute('aria-disabled')).toBe('true');
    expect(anchor.getAttribute('tabindex')).toBe('-1');
    expect(anchor.hasAttribute('disabled')).toBe(false);
    expect(allowed).toBe(false);
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
