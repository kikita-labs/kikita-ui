import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { afterEach, describe, expect, it } from 'vitest';

import { DEFAULT_KUI_THEME } from './default-kui-theme.const';
import { provideKuiTheme } from './provide-kui-theme';

function themeStyles(): HTMLStyleElement[] {
  return Array.from(document.head.querySelectorAll<HTMLStyleElement>('style#kui-theme'));
}

describe('provideKuiTheme', () => {
  afterEach(() => {
    TestBed.resetTestingModule();
    themeStyles().forEach((style) => style.remove());
    document.documentElement.removeAttribute('data-kui-density');
  });

  it('installs the generated CSS variables in one style element', () => {
    TestBed.configureTestingModule({ providers: [provideKuiTheme()] });
    TestBed.inject(DOCUMENT);

    const styles = themeStyles();
    expect(styles).toHaveLength(1);
    expect(styles[0].textContent).toContain('--kui-');
  });

  it('installs the style on the server platform so the first HTML is themed', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }, provideKuiTheme()],
    });
    TestBed.inject(DOCUMENT);

    expect(themeStyles()).toHaveLength(1);
  });

  it('puts the generated variables in the kui.tokens layer', () => {
    TestBed.configureTestingModule({ providers: [provideKuiTheme()] });
    TestBed.inject(DOCUMENT);

    expect(themeStyles()[0].textContent).toContain('@layer kui.tokens {');
  });

  it('sets the density of the seeds on the root element', () => {
    TestBed.configureTestingModule({
      providers: [provideKuiTheme({ seeds: { ...DEFAULT_KUI_THEME.seeds, density: 'compact' } })],
    });
    TestBed.inject(DOCUMENT);

    expect(document.documentElement.getAttribute('data-kui-density')).toBe('compact');
  });

  it('keeps a density that the page already chose', () => {
    document.documentElement.setAttribute('data-kui-density', 'comfortable');
    TestBed.configureTestingModule({ providers: [provideKuiTheme()] });
    TestBed.inject(DOCUMENT);

    expect(document.documentElement.getAttribute('data-kui-density')).toBe('comfortable');
  });

  it('sets the density on the server platform as well', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }, provideKuiTheme()],
    });
    TestBed.inject(DOCUMENT);

    expect(document.documentElement.getAttribute('data-kui-density')).toBe(
      DEFAULT_KUI_THEME.seeds.density,
    );
  });

  it('reuses the style a server render already put in the document instead of adding a second', () => {
    const serverStyle = document.createElement('style');
    serverStyle.id = 'kui-theme';
    serverStyle.textContent = ':root{}';
    document.head.appendChild(serverStyle);

    TestBed.configureTestingModule({ providers: [provideKuiTheme()] });
    TestBed.inject(DOCUMENT);

    const styles = themeStyles();
    expect(styles).toHaveLength(1);
    expect(styles[0]).toBe(serverStyle);
    expect(serverStyle.textContent).toContain('--kui-');
  });
});
