/** Localized month/weekday names and the week-start rule resolved for a given locale. */
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
}

const SUNDAY_FIRST_REGIONS = new Set(['US', 'CA', 'BR', 'JP', 'KR', 'MX', 'PH', 'IL', 'ZA', 'IN']);

const cache = new Map<string, KuiCalendarLocaleText>();

/**
 * Resolves month names, weekday names, and the first day of the week for a BCP 47
 * locale using `Intl` only — no bundled locale data. Results are cached per locale tag.
 */
export function getKuiCalendarLocaleText(locale: string): KuiCalendarLocaleText {
  const cached = cache.get(locale);
  if (cached) return cached;

  const monthLong = new Intl.DateTimeFormat(locale, { month: 'long', timeZone: 'UTC' });
  const monthShort = new Intl.DateTimeFormat(locale, { month: 'short', timeZone: 'UTC' });
  const monthsLong = Array.from({ length: 12 }, (_, i) =>
    monthLong.format(new Date(Date.UTC(2000, i, 1))),
  );
  const monthsShort = Array.from({ length: 12 }, (_, i) =>
    monthShort.format(new Date(Date.UTC(2000, i, 1))),
  );

  const firstDayOfWeek = getFirstDayOfWeek(locale);

  const weekdayLong = new Intl.DateTimeFormat(locale, { weekday: 'long', timeZone: 'UTC' });
  const weekdayShort = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone: 'UTC' });
  // 2000-01-02 (UTC) was a Sunday, so offsetting from it lands on any weekday by index.
  const weekdaysLong = Array.from({ length: 7 }, (_, i) =>
    weekdayLong.format(new Date(Date.UTC(2000, 0, 2 + ((firstDayOfWeek + i) % 7)))),
  );
  const weekdaysShort = Array.from({ length: 7 }, (_, i) =>
    weekdayShort.format(new Date(Date.UTC(2000, 0, 2 + ((firstDayOfWeek + i) % 7)))),
  );

  const text: KuiCalendarLocaleText = {
    monthsLong,
    monthsShort,
    weekdaysShort,
    weekdaysLong,
    firstDayOfWeek,
  };
  cache.set(locale, text);
  return text;
}

function getFirstDayOfWeek(locale: string): number {
  const info = (new Intl.Locale(locale) as unknown as { weekInfo?: { firstDay: number } }).weekInfo;
  if (info) return info.firstDay % 7; // Intl reports 1 (Monday)..7 (Sunday); Sunday % 7 === 0.

  // `Intl.Locale#weekInfo` isn't available everywhere yet (older engines) — fall back to a
  // small allowlist of Sunday-first regions; everything else defaults to Monday-first.
  const region = new Intl.Locale(locale).maximize().region;
  return region && SUNDAY_FIRST_REGIONS.has(region) ? 0 : 1;
}
