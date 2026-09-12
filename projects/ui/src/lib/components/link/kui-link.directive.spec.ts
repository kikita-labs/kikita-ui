import { Component, PLATFORM_ID, signal } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { provideKuiIcons } from '../icon';
import { KuiLinkDirective } from './kui-link.directive';

const DOWNLOAD_ICON = '<svg viewBox="0 0 16 16"><path d="M8 2v8m-3-3l3 3 3-3" /></svg>';

@Component({
  imports: [KuiLinkDirective],
  template:
    '<a kuiLink variant="body-sm" tone="danger" underline="always" href="/account/delete">Delete</a>',
})
class ToneUnderlineHost {}

@Component({
  imports: [KuiLinkDirective],
  template: '<a kuiLink href="/blocked" disabled>Blocked</a>',
})
class DisabledAnchorHost {}

@Component({
  imports: [KuiLinkDirective],
  template: '<button kuiLink type="button" disabled>Copy</button>',
})
class DisabledButtonHost {}

@Component({
  imports: [KuiLinkDirective],
  template: '<a kuiLink href="https://example.com" target="_blank">External docs</a>',
})
class AutoExternalHost {}

@Component({
  imports: [KuiLinkDirective],
  template:
    '<a kuiLink href="https://example.com" [external]="external()" [iconEnd]="iconEnd()">Docs</a>',
})
class ExplicitExternalHost {
  protected readonly external = signal<boolean | undefined>(true);
  protected readonly iconEnd = signal<string | undefined>(undefined);
}

@Component({
  imports: [KuiLinkDirective],
  template: '<a kuiLink [iconStart]="startIcon()" href="/report">Download report</a>',
})
class IconStartHost {
  protected readonly startIcon = signal<string | undefined>('download');
}

@Component({
  imports: [KuiLinkDirective],
  template: '<a kuiLink href="/docs">Docs</a>',
})
class DefaultHost {}

@Component({
  imports: [KuiLinkDirective],
  template: '<a kuiLink href="https://example.com" target="_blank" rel="author">Docs</a>',
})
class CustomRelHost {}

describe('KuiLinkDirective', () => {
  it('reflects tone and underline as host attributes, and forwards variant to composed [kuiText]', () => {
    const fixture = createFixture(ToneUnderlineHost);

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

    expect(link.classList.contains('kui-link')).toBe(true);
    expect(link.getAttribute('data-kui-tone')).toBe('danger');
    expect(link.getAttribute('data-kui-underline')).toBe('always');
    expect(link.classList.contains('kui-body-sm')).toBe(true);
  });

  it('defaults tone to primary and underline to hover, with kuiText default body variant', () => {
    const fixture = createFixture(DefaultHost);
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

    expect(link.getAttribute('data-kui-tone')).toBe('primary');
    expect(link.getAttribute('data-kui-underline')).toBe('hover');
    expect(link.classList.contains('kui-body')).toBe(true);
  });

  it("does not expose [kuiText]'s tone as part of [kuiLink]'s public API", () => {
    const fixture = createFixture(ToneUnderlineHost);
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

    // kuiText is composed via hostDirectives with only `variant` exposed; its own `tone` input
    // (a distinct input, never fed by the `tone="danger"` above) stays at its own default.
    expect(link.getAttribute('data-kui-text-tone')).toBe('default');
  });

  it('marks a disabled anchor aria-disabled, out of tab order, and blocks click navigation', () => {
    const fixture = createFixture(DisabledAnchorHost);

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const event = new MouseEvent('click', { bubbles: true, cancelable: true });
    const allowed = link.dispatchEvent(event);

    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('tabindex')).toBe('-1');
    expect(link.hasAttribute('disabled')).toBe(false);
    expect(allowed).toBe(false);
  });

  it('applies the native disabled attribute on a host button', () => {
    const fixture = createFixture(DisabledButtonHost);

    const link = fixture.nativeElement.querySelector('button') as HTMLButtonElement;

    expect(link.getAttribute('aria-disabled')).toBe('true');
    expect(link.getAttribute('disabled')).toBe('');
  });

  it('auto-detects external from target="_blank" and adds rel + chrome icon + hidden hint', async () => {
    const fixture = createFixture(AutoExternalHost);
    await fixture.whenStable();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

    expect(link.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link.querySelector('kui-link-external-icon.kui-link__icon-end')).not.toBeNull();
    expect(link.querySelector('kui-icon')).toBeNull();
    expect(link.querySelector('.kui-link__sr-only')?.textContent).toContain('opens in a new tab');
  });

  it('lets an explicit iconEnd take the external icon slot instead of the auto chrome glyph', async () => {
    TestBed.configureTestingModule({
      imports: [ExplicitExternalHost],
      providers: [provideKuiIcons({ download: DOWNLOAD_ICON })],
    });

    const fixture = TestBed.createComponent(ExplicitExternalHost);
    fixture.componentInstance['iconEnd'].set('download');
    fixture.detectChanges();
    await fixture.whenStable();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const icons = [...link.querySelectorAll('kui-icon.kui-link__icon-end')];

    expect(icons).toHaveLength(1);
    expect(icons[0].innerHTML).toContain('M8 2v8');
    expect(link.querySelector('kui-link-external-icon')).toBeNull();
  });

  it('merges a custom rel with noopener noreferrer when external', () => {
    const fixture = createFixture(CustomRelHost);
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    const relTokens = link.getAttribute('rel')?.split(' ') ?? [];

    expect(relTokens).toEqual(expect.arrayContaining(['author', 'noopener', 'noreferrer']));
  });

  it('renders iconStart before the projected content and updates reactively', async () => {
    TestBed.configureTestingModule({
      imports: [IconStartHost],
      providers: [provideKuiIcons({ download: DOWNLOAD_ICON })],
    });

    const fixture = TestBed.createComponent(IconStartHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

    expect(link.firstElementChild?.classList.contains('kui-link__icon-start')).toBe(true);
    expect(link.textContent?.trim()).toBe('Download report');

    fixture.componentInstance['startIcon'].set(undefined);
    fixture.detectChanges();
    await fixture.whenStable();

    expect(link.querySelector('.kui-link__icon-start')).toBeNull();
  });

  it('does not mutate the DOM for icons/external hint when rendered on the server platform', () => {
    TestBed.configureTestingModule({
      imports: [AutoExternalHost],
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }],
    });

    const fixture = TestBed.createComponent(AutoExternalHost);

    expect(() => fixture.detectChanges()).not.toThrow();

    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;

    expect(link.querySelector('kui-icon')).toBeNull();
    expect(link.querySelector('kui-link-external-icon')).toBeNull();
    expect(link.querySelector('.kui-link__sr-only')).toBeNull();
    expect(link.textContent?.trim()).toBe('External docs');
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
