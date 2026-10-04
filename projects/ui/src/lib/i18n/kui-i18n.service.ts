import type { Signal } from '@angular/core';
import { computed, inject, isDevMode, isSignal, Service, signal } from '@angular/core';

import {
  mergeKuiDefaultsLayers,
  resolveKuiDefaultsLayer,
} from '../providers/kui-defaults-layer.util';
import { KUI_I18N_SEED } from './kui-i18n.token';
import {
  createKuiIntlLocale,
  getKuiDatePattern,
  getKuiTimePattern,
  getKuiWeekInfo,
  type KuiDatePattern,
  type KuiTimePattern,
  type KuiWeekInfo,
} from './kui-intl.util';
import { KUI_LOCALE } from './kui-locale.token';
import { resolveKuiLocale } from './kui-locale-resolve.util';
import { KUI_ENGLISH_MESSAGES } from './kui-messages.en';
import type {
  KuiBoundMessages,
  KuiLocaleSource,
  KuiMessageContext,
  KuiMessages,
  KuiMessagesLayer,
  KuiMessagesSource,
  KuiPluralForms,
} from './kui-messages.interface';

const MEMO_LIMIT = 16;

/**
 * Locale and library messages of the current injector level.
 *
 * The root instance is seeded by `provideKikitaUi({ locale, messages })`; `provideKuiI18n` adds a
 * nested level for a subtree. A level inherits the parent's locale unless it sets one and merges
 * its messages over the parent's per group and per key, so two subtrees never affect each other.
 * Text language (messages) and formatting locale are independent. All state, including formatter
 * caches, is held per injector, so server requests never share it.
 */
@Service()
export class KuiI18n {
  private readonly parent = inject(KuiI18n, { optional: true, skipSelf: true });
  private readonly seeds = inject(KUI_I18N_SEED, { optional: true, self: true }) ?? [];
  private readonly rootLocale = inject(KUI_LOCALE);

  private readonly localeSource = signal<string | Signal<string> | undefined>(
    this.seeds.reduce<string | Signal<string> | undefined>(
      (current, seed) => (seed.locale === undefined ? current : this.openLocale(seed.locale)),
      undefined,
    ),
  );

  private readonly messageSources = signal<
    readonly (KuiMessagesLayer | Signal<KuiMessagesLayer>)[]
  >(
    this.seeds.flatMap((seed) =>
      seed.messages === undefined ? [] : [this.openMessages(seed.messages)],
    ),
  );

  private readonly memo = new Map<string, unknown>();
  private readonly warnedLocales = new Set<string>();

  /** The BCP 47 locale used for formatting and plural rules at this level, always one `Intl` supports. */
  readonly locale: Signal<string> = computed(() => {
    const source = this.localeSource();
    if (source === undefined && this.parent) return this.parent.locale();

    const requested = source === undefined ? this.rootLocale : isSignal(source) ? source() : source;
    const resolved = resolveKuiLocale(requested);
    this.warnOnFallback(requested, resolved);

    return resolved;
  });

  /** Every message at this level: the English base, parent levels, then this level's overrides. */
  readonly messages: Signal<KuiMessages> = computed(() => {
    const own = this.messageSources().reduce<KuiMessagesLayer>(
      (merged, source) =>
        mergeKuiDefaultsLayers(
          merged,
          resolveKuiDefaultsLayer<KuiMessagesLayer>(isSignal(source) ? source() : source),
        ),
      {},
    );

    return mergeKuiDefaultsLayers(
      this.parent?.messages() ?? KUI_ENGLISH_MESSAGES,
      own as unknown as KuiMessages,
    );
  });

  /** Helpers handed to function messages, bound to the current locale. */
  readonly context: Signal<KuiMessageContext> = computed(() => {
    const locale = this.locale();
    const numberFormat = this.cached(`number:${locale}`, () => {
      return new Intl.NumberFormat(createKuiIntlLocale(locale));
    });
    const pluralRules = this.cached(`plural:${locale}`, () => new Intl.PluralRules(locale));

    return {
      locale,
      formatNumber: (value) => numberFormat.format(value),
      plural: <T>(count: number, forms: KuiPluralForms<T>): T =>
        forms[pluralRules.select(count)] ?? forms.other,
    };
  });

  /**
   * One message group as a signal. `instance` supplies per-instance overrides, which win over every
   * level. Function messages are returned with the locale helpers already applied.
   */
  get<TGroup extends keyof KuiMessages>(
    group: TGroup,
    instance?: () => Partial<KuiMessages[TGroup]> | undefined,
  ): Signal<KuiBoundMessages<KuiMessages[TGroup]>> {
    return computed(() => {
      const base = this.messages()[group] as unknown as Record<string, unknown>;
      const own = instance?.();
      const merged = own ? mergeDefined(base, own as Record<string, unknown>) : base;
      const context = this.context();
      const bound: Record<string, unknown> = {};

      for (const [key, value] of Object.entries(merged)) {
        bound[key] =
          typeof value === 'function'
            ? (params: unknown) =>
                (value as (p: unknown, c: KuiMessageContext) => string)(params, context)
            : value;
      }

      return bound as KuiBoundMessages<KuiMessages[TGroup]>;
    });
  }

  /** Replaces the locale of this level. A `Signal` makes it follow the application's language. */
  setLocale(locale: string | Signal<string>): void {
    this.localeSource.set(locale);
  }

  /** Replaces the message overrides of this level. A `Signal` makes them follow the application's language. */
  setMessages(messages: KuiMessagesLayer | Signal<KuiMessagesLayer>): void {
    this.messageSources.set([messages]);
  }

  /** @internal Week rule (first day and weekend) for a locale. */
  weekInfo(locale: string): KuiWeekInfo {
    return this.cached(`week:${locale}`, () => getKuiWeekInfo(locale));
  }

  /** @internal Numeric date layout for a locale. */
  datePattern(locale: string): KuiDatePattern {
    return this.cached(`date:${locale}`, () => getKuiDatePattern(locale));
  }

  /** @internal Time layout for a locale. */
  timePattern(locale: string): KuiTimePattern {
    return this.cached(`time:${locale}`, () => getKuiTimePattern(locale));
  }

  /** @internal A cached `Intl.DateTimeFormat` for calendar headings and day names. */
  dateFormat(
    locale: string,
    key: string,
    options: Intl.DateTimeFormatOptions,
  ): Intl.DateTimeFormat {
    return this.cached(
      `format:${key}:${locale}`,
      () => new Intl.DateTimeFormat(createKuiIntlLocale(locale), { ...options, timeZone: 'UTC' }),
    );
  }

  /** @internal A cached `Intl.NumberFormat` for the given locale (default: this level's) with Latin digits. */
  numberFormat(
    key: string,
    options: Intl.NumberFormatOptions,
    locale: string = this.locale(),
  ): Intl.NumberFormat {
    return this.cached(
      `numberFormat:${key}:${locale}`,
      () => new Intl.NumberFormat(createKuiIntlLocale(locale), options),
    );
  }

  /** @internal Per-injector memo with a small cap, so a request cannot grow it without bound. */
  cached<T>(key: string, create: () => T): T {
    if (this.memo.has(key)) return this.memo.get(key) as T;

    if (this.memo.size >= MEMO_LIMIT) this.memo.clear();
    const created = create();
    this.memo.set(key, created);

    return created;
  }

  private openLocale(source: KuiLocaleSource): string | Signal<string> {
    return typeof source === 'function' && !isSignal(source) ? source() : source;
  }

  private openMessages(source: KuiMessagesSource): KuiMessagesLayer | Signal<KuiMessagesLayer> {
    return typeof source === 'function' && !isSignal(source) ? source() : source;
  }

  private warnOnFallback(requested: string, resolved: string): void {
    if (!isDevMode() || this.warnedLocales.has(requested)) return;

    let canonical = requested;
    try {
      canonical = Intl.getCanonicalLocales(requested)[0];
    } catch {
      /* A malformed tag always warns below. */
    }

    if (canonical !== resolved) {
      this.warnedLocales.add(requested);
      console.warn(
        `[kikita-ui] Locale "${requested}" is not supported by this runtime's Intl; using "${resolved}".`,
      );
    }
  }
}

function mergeDefined(
  base: Record<string, unknown>,
  override: Record<string, unknown>,
): Record<string, unknown> {
  const merged = { ...base };

  for (const [key, value] of Object.entries(override)) {
    if (value !== undefined) merged[key] = value;
  }

  return merged;
}
