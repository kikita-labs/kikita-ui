import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { KuiButtonDirective } from './kui-button.directive';

@Component({
  imports: [KuiButtonDirective],
  template: '<button kuiButton shape="soft" appearance="success" size="sm" wrap>Save</button>',
})
class ButtonHost {}

@Component({
  imports: [KuiButtonDirective],
  template: '<a kuiButton disabled href="/blocked">Blocked</a>',
})
class DisabledAnchorHost {}

@Component({
  imports: [KuiButtonDirective],
  template: '<button kuiButton size="lg" [loading]="true">Save</button>',
})
class LoadingButtonHost {}

describe('KuiButtonDirective', () => {
  it('adds button host attributes for appearance and size', () => {
    const fixture = createFixture(ButtonHost);

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(button.classList.contains('kui-button')).toBe(true);
    expect(button.getAttribute('data-kui-shape')).toBe('soft');
    expect(button.getAttribute('data-kui-appearance')).toBe('success');
    expect(button.getAttribute('data-kui-size')).toBe('sm');
    expect(button.hasAttribute('data-kui-wrap')).toBe(true);
  });

  it('marks disabled anchors as aria-disabled and prevents click navigation', () => {
    const fixture = createFixture(DisabledAnchorHost);

    const anchor = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const allowed = anchor.dispatchEvent(event);

    expect(anchor.getAttribute('aria-disabled')).toBe('true');
    expect(anchor.getAttribute('tabindex')).toBe('-1');
    expect(anchor.hasAttribute('disabled')).toBe(false);
    expect(allowed).toBe(false);
  });

  it('renders a loader, marks the button busy and blocks clicks while loading', () => {
    const fixture = createFixture(LoadingButtonHost);

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    const loader = button.querySelector('.kui-loader') as HTMLElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const allowed = button.dispatchEvent(event);

    expect(button.getAttribute('aria-busy')).toBe('true');
    expect(button.getAttribute('disabled')).toBe('');
    expect(loader).not.toBeNull();
    expect(loader.getAttribute('data-kui-size')).toBe('lg');
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
