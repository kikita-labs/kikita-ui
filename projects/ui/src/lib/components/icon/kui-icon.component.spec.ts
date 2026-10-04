import type { EnvironmentProviders, Provider } from '@angular/core';
import { Component } from '@angular/core';
import type { ComponentFixture } from '@angular/core/testing';
import { TestBed } from '@angular/core/testing';

import { KuiIcon } from './kui-icon.component';
import type { KuiIconGlyph } from './kui-icon-glyph.type';
import { provideKuiIcons } from './provide-kui-icons';

const CHECK_ICON =
  '<svg viewBox="0 0 16 16" fill="none"><path d="M3 8l3 3 7-7" stroke="currentColor"/></svg>';

const CLOSE_ICON =
  '<svg viewBox="0 0 16 16" fill="none"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor"/></svg>';

@Component({
  imports: [KuiIcon],
  template: '<kui-icon name="check" label="Confirm" />',
})
class NamedIconHost {}

@Component({
  imports: [KuiIcon],
  template: '<kui-icon [source]="source" />',
})
class SourceIconHost {
  protected readonly source = CLOSE_ICON;
}

@Component({
  imports: [KuiIcon],
  template: '<kui-icon src="/assets/icon.svg" />',
})
class UrlIconHost {}

@Component({
  imports: [KuiIcon],
  template: `
    <kui-icon>
      <svg viewBox="0 0 16 16" fill="none">
        <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" />
      </svg>
    </kui-icon>
  `,
})
class ProjectedContentIconHost {}

@Component({
  imports: [KuiIcon],
  template: '<kui-icon name="check" size="lg" />',
})
class PresetSizeIconHost {}

@Component({
  imports: [KuiIcon],
  template: '<kui-icon name="check" [size]="32" />',
})
class NumericSizeIconHost {}

@Component({
  imports: [KuiIcon],
  template: '<kui-icon name="check" size="1.75em" />',
})
class CssSizeIconHost {}

describe('KuiIcon', () => {
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

  it('projects light-DOM content synchronously when name/source/src are all unset', () => {
    const fixture = createFixture(ProjectedContentIconHost);

    const icon = fixture.nativeElement.querySelector('kui-icon') as HTMLElement;

    expect(icon.getAttribute('aria-hidden')).toBe('true');
    expect(icon.querySelector('svg path')?.getAttribute('d')).toContain('M4 4');
  });

  it('resolves icon names through an async resolver function', async () => {
    @Component({
      imports: [KuiIcon],
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

  it('maps named size presets to Kikita icon CSS variables', () => {
    const fixture = createFixture(PresetSizeIconHost);

    const icon = fixture.nativeElement.querySelector('kui-icon') as HTMLElement;

    expect(icon.style.getPropertyValue('--kui-icon-size')).toBe('var(--kui-icon-size-lg, 1.5rem)');
  });

  it('converts numeric sizes to pixels', () => {
    const fixture = createFixture(NumericSizeIconHost);

    const icon = fixture.nativeElement.querySelector('kui-icon') as HTMLElement;

    expect(icon.style.getPropertyValue('--kui-icon-size')).toBe('32px');
  });

  it('passes through custom CSS size strings', () => {
    const fixture = createFixture(CssSizeIconHost);

    const icon = fixture.nativeElement.querySelector('kui-icon') as HTMLElement;

    expect(icon.style.getPropertyValue('--kui-icon-size')).toBe('1.75em');
  });
});

const GLYPH: KuiIconGlyph = {
  node: [
    ['circle', { cx: 12, cy: 12, r: 10 }],
    ['path', { d: 'M12 8v8' }],
  ],
};

@Component({
  imports: [KuiIcon],
  template: `<kui-icon name="spark" />`,
})
class SparkHost {}

@Component({
  imports: [KuiIcon],
  template: `<kui-icon [source]="glyph" />`,
})
class GlyphSourceHost {
  protected readonly glyph = GLYPH;
}

@Component({
  imports: [KuiIcon],
  template: `<kui-icon name="constructor" />`,
})
class PrototypeNameHost {}

@Component({
  imports: [KuiIcon],
  template: `<kui-icon name="spark" [strokeWidth]="1.25" absoluteStrokeWidth />`,
})
class StrokeHost {}

@Component({
  imports: [KuiIcon],
  template: `<kui-icon name="spark" />`,
})
class PlainStrokeHost {}

describe('KuiIcon glyph data and static registries', () => {
  afterEach(() => TestBed.resetTestingModule());

  function render<T>(
    type: new () => T,
    providers: (Provider | EnvironmentProviders)[],
  ): ComponentFixture<T> {
    TestBed.configureTestingModule({ imports: [type], providers });
    const fixture = TestBed.createComponent(type);
    fixture.detectChanges();

    return fixture;
  }

  it('draws a name from a static registry on the first pass, without waiting for a promise', () => {
    const fixture = render(SparkHost, [provideKuiIcons({ spark: CLOSE_ICON })]);

    expect(fixture.nativeElement.querySelector('kui-icon svg path')).not.toBeNull();
  });

  it('draws glyph data from a static registry through the safe renderer, not as trusted markup', () => {
    const fixture = render(SparkHost, [provideKuiIcons({ spark: GLYPH })]);
    const icon = fixture.nativeElement.querySelector('kui-icon') as HTMLElement;
    const svg = icon.querySelector('svg.kui-icon__glyph') as SVGElement;

    expect(icon.querySelector('.kui-icon__svg')).toBeNull();
    expect(svg.getAttribute('viewBox')).toBe('0 0 24 24');
    expect(svg.querySelector('circle')?.getAttribute('r')).toBe('10');
    expect(svg.querySelector('path')?.getAttribute('d')).toBe('M12 8v8');
  });

  it('draws glyph data passed to source', () => {
    const fixture = render(GlyphSourceHost, []);

    expect(fixture.nativeElement.querySelector('kui-icon svg.kui-icon__glyph path')).not.toBeNull();
  });

  it('draws glyph data returned by an async resolver', async () => {
    const fixture = render(SparkHost, [provideKuiIcons(async () => GLYPH)]);
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      fixture.nativeElement.querySelector('kui-icon svg.kui-icon__glyph circle'),
    ).not.toBeNull();
  });

  it('never draws invalid glyph data as markup', () => {
    const hostile = { node: [['script', { d: 'x' }]] } as unknown as KuiIconGlyph;
    const fixture = render(SparkHost, [provideKuiIcons({ spark: hostile })]);
    const icon = fixture.nativeElement.querySelector('kui-icon') as HTMLElement;

    expect(icon.querySelector('script')).toBeNull();
    expect(icon.querySelector('svg.kui-icon__glyph')?.children).toHaveLength(0);
  });

  it('lets the latest registry win, whether it is static or async', async () => {
    const early = render(SparkHost, [
      provideKuiIcons({ spark: CHECK_ICON }),
      provideKuiIcons({ spark: GLYPH }),
    ]);

    expect(early.nativeElement.querySelector('svg.kui-icon__glyph')).not.toBeNull();

    TestBed.resetTestingModule();

    const late = render(SparkHost, [
      provideKuiIcons({ spark: CHECK_ICON }),
      provideKuiIcons(async () => GLYPH),
    ]);
    await late.whenStable();
    late.detectChanges();

    expect(late.nativeElement.querySelector('svg.kui-icon__glyph')).not.toBeNull();
  });

  it('does not resolve names from the prototype of a registry object', () => {
    const fixture = render(PrototypeNameHost, [provideKuiIcons({ spark: CLOSE_ICON })]);

    expect(fixture.nativeElement.querySelector('kui-icon svg')).toBeNull();
  });

  it('sets the stroke tokens only when asked', () => {
    const plain = render(PlainStrokeHost, [provideKuiIcons({ spark: CLOSE_ICON })]);
    const plainIcon = plain.nativeElement.querySelector('kui-icon') as HTMLElement;

    expect(plainIcon.style.getPropertyValue('--kui-icon-stroke-width')).toBe('');
    expect(plainIcon.style.getPropertyValue('--kui-icon-vector-effect')).toBe('');

    TestBed.resetTestingModule();

    const stroked = render(StrokeHost, [provideKuiIcons({ spark: CLOSE_ICON })]);
    const icon = stroked.nativeElement.querySelector('kui-icon') as HTMLElement;

    expect(icon.style.getPropertyValue('--kui-icon-stroke-width')).toBe('1.25');
    expect(icon.style.getPropertyValue('--kui-icon-vector-effect')).toBe('non-scaling-stroke');
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
