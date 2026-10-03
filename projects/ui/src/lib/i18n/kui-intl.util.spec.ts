import { describe, expect, it } from 'vitest';

import {
  formatKuiDate,
  getKuiDatePattern,
  getKuiTimePattern,
  getKuiWeekInfo,
  normalizeKuiDayPeriod,
  parseKuiDate,
  parseKuiDatePattern,
} from './kui-intl.util';
import { resolveKuiLocale } from './kui-locale-resolve.util';

const date = (year: number, month: number, day: number) => new Date(year, month - 1, day);

describe('getKuiWeekInfo', () => {
  it.each([
    ['en-US', 0, [6, 0]],
    ['en-GB', 1, [6, 0]],
    ['ru-RU', 1, [6, 0]],
    ['he-IL', 0, [5, 6]],
    ['ar-SA', 0, [5, 6]],
    ['ar-EG', 6, [5, 6]],
    ['fa-IR', 6, [5]],
    ['de-DE', 1, [6, 0]],
  ])('%s starts on %i with weekend %j', (locale, firstDay, weekend) => {
    expect(getKuiWeekInfo(locale)).toEqual({ firstDay, weekend });
  });

  it('uses the static table when the engine reports no week data', () => {
    const prototype = Intl.Locale.prototype as unknown as Record<string, unknown>;
    const method = Object.getOwnPropertyDescriptor(prototype, 'getWeekInfo');
    const accessor = Object.getOwnPropertyDescriptor(prototype, 'weekInfo');

    Object.defineProperty(prototype, 'getWeekInfo', { value: undefined, configurable: true });
    Object.defineProperty(prototype, 'weekInfo', { value: undefined, configurable: true });

    try {
      expect(getKuiWeekInfo('en-US')).toEqual({ firstDay: 0, weekend: [6, 0] });
      expect(getKuiWeekInfo('he-IL')).toEqual({ firstDay: 0, weekend: [5, 6] });
      expect(getKuiWeekInfo('fa-IR')).toEqual({ firstDay: 6, weekend: [5] });
      expect(getKuiWeekInfo('ru-RU')).toEqual({ firstDay: 1, weekend: [6, 0] });
    } finally {
      if (method) Object.defineProperty(prototype, 'getWeekInfo', method);
      if (accessor) Object.defineProperty(prototype, 'weekInfo', accessor);
    }
  });
});

describe('date pattern', () => {
  it('derives the field order and separators of a locale', () => {
    expect(formatKuiDate(date(2026, 10, 3), getKuiDatePattern('en-US'))).toBe('10/03/2026');
    expect(formatKuiDate(date(2026, 10, 3), getKuiDatePattern('ru-RU'))).toBe('03.10.2026');
    expect(formatKuiDate(date(2026, 10, 3), getKuiDatePattern('ja-JP'))).toBe('2026/10/03');
    expect(formatKuiDate(date(2026, 10, 3), getKuiDatePattern('hu-HU'))).toBe('2026. 10. 03.');
  });

  it('strips bidirectional marks that some locales put around separators', () => {
    expect(formatKuiDate(date(2026, 10, 3), getKuiDatePattern('ar-SA'))).toBe('03/10/2026');
  });

  it('parses text by digit groups in the pattern order', () => {
    expect(parseKuiDate('10/03/2026', getKuiDatePattern('en-US'))).toEqual(date(2026, 10, 3));
    expect(parseKuiDate('3.10.2026', getKuiDatePattern('ru-RU'))).toEqual(date(2026, 10, 3));
    expect(parseKuiDate('2026-10-03', getKuiDatePattern('ja-JP'))).toEqual(date(2026, 10, 3));
  });

  it('rejects impossible dates, short years, wrong group counts and letters', () => {
    const ru = getKuiDatePattern('ru-RU');

    expect(parseKuiDate('31.02.2026', ru)).toBeNull();
    expect(parseKuiDate('03.13.2026', ru)).toBeNull();
    expect(parseKuiDate('03.10.26', ru)).toBeNull();
    expect(parseKuiDate('03.10', ru)).toBeNull();
    expect(parseKuiDate('03.10.2026.1', ru)).toBeNull();
    expect(parseKuiDate('03.oct.2026', ru)).toBeNull();
    expect(parseKuiDate('', ru)).toBeNull();
  });

  it('accepts a custom pattern and refuses an incomplete one', () => {
    const custom = parseKuiDatePattern('dd.MM.yyyy');

    expect(custom).not.toBeNull();
    expect(formatKuiDate(date(2026, 1, 5), custom!)).toBe('05.01.2026');
    expect(parseKuiDate('05.01.2026', custom!)).toEqual(date(2026, 1, 5));
    expect(parseKuiDatePattern('dd.MM')).toBeNull();
    expect(parseKuiDatePattern('dd.dd.yyyy')).toBeNull();
    expect(formatKuiDate(date(2026, 1, 5), parseKuiDatePattern('d/M/yyyy')!)).toBe('5/1/2026');
  });
});

describe('time pattern', () => {
  it('follows the locale hour cycle', () => {
    expect(getKuiTimePattern('en-US').hourCycle12).toBe(true);
    expect(getKuiTimePattern('ru-RU').hourCycle12).toBe(false);
    expect(getKuiTimePattern('ko-KR').hourCycle12).toBe(true);
  });

  it('reads the separator and the day period position and text', () => {
    expect(getKuiTimePattern('en-US')).toMatchObject({
      separator: ':',
      periodBefore: false,
      am: 'AM',
      pm: 'PM',
    });
    expect(getKuiTimePattern('da-DK').separator).toBe('.');
    expect(getKuiTimePattern('ja-JP')).toMatchObject({ periodBefore: true, pm: '午後' });
    expect(getKuiTimePattern('fr-CA').separator).toBe(':');
  });

  it('normalises day periods for comparison', () => {
    expect(normalizeKuiDayPeriod('p. m.')).toBe('pm');
    expect(normalizeKuiDayPeriod('PM')).toBe('pm');
  });
});

describe('resolveKuiLocale', () => {
  it('keeps a supported tag', () => {
    expect(resolveKuiLocale('ru-RU')).toBe('ru-RU');
    expect(resolveKuiLocale('de')).toBe('de');
  });

  it('canonicalises case', () => {
    expect(resolveKuiLocale('de-de')).toBe('de-DE');
  });

  it('falls back to en-US for empty, malformed and unsupported tags', () => {
    expect(resolveKuiLocale(undefined)).toBe('en-US');
    expect(resolveKuiLocale('')).toBe('en-US');
    expect(resolveKuiLocale('not a tag!')).toBe('en-US');
    expect(resolveKuiLocale('tlh')).toBe('en-US');
  });
});
