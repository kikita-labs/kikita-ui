import { Component, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { KuiAutoFocus } from './kui-auto-focus.directive';

@Component({
  imports: [KuiAutoFocus],
  template: `
    <input id="other" />
    <input id="target" [kuiAutoFocus]="enabled()" />
  `,
})
class ToggleHost {
  readonly enabled = signal(false);
}

@Component({
  imports: [KuiAutoFocus],
  template: `<input id="target" kuiAutoFocus />`,
})
class AttributeHost {}

@Component({
  imports: [KuiAutoFocus],
  template: `
    <input id="other" />
    <input id="target" kuiAutoFocus />
  `,
})
class OtherFocusedHost {}

@Component({
  imports: [KuiAutoFocus],
  template: `
    <div id="wrapper" kuiAutoFocus>
      <input id="first" disabled />
      <input id="second" tabindex="-1" />
      <input id="third" />
    </div>
  `,
})
class WrapperHost {}

@Component({
  imports: [KuiAutoFocus],
  template: `<input id="target" kuiAutoFocus disabled />`,
})
class DisabledHost {}

@Component({
  imports: [KuiAutoFocus],
  template: ` <div inert><input id="target" kuiAutoFocus /></div> `,
})
class InertHost {}

@Component({
  imports: [KuiAutoFocus],
  template: `
    <div role="dialog">
      <input id="inside" />
      <input id="target" kuiAutoFocus />
    </div>
  `,
})
class DialogHost {}

async function render<T>(component: new () => T): Promise<ComponentFixture<T>> {
  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();
  await fixture.whenStable();
  return fixture;
}

function byId(fixture: ComponentFixture<unknown>, id: string): HTMLElement {
  return fixture.nativeElement.querySelector(`#${id}`) as HTMLElement;
}

describe('KuiAutoFocus', () => {
  afterEach(() => {
    (document.activeElement as HTMLElement | null)?.blur();
  });

  it('focuses the host after the first render when the attribute is present', async () => {
    const fixture = await render(AttributeHost);

    expect(document.activeElement).toBe(byId(fixture, 'target'));
  });

  it('does not focus while the value is false', async () => {
    const fixture = await render(ToggleHost);

    expect(document.activeElement).not.toBe(byId(fixture, 'target'));
  });

  it('focuses again on every false to true change, even from another focused element', async () => {
    const fixture = await render(ToggleHost);
    byId(fixture, 'other').focus();

    fixture.componentInstance.enabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(byId(fixture, 'target'));

    byId(fixture, 'other').focus();
    fixture.componentInstance.enabled.set(false);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.componentInstance.enabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();
    expect(document.activeElement).toBe(byId(fixture, 'target'));
  });

  it('does not pull focus back while the value stays true', async () => {
    const fixture = await render(ToggleHost);
    fixture.componentInstance.enabled.set(true);
    fixture.detectChanges();
    await fixture.whenStable();

    byId(fixture, 'other').focus();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(document.activeElement).toBe(byId(fixture, 'other'));
  });

  it('never focuses when the directive is destroyed before the render', () => {
    const fixture = TestBed.createComponent(AttributeHost);
    fixture.detectChanges();
    const target = byId(fixture, 'target');

    fixture.destroy();

    expect(document.activeElement).not.toBe(target);
  });

  it('yields on first render when the user already focused another element', async () => {
    const other = document.createElement('input');
    document.body.appendChild(other);
    other.focus();

    const fixture = await render(OtherFocusedHost);

    expect(document.activeElement).toBe(other);
    expect(document.activeElement).not.toBe(byId(fixture, 'target'));
    other.remove();
  });

  it('focuses inside a dialog even though focus already sits in that dialog', async () => {
    const fixture = TestBed.createComponent(DialogHost);
    fixture.detectChanges();
    byId(fixture, 'inside').focus();
    await fixture.whenStable();

    expect(document.activeElement).toBe(byId(fixture, 'target'));
  });

  it('resolves a wrapper host to its first usable descendant', async () => {
    const fixture = await render(WrapperHost);

    expect(document.activeElement).toBe(byId(fixture, 'third'));
  });

  it('does not focus a disabled host', async () => {
    const fixture = await render(DisabledHost);

    expect(document.activeElement).not.toBe(byId(fixture, 'target'));
  });

  it('does not focus a host inside an inert subtree', async () => {
    const fixture = await render(InertHost);

    expect(document.activeElement).not.toBe(byId(fixture, 'target'));
  });

  it('marks the host as the initial focus of a CDK focus trap only while enabled', async () => {
    const fixture = await render(ToggleHost);
    const target = byId(fixture, 'target');
    expect(target.hasAttribute('cdkFocusInitial')).toBe(false);

    fixture.componentInstance.enabled.set(true);
    fixture.detectChanges();
    expect(target.hasAttribute('cdkFocusInitial')).toBe(true);
  });

  it('adds no autofocus attribute and no tabindex to the host', async () => {
    const fixture = await render(AttributeHost);
    const target = byId(fixture, 'target');

    expect(target.hasAttribute('autofocus')).toBe(false);
    expect(target.hasAttribute('tabindex')).toBe(false);
  });

  describe('inside an animating dialog', () => {
    function stubAnimations(finished: Promise<unknown>, endTime = 220): void {
      const animation = { finished, effect: { getComputedTiming: () => ({ endTime }) } };
      Object.defineProperty(Element.prototype, 'getAnimations', {
        configurable: true,
        value: () => [animation],
      });
    }

    afterEach(() => {
      delete (Element.prototype as { getAnimations?: unknown }).getAnimations;
      vi.useRealTimers();
    });

    it('waits for the enter animation before it focuses', async () => {
      let finish!: () => void;
      stubAnimations(new Promise<void>((resolve) => (finish = resolve)));

      const fixture = TestBed.createComponent(DialogHost);
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve));
      expect(document.activeElement).not.toBe(byId(fixture, 'target'));

      finish();
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve));
      expect(document.activeElement).toBe(byId(fixture, 'target'));
    });

    it('does not focus when the directive is destroyed during the animation', async () => {
      let finish!: () => void;
      stubAnimations(new Promise<void>((resolve) => (finish = resolve)));

      const fixture = TestBed.createComponent(DialogHost);
      fixture.detectChanges();
      await new Promise((resolve) => setTimeout(resolve));
      const target = byId(fixture, 'target');
      document.body.appendChild(fixture.nativeElement);

      fixture.destroy();
      finish();
      await new Promise((resolve) => setTimeout(resolve));

      expect(document.activeElement).not.toBe(target);
    });

    it('does not wait for an animation that never ends', async () => {
      stubAnimations(new Promise(() => undefined), Infinity);

      const fixture = TestBed.createComponent(DialogHost);
      fixture.detectChanges();
      await fixture.whenStable();
      await new Promise((resolve) => setTimeout(resolve));

      expect(document.activeElement).toBe(byId(fixture, 'target'));
    });
  });
});
