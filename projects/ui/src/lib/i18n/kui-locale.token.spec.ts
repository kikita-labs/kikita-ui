import { PLATFORM_ID, REQUEST, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { KuiI18n } from './kui-i18n';
import { KUI_LOCALE } from './kui-locale.token';
import { KUI_LOCALE_SEED } from './kui-locale-seed.util';
import { provideKuiLocale } from './provide-kui-i18n';

describe('KUI_LOCALE', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    TestBed.resetTestingModule();
  });

  it('follows navigator.language in the browser', () => {
    vi.stubGlobal('navigator', { language: 'de-DE' });

    expect(TestBed.inject(KUI_LOCALE)).toBe('de-DE');
  });

  it('is en-US on the server without a request, even when the host defines another language', () => {
    vi.stubGlobal('navigator', { language: 'ru-RU' });
    TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: 'server' }] });

    expect(TestBed.inject(KUI_LOCALE)).toBe('en-US');
  });

  it('follows the request Accept-Language on the server and hands it to the browser', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        {
          provide: REQUEST,
          useValue: new Request('http://localhost/', {
            headers: { 'accept-language': 'de-DE,de;q=0.9' },
          }),
        },
      ],
    });

    expect(TestBed.inject(KUI_LOCALE)).toBe('de-DE');
    expect(TestBed.inject(TransferState).get(KUI_LOCALE_SEED, null)).toBe('de-DE');
  });

  it('falls back to en-US for a request without a usable Accept-Language', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: REQUEST, useValue: new Request('http://localhost/') },
      ],
    });

    expect(TestBed.inject(KUI_LOCALE)).toBe('en-US');
  });

  it('renders the transferred server locale first in the browser, whatever navigator says', () => {
    vi.stubGlobal('navigator', { language: 'ru-RU' });
    TestBed.inject(TransferState).set(KUI_LOCALE_SEED, 'de-DE');

    expect(TestBed.inject(KUI_LOCALE)).toBe('de-DE');
  });

  it('lets provideKuiLocale override both platforms', () => {
    TestBed.configureTestingModule({
      providers: [{ provide: PLATFORM_ID, useValue: 'server' }, provideKuiLocale('fr-FR')],
    });

    expect(TestBed.inject(KuiI18n).locale()).toBe('fr-FR');
  });
});
