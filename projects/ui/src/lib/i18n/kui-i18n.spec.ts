import { EnvironmentInjector, Injector, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { describe, expect, it, vi } from 'vitest';

import { provideKikitaUi } from '../root';
import { KuiI18n } from './kui-i18n';
import { KUI_ENGLISH_MESSAGES } from './kui-messages.en';
import type { KuiMessagesLayer } from './kui-messages.interface';
import type { provideKuiI18n } from './provide-kui-i18n';
import { provideKuiLocale, provideKuiMessages } from './provide-kui-i18n';

function createChild(providers: ReturnType<typeof provideKuiI18n>): KuiI18n {
  return Injector.create({ providers, parent: TestBed.inject(EnvironmentInjector) }).get(KuiI18n);
}

describe('KuiI18n', () => {
  it('serves the English messages with no configuration', () => {
    const i18n = TestBed.inject(KuiI18n);

    expect(i18n.messages()).toEqual(KUI_ENGLISH_MESSAGES);
    expect(i18n.get('pagination')().next).toBe('Next page');
  });

  it('applies a root partial override and keeps sibling keys and groups', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ messages: { pagination: { next: 'Weiter' } } })],
    });
    const i18n = TestBed.inject(KuiI18n);

    expect(i18n.get('pagination')().next).toBe('Weiter');
    expect(i18n.get('pagination')().previous).toBe('Previous page');
    expect(i18n.get('menu')().label).toBe('Actions');
  });

  it('treats an empty string as a real value but ignores undefined', () => {
    TestBed.configureTestingModule({
      providers: [
        provideKikitaUi({
          messages: { fileUpload: { promptAfter: '!', promptBefore: undefined } },
        }),
      ],
    });
    const upload = TestBed.inject(KuiI18n).get('fileUpload');

    expect(upload().promptAfter).toBe('!');
    expect(upload().promptBefore).toBe('Drag files here or ');
  });

  it('follows a signal source when the language changes at runtime', () => {
    const language = signal<KuiMessagesLayer>({ pagination: { next: 'Next' } });
    TestBed.configureTestingModule({ providers: [provideKikitaUi({ messages: language })] });
    const next = TestBed.inject(KuiI18n).get('pagination');

    expect(next().next).toBe('Next');
    language.set({ pagination: { next: 'Weiter' } });
    expect(next().next).toBe('Weiter');
  });

  it('runs a function source in an injection context', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ messages: () => ({ menu: { label: 'Aktionen' } }) })],
    });

    expect(TestBed.inject(KuiI18n).get('menu')().label).toBe('Aktionen');
  });

  it('gives instance overrides priority over every level', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ messages: { pagination: { next: 'Weiter' } } })],
    });
    const instance = signal<{ next?: string } | undefined>({ next: 'Vor' });
    const next = TestBed.inject(KuiI18n).get('pagination', () => instance());

    expect(next().next).toBe('Vor');
    instance.set(undefined);
    expect(next().next).toBe('Weiter');
  });

  it('applies the locale helpers to function messages', () => {
    TestBed.configureTestingModule({ providers: [provideKikitaUi({ locale: 'en-US' })] });
    const i18n = TestBed.inject(KuiI18n);

    expect(i18n.get('pagination')().summary({ start: 1, end: 10, total: 1234 })).toBe(
      'Showing 1–10 of 1,234',
    );
    expect(i18n.get('fileUpload')().tooMany({ max: 1 })).toBe('Maximum 1 file');
    expect(i18n.get('fileUpload')().tooMany({ max: 3 })).toBe('Maximum 3 files');
  });

  it('picks plural forms with the locale rules', () => {
    TestBed.configureTestingModule({ providers: [provideKikitaUi({ locale: 'ru-RU' })] });
    const { plural } = TestBed.inject(KuiI18n).context();
    const forms = { one: 'one', few: 'few', many: 'many', other: 'other' };

    expect([1, 2, 5, 21, 1.5].map((n) => plural(n, forms))).toEqual([
      'one',
      'few',
      'many',
      'one',
      'other',
    ]);
  });

  it('formats numbers with the locale and Latin digits', () => {
    TestBed.configureTestingModule({ providers: [provideKikitaUi({ locale: 'de-DE' })] });

    expect(TestBed.inject(KuiI18n).context().formatNumber(1234.5)).toBe('1.234,5');
  });

  it('keeps nested levels independent of each other and of the root', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ locale: 'en-US', messages: { menu: { label: 'Root' } } })],
    });
    const root = TestBed.inject(KuiI18n);
    const left = createChild(provideKuiMessages({ pagination: { next: 'Left' } }));
    const right = createChild([
      ...provideKuiLocale('de-DE'),
      ...provideKuiMessages({ menu: { label: 'Right' } }),
    ]);

    expect(left.get('pagination')().next).toBe('Left');
    expect(left.get('menu')().label).toBe('Root');
    expect(left.locale()).toBe('en-US');
    expect(right.get('pagination')().next).toBe('Next page');
    expect(right.get('menu')().label).toBe('Right');
    expect(right.locale()).toBe('de-DE');
    expect(root.get('pagination')().next).toBe('Next page');
    expect(root.locale()).toBe('en-US');
  });

  it('passes a parent change to a child level', () => {
    const language = signal<KuiMessagesLayer>({ menu: { label: 'A' } });
    TestBed.configureTestingModule({ providers: [provideKikitaUi({ messages: language })] });
    const child = createChild(provideKuiMessages({ pagination: { next: 'Child' } }));

    expect(child.get('menu')().label).toBe('A');
    language.set({ menu: { label: 'B' } });
    expect(child.get('menu')().label).toBe('B');
  });

  it('changes the locale and the messages at runtime', () => {
    const i18n = TestBed.inject(KuiI18n);

    i18n.setLocale('fr-FR');
    i18n.setMessages({ menu: { label: 'Actions FR' } });

    expect(i18n.locale()).toBe('fr-FR');
    expect(i18n.get('menu')().label).toBe('Actions FR');
  });

  it('falls back to en-US for an unsupported locale and warns once', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    TestBed.configureTestingModule({ providers: [provideKikitaUi({ locale: 'tlh' })] });
    const i18n = TestBed.inject(KuiI18n);

    expect(i18n.locale()).toBe('en-US');
    expect(i18n.locale()).toBe('en-US');
    expect(warn).toHaveBeenCalledTimes(1);
    warn.mockRestore();
  });

  it('keeps no state across injectors', () => {
    TestBed.configureTestingModule({
      providers: [provideKikitaUi({ messages: { menu: { label: 'One' } } })],
    });
    expect(TestBed.inject(KuiI18n).get('menu')().label).toBe('One');

    TestBed.resetTestingModule();

    expect(TestBed.inject(KuiI18n).get('menu')().label).toBe('Actions');
  });
});
