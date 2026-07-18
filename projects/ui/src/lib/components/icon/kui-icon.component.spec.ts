import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiIconComponent } from './kui-icon.component';
import { provideKuiIcons } from './provide-kui-icons';

const CHECK_ICON =
  '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="currentColor"/></svg>';

const CLOSE_ICON =
  '<svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor"/></svg>';

@Component({
  imports: [KuiIconComponent],
  template: '<kui-icon name="check" label="Confirm" />',
})
class NamedIconHost {}

@Component({
  imports: [KuiIconComponent],
  template: '<kui-icon [source]="source" />',
})
class SourceIconHost {
  protected readonly source = CLOSE_ICON;
}

@Component({
  imports: [KuiIconComponent],
  template: '<kui-icon src="/assets/icon.svg" />',
})
class UrlIconHost {}

describe('KuiIconComponent', () => {
  it('renders a registered icon by name with an accessible label', async () => {
    const fixture = createFixture(NamedIconHost);
    await fixture.whenStable();

    const icon = fixture.nativeElement.querySelector('kui-icon') as HTMLElement;

    expect(icon.getAttribute('role')).toBe('img');
    expect(icon.getAttribute('aria-label')).toBe('Confirm');
    expect(icon.querySelector('svg')).not.toBeNull();
  });

  it('renders direct inline SVG source before registry lookup', () => {
    const fixture = createFixture(SourceIconHost);

    const icon = fixture.nativeElement.querySelector('kui-icon') as HTMLElement;

    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.querySelector('svg path')?.getAttribute('d')).toContain('M4 4');
  });

  it('falls back to an external image URL when no inline SVG is available', () => {
    const fixture = createFixture(UrlIconHost);

    const image = fixture.nativeElement.querySelector('img') as HTMLImageElement;

    expect(image.getAttribute('src')).toBe('/assets/icon.svg');
    expect(image.getAttribute('alt')).toBe('');
  });

  it('resolves icon names through an async resolver function', async () => {
    @Component({
      imports: [KuiIconComponent],
      template: '<kui-icon name="spark" />',
    })
    class ResolverIconHost {}

    TestBed.configureTestingModule({
      imports: [ResolverIconHost],
      providers: [provideKuiIcons(async (name) => (name === 'spark' ? CLOSE_ICON : undefined))],
    });

    const fixture = TestBed.createComponent(ResolverIconHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const icon = fixture.nativeElement.querySelector('kui-icon') as HTMLElement;

    expect(icon.querySelector('svg path')?.getAttribute('d')).toContain('M4 4');
  });

  it('lets a later provided icon set override an earlier one for the same name', async () => {
    TestBed.configureTestingModule({
      imports: [NamedIconHost],
      providers: [provideKuiIcons({ check: CHECK_ICON }), provideKuiIcons({ check: CLOSE_ICON })],
    });

    const fixture = TestBed.createComponent(NamedIconHost);
    fixture.detectChanges();
    await fixture.whenStable();

    const icon = fixture.nativeElement.querySelector('kui-icon') as HTMLElement;

    expect(icon.querySelector('svg path')?.getAttribute('d')).toContain('M4 4');
  });
});

function createFixture<T>(component: new () => T): ComponentFixture<T> {
  TestBed.configureTestingModule({
    imports: [component],
    providers: [provideKuiIcons({ check: CHECK_ICON })],
  });

  const fixture = TestBed.createComponent(component);
  fixture.detectChanges();

  return fixture;
}
