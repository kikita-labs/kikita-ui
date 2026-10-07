import { createKuiIntlLocale, getKuiWeekInfo } from './kui-intl.util';

/** Localized month/weekday names and the week rule resolved for a given locale. */
export interface KuiCalendarLocaleText {
  /** Full month names, January-first order (index 0 = January). */
  monthsLong: readonly string[];
  /** Abbreviated month names, January-first order (index 0 = January). */
  monthsShort: readonly string[];
  /** Abbreviated weekday names, ordered starting from {@link firstDayOfWeek}. */
  weekdaysShort: readonly string[];
  /** Full weekday names, ordered starting from {@link firstDayOfWeek}. */
  weekdaysLong: readonly string[];
  /** `0` (Sunday) through `6` (Saturday) — first day of the week for this locale. */
  firstDayOfWeek: number;
  /** Weekend days of this locale, each `0` (Sunday) through `6` (Saturday). */
  weekend: readonly number[];
}

/**
 * Resolves month names, weekday names, the first day of the week and the weekend for a BCP 47
 * locale using `Intl` only — no bundled locale data. Names use the Gregorian calendar.
 *
 * The function is pure and keeps no cache; callers that render often memoize per locale.
 */
export function getKuiCalendarLocaleText(locale: string): KuiCalendarLocaleText {
  const intlLocale = createKuiIntlLocale(locale);
  const monthLong = new Intl.DateTimeFormat(intlLocale, { month: 'long', timeZone: 'UTC' });
  const monthShort = new Intl.DateTimeFormat(intlLocale, { month: 'short', timeZone: 'UTC' });
  const monthsLong = Array.from({ length: 12 }, (_, i) =>
    monthLong.format(new Date(Date.UTC(2000, i, 1))),
  );
  const monthsShort = Array.from({ length: 12 }, (_, i) =>
    monthShort.format(new Date(Date.UTC(2000, i, 1))),
  );

  const { firstDay: firstDayOfWeek, weekend } = getKuiWeekInfo(locale);

  const weekdayLong = new Intl.DateTimeFormat(intlLocale, { weekday: 'long', timeZone: 'UTC' });
  const weekdayShort = new Intl.DateTimeFormat(intlLocale, { weekday: 'short', timeZone: 'UTC' });
  // 2000-01-02 (UTC) was a Sunday, so offsetting from it lands on any weekday by index.
  const weekdaysLong = Array.from({ length: 7 }, (_, i) =>
    weekdayLong.format(new Date(Date.UTC(2000, 0, 2 + ((firstDayOfWeek + i) % 7)))),
  );
  const weekdaysShort = Array.from({ length: 7 }, (_, i) =>
    weekdayShort.format(new Date(Date.UTC(2000, 0, 2 + ((firstDayOfWeek + i) % 7)))),
  );

  return { monthsLong, monthsShort, weekdaysShort, weekdaysLong, firstDayOfWeek, weekend };
}
