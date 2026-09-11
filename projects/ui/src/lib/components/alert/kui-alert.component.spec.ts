import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiAlertComponent } from './kui-alert.component';
import { KuiAlertActionsDirective } from './kui-alert-actions.directive';
import { KuiAlertIconDirective } from './kui-alert-icon.directive';
import { KuiAlertMessageDirective } from './kui-alert-message.directive';
import { KuiAlertTitleDirective } from './kui-alert-title.directive';

@Component({
  imports: [KuiAlertComponent],
  template: `
    <kui-alert
      appearance="warning"
      shape="outline"
      size="sm"
      title="Session expiring"
      message="Your token expires in 3 days."
      actionLabel="Renew"
      (action)="actionClicks = actionClicks + 1"
      (closed)="closes = closes + 1"
    />
  `,
})
class AlertHost {
  actionClicks = 0;
  closes = 0;
}

@Component({
  imports: [KuiAlertComponent],
  template: `<kui-alert message="Minimal" />`,
})
class DefaultAlertHost {}

@Component({
  imports: [KuiAlertComponent],
  template: `<kui-alert appearance="danger" message="Failed" />`,
})
class DangerAlertHost {}

@Component({
  imports: [KuiAlertComponent],
  template: `<kui-alert appearance="success" message="Saved" [closable]="false" />`,
})
class NonClosableAlertHost {}

@Component({
  imports: [KuiAlertComponent],
  template: `<kui-alert appearance="success" message="Saved" [showIcon]="false" />`,
})
class NoIconAlertHost {}

@Component({
  imports: [KuiAlertComponent],
  template: `<kui-alert appearance="info" banner message="System notice" />`,
})
class BannerAlertHost {}

@Component({
  imports: [KuiAlertComponent],
  template: `
    <kui-alert appearance="info" message="Info" />
    <kui-alert appearance="danger" message="Danger" />
  `,
})
class TwoAppearancesAlertHost {}

@Component({
  imports: [KuiAlertComponent],
  template: `
    <kui-alert appearance="success" title="Done" />
    <kui-alert appearance="success" message="Saved" />
    <kui-alert appearance="success" title="Done" message="All good" />
    <kui-alert appearance="success" message="Saved" actionLabel="Undo" />
  `,
})
class BodyLineCountAlertHost {}

@Component({
  imports: [
    KuiAlertComponent,
    KuiAlertTitleDirective,
    KuiAlertIconDirective,
    KuiAlertMessageDirective,
    KuiAlertActionsDirective,
  ],
  template: `
    <kui-alert appearance="neutral" title="Ignored" [showIcon]="false" message="Ignored">
      <span kuiAlertIcon>ROCKET</span>
      <span kuiAlertTitle>Custom <b>title</b></span>
      <p kuiAlertMessage>Custom <a href="/x">rich</a> message.</p>
      <div kuiAlertActions>
        <button type="button" (click)="discard()">Discard</button>
        <button type="button" (click)="save()">Save</button>
      </div>
    </kui-alert>
  `,
})
class ProjectedContentAlertHost {
  discardClicks = 0;
  saveClicks = 0;
  discard(): void {
    this.discardClicks++;
  }
  save(): void {
    this.saveClicks++;
  }
}

describe('KuiAlertComponent', () => {
  it('renders appearance/shape/size, title, message, action, and close button', () => {
    const fixture = createFixture(AlertHost);

    const alert = fixture.nativeElement.querySelector('kui-alert') as HTMLElement;
    expect(alert.getAttribute('data-kui-appearance')).toBe('warning');
    expect(alert.getAttribute('data-kui-shape')).toBe('outline');
    expect(alert.getAttribute('data-kui-size')).toBe('sm');
    expect(alert.textContent).toContain('Session expiring');
    expect(alert.textContent).toContain('Your token expires in 3 days.');

    const action = alert.querySelector('.kui-alert__action') as HTMLButtonElement;
    expect(action.textContent?.trim()).toBe('Renew');
    action.click();
    expect(fixture.componentInstance.actionClicks).toBe(1);

    const close = alert.querySelector('.kui-alert__close') as HTMLButtonElement;
    expect(close.getAttribute('aria-label')).toBe('Close notification');
    close.click();
    expect(fixture.componentInstance.closes).toBe(1);
  });

  it('does not leak the `title` input as a native title attribute (would trigger a browser tooltip)', () => {
    const fixture = createFixture(AlertHost);
    const alert = fixture.nativeElement.querySelector('kui-alert') as HTMLElement;
    expect(alert.hasAttribute('title')).toBe(false);
  });

  it('renders the severity icon as an inline synchronous <svg> (no async icon-registry fetch)', () => {
    const fixture = createFixture(AlertHost);
    const alert = fixture.nativeElement.querySelector('kui-alert') as HTMLElement;
    // No whenStable()/fakeAsync needed: a single detectChanges() must already show the icon.
    const svg = alert.querySelector('.kui-alert__icon svg');
    expect(svg).not.toBeNull();
  });

  it('sets icon color from --kui-alert-icon-color via inline style, not a stylesheet rule', () => {
    // jsdom does not run a real CSS cascade/layers engine, so this only asserts the icon carries
    // its own inline color declaration (verified against --kui-alert-icon-color's actual resolved
    // color, differing per appearance, in a real browser -- see docs/alert.md accessibility notes).
    const fixture = createFixture(TwoAppearancesAlertHost);
    const icons = fixture.nativeElement.querySelectorAll('.kui-alert__icon');
    expect(icons.length).toBe(2);
    for (const icon of icons) {
      expect((icon as HTMLElement).style.color).toBe('var(--kui-alert-icon-color, currentColor)');
    }
  });

  it('defaults to neutral/soft/md with icon hidden for neutral appearance', () => {
    const fixture = createFixture(DefaultAlertHost);

    const alert = fixture.nativeElement.querySelector('kui-alert') as HTMLElement;
    expect(alert.getAttribute('data-kui-appearance')).toBe('neutral');
    expect(alert.getAttribute('data-kui-shape')).toBe('soft');
    expect(alert.getAttribute('data-kui-size')).toBe('md');
    expect(alert.querySelector('.kui-alert__icon')).toBeNull();
    expect(alert.querySelector('.kui-alert__action')).toBeNull();
  });

  it('uses role="alert" and aria-live="assertive" for danger', () => {
    const danger = createFixture(DangerAlertHost);
    const dangerAlert = danger.nativeElement.querySelector('kui-alert') as HTMLElement;
    expect(dangerAlert.getAttribute('role')).toBe('alert');
    expect(dangerAlert.getAttribute('aria-live')).toBe('assertive');
    expect(dangerAlert.getAttribute('aria-atomic')).toBe('true');
  });

  it('uses role="status" and aria-live="polite" for non-danger appearances', () => {
    const other = createFixture(DefaultAlertHost);
    const otherAlert = other.nativeElement.querySelector('kui-alert') as HTMLElement;
    expect(otherAlert.getAttribute('role')).toBe('status');
    expect(otherAlert.getAttribute('aria-live')).toBe('polite');
  });

  it('hides the close button when closable is false', () => {
    const fixture = createFixture(NonClosableAlertHost);
    const alert = fixture.nativeElement.querySelector('kui-alert') as HTMLElement;
    expect(alert.querySelector('.kui-alert__close')).toBeNull();
  });

  it('hides the icon when showIcon is false even for a non-neutral appearance', () => {
    const fixture = createFixture(NoIconAlertHost);
    const alert = fixture.nativeElement.querySelector('kui-alert') as HTMLElement;
    expect(alert.querySelector('.kui-alert__icon')).toBeNull();
  });

  it('applies the banner attribute', () => {
    const fixture = createFixture(BannerAlertHost);
    const alert = fixture.nativeElement.querySelector('kui-alert') as HTMLElement;
    expect(alert.getAttribute('data-kui-banner')).toBe('');
  });

  it('marks single-line bodies (title-only or message-only) so the icon/close row can center', () => {
    const fixture = createFixture(BodyLineCountAlertHost);
    const alerts = fixture.nativeElement.querySelectorAll('kui-alert');
    const [titleOnly, messageOnly, titleAndMessage, messageAndAction] = Array.from(alerts).map(
      (el) => (el as HTMLElement).getAttribute('data-kui-single-line'),
    );
    expect(titleOnly).toBe('');
    expect(messageOnly).toBe('');
    expect(titleAndMessage).toBeNull();
    expect(messageAndAction).toBeNull();
  });

  it('renders projected title/icon/message/actions instead of the built-in ones, ignoring the matching inputs', () => {
    const fixture = createFixture(ProjectedContentAlertHost);
    const alert = fixture.nativeElement.querySelector('kui-alert') as HTMLElement;

    // Projected icon renders even though appearance="neutral" and showIcon="false" would
    // otherwise hide the built-in icon.
    const icon = alert.querySelector('.kui-alert__icon') as HTMLElement;
    expect(icon.textContent).toBe('ROCKET');
    expect(icon.querySelector('svg')).toBeNull();

    // Projected title replaces the title="Ignored" input entirely.
    const title = alert.querySelector('.kui-alert__title') as HTMLElement;
    expect(title.tagName.toLowerCase()).toBe('span');
    expect(title.querySelector('b')).not.toBeNull();

    // Projected message replaces the message="Ignored" input entirely.
    const message = alert.querySelector('.kui-alert__message') as HTMLElement;
    expect(message.tagName.toLowerCase()).toBe('p');
    expect(message.textContent).toContain('Custom');
    expect(message.querySelector('a')).not.toBeNull();
    expect(alert.textContent).not.toContain('Ignored');

    // Projected actions replace the single actionLabel button; multiple controls work.
    const actions = alert.querySelector('.kui-alert__actions') as HTMLElement;
    const buttons = actions.querySelectorAll('button');
    expect(buttons.length).toBe(2);
    (buttons[0] as HTMLButtonElement).click();
    (buttons[1] as HTMLButtonElement).click();
    expect(fixture.componentInstance.discardClicks).toBe(1);
    expect(fixture.componentInstance.saveClicks).toBe(1);

    // Multi-line content (projected message/actions) always keeps the top-aligned layout.
    expect(alert.getAttribute('data-kui-single-line')).toBeNull();
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
