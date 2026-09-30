import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { KUI_LOCALE, kuiProvideLocale } from './kui-locale.token';

describe('KUI_LOCALE', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  it('follows navigator.language in the browser', () => {
    vi.stubGlobal('navigator', { language: 'de-DE' });

    expect(TestBed.inject(KUI_LOCALE)).toBe('de-DE');
  });

  it('is en-US on the server even when the host defines another navigator.language', () => {
    vi.stubGlobal('navigator', { language: 'ru-RU' });
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

    expect(TestBed.inject(KUI_LOCALE)).toBe('en-US');
  });

  it('lets kuiProvideLocale override both platforms', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }, kuiProvideLocale('fr-FR')],
    });

    expect(TestBed.inject(KUI_LOCALE)).toBe('fr-FR');
  });
});
