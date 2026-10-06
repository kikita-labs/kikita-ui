/**
 * @internal
 * Pure `Intl` helpers shared by the date and time controls. Every formatter is built from a locale
 * forced to the Gregorian calendar and Latin digits, because the controls work on `Date` values and
 * on text the user types, and both assume that calendar and those digits.
 */

const BIDI_MARKS = /[‎‏؜]/g;

/** A resolved week rule: `firstDay` and `weekend` days are `0` (Sunday) to `6` (Saturday). */
export interface KuiWeekInfo {
  readonly firstDay: number;
  readonly weekend: readonly number[];
}

/** One element of a date or time layout: a field or the literal text between fields. */
export type KuiPatternPart =
  | { readonly type: 'day' | 'month' | 'year'; readonly width: 1 | 2 | 4 }
  | { readonly type: 'literal'; readonly value: string };

/** Field order and separators of a numeric date such as `dd.MM.yyyy`. */
export interface KuiDatePattern {
  readonly parts: readonly KuiPatternPart[];
}

/** Separator, day period position and 12 or 24 hour default of a time of day. */
export interface KuiTimePattern {
  readonly separator: string;
  readonly hourCycle12: boolean;
  readonly periodBefore: boolean;
  readonly periodGap: string;
  readonly am: string;
  readonly pm: string;
}

type WeekRow = readonly [firstDay: number, weekend: readonly number[]];

/*
 * Static fallback for engines without `Intl.Locale#getWeekInfo()` and the legacy `weekInfo`
 * accessor. Only regions that differ from the default (Monday first, Saturday and Sunday weekend)
 * are listed. Generated from ICU 78 / CLDR 48 and compared with the live engine in a unit test.
 */
const WEEK_ROWS: readonly (readonly [regions: string, row: WeekRow])[] = [
  [
    'AG AS BD BR BS BT BU BW BZ CA CO DM DO ET GT GU HK HN ID IS JM JP KE KH KR LA MH MM MO MT MX MZ NI NP PA PE PH PK PR PT PY RH SG SV TH TT TW UM US VE VI WS ZA ZW',
    [7, [6, 7]],
  ],
  ['IL SA YD YE', [7, [5, 6]]],
  ['IN', [7, [7]]],
  ['AF', [6, [4, 5]]],
  ['BH DZ EG IQ JO KW LY OM QA SD SY', [6, [5, 6]]],
  ['DJ', [6, [6, 7]]],
  ['IR', [6, [5]]],
  ['MV', [5, [6, 7]]],
  ['UG', [1, [7]]],
];

let weekByRegion: ReadonlyMap<string, WeekRow> | undefined;

/** Week rows by region, built on first use so that merely importing the module costs nothing. */
function getWeekByRegion(): ReadonlyMap<string, WeekRow> {
  weekByRegion ??= new Map<string, WeekRow>(
    WEEK_ROWS.flatMap(([regions, row]) =>
      regions.split(' ').map((region) => [region, row] as const),
    ),
  );

  return weekByRegion;
}

const DEFAULT_WEEK: WeekRow = [1, [6, 7]];

interface WeekInfoShape {
  readonly firstDay: number;
  readonly weekend: readonly number[];
}

interface WeekAwareLocale {
  getWeekInfo?: () => WeekInfoShape;
  readonly weekInfo?: WeekInfoShape;
}

/** Builds an `Intl.Locale` forced to the Gregorian calendar and Latin digits. */
export function createKuiIntlLocale(tag: string): Intl.Locale {
  return new Intl.Locale(tag, { calendar: 'gregory', numberingSystem: 'latn' });
}

/** Maps ISO 8601 weekday numbers (`1` Monday to `7` Sunday) to `0` (Sunday) to `6`. */
function toSundayZero(day: number): number {
  return day % 7;
}

/**
 * Week rules of a locale: the first day and the weekend days.
 *
 * Order of sources: `getWeekInfo()` (standard), the legacy `weekInfo` accessor, then a static table
 * keyed by the locale's likely region.
 */
export function getKuiWeekInfo(tag: string): KuiWeekInfo {
  const locale = createKuiIntlLocale(tag);
  const aware = locale as unknown as WeekAwareLocale;
  const info = aware.getWeekInfo?.() ?? aware.weekInfo;

  if (info) {
    return {
      firstDay: toSundayZero(info.firstDay),
      weekend: info.weekend.map(toSundayZero),
    };
  }

  const region = locale.region ?? locale.maximize().region;
  const [firstDay, weekend] = (region ? getWeekByRegion().get(region) : undefined) ?? DEFAULT_WEEK;

  return { firstDay: toSundayZero(firstDay), weekend: weekend.map(toSundayZero) };
}

/** Removes the invisible bidirectional marks that some locales put around separators. */
function stripKuiBidiMarks(text: string): string {
  return text.replace(BIDI_MARKS, '');
}

/** Derives the numeric date layout of a locale from `Intl.DateTimeFormat#formatToParts`. */
export function getKuiDatePattern(tag: string): KuiDatePattern {
  const parts = new Intl.DateTimeFormat(createKuiIntlLocale(tag), {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  }).formatToParts(Date.UTC(2026, 9, 3));

  const pattern: KuiPatternPart[] = [];
  for (const part of parts) {
    if (part.type === 'day' || part.type === 'month') {
      pattern.push({ type: part.type, width: 2 });
    } else if (part.type === 'year') {
      pattern.push({ type: 'year', width: 4 });
    } else if (part.type === 'literal') {
      pattern.push({ type: 'literal', value: stripKuiBidiMarks(part.value) });
    }
  }

  return { parts: pattern };
}

const PATTERN_TOKEN = /(d{1,2}|M{1,2}|y{4})|([^dMy]+)/g;

/**
 * Parses a custom date pattern made of `d`/`dd`, `M`/`MM` and `yyyy` tokens plus literal text.
 * Returns `null` when it does not contain each of day, month and year exactly once.
 */
export function parseKuiDatePattern(pattern: string): KuiDatePattern | null {
  const parts: KuiPatternPart[] = [];
  const seen = new Set<string>();

  for (const match of pattern.matchAll(PATTERN_TOKEN)) {
    const [, token, literal] = match;
    if (literal !== undefined) {
      parts.push({ type: 'literal', value: literal });
      continue;
    }

    const type = token.startsWith('d') ? 'day' : token.startsWith('M') ? 'month' : 'year';
    if (seen.has(type)) return null;
    seen.add(type);
    parts.push({ type, width: token.length === 1 ? 1 : (token.length as 2 | 4) });
  }

  return seen.size === 3 ? { parts } : null;
}

/** Formats a date with a layout: numeric fields with the layout's widths and its literals. */
export function formatKuiDate(date: Date, pattern: KuiDatePattern): string {
  const year = date.getFullYear();

  return pattern.parts
    .map((part) => {
      if (part.type === 'literal') return part.value;
      if (part.type === 'year') {
        return year < 0 ? String(year) : String(year).padStart(part.width, '0');
      }

      const value = part.type === 'day' ? date.getDate() : date.getMonth() + 1;
      return String(value).padStart(part.width, '0');
    })
    .join('');
}

/**
 * Parses typed text with a layout. Separators are not compared: the text must hold three digit
 * groups in the layout's order, day and month of one or two digits, and a four digit year.
 */
export function parseKuiDate(text: string, pattern: KuiDatePattern): Date | null {
  const clean = stripKuiBidiMarks(text).trim();
  const groups = clean.match(/\d+/g);
  const fields = pattern.parts.filter((part) => part.type !== 'literal');

  if (!groups || groups.length !== fields.length || /\p{L}/u.test(clean)) return null;

  const values = new Map<string, string>();
  fields.forEach((field, index) => values.set(field.type, groups[index]));

  const dayText = values.get('day') ?? '';
  const monthText = values.get('month') ?? '';
  const yearText = values.get('year') ?? '';
  if (dayText.length > 2 || monthText.length > 2 || yearText.length !== 4) return null;

  const day = Number(dayText);
  const month = Number(monthText);
  const year = Number(yearText);
  if (month < 1 || month > 12) return null;

  const lastDayOfMonth = new Date(0);
  lastDayOfMonth.setFullYear(year, month, 0);
  if (day < 1 || day > lastDayOfMonth.getDate()) return null;

  const parsed = new Date(0);
  parsed.setFullYear(year, month - 1, day);
  parsed.setHours(0, 0, 0, 0);

  return parsed;
}

/** Derives the time layout of a locale: separator, day period position and strings, default cycle. */
export function getKuiTimePattern(tag: string): KuiTimePattern {
  const locale = createKuiIntlLocale(tag);
  const resolved = new Intl.DateTimeFormat(locale, { hour: 'numeric' }).resolvedOptions();
  const hourCycle12 = resolved.hourCycle === 'h12' || resolved.hourCycle === 'h11';

  const twelve = new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h12',
    timeZone: 'UTC',
  });
  const parts = twelve.formatToParts(Date.UTC(2026, 9, 3, 3, 4));
  const hourIndex = parts.findIndex((part) => part.type === 'hour');
  const periodIndex = parts.findIndex((part) => part.type === 'dayPeriod');
  const between = parts[hourIndex + 1];
  const literal = between?.type === 'literal' ? stripKuiBidiMarks(between.value) : ':';

  const periodOf = (hour: number): string =>
    collapseKuiSpaces(
      twelve.formatToParts(Date.UTC(2026, 9, 3, hour, 4)).find((part) => part.type === 'dayPeriod')
        ?.value ?? '',
    );
  const periodBefore = periodIndex !== -1 && periodIndex < hourIndex;
  const gapPart = periodBefore ? parts[periodIndex + 1] : parts[periodIndex - 1];
  const periodGap =
    periodIndex !== -1 && gapPart?.type === 'literal' ? collapseKuiSpaces(gapPart.value) : ' ';

  return {
    separator: literal === '.' || literal === ':' ? literal : ':',
    hourCycle12,
    periodBefore,
    periodGap,
    am: periodOf(3),
    pm: periodOf(15),
  };
}

/** Replaces every kind of space (no-break, narrow no-break) with a plain space. */
export function collapseKuiSpaces(text: string): string {
  return stripKuiBidiMarks(text).replace(/\s/g, ' ');
}

/** Normalises a day period for comparison: lowercase, no dots, no spaces. */
export function normalizeKuiDayPeriod(text: string): string {
  return stripKuiBidiMarks(text).toLowerCase().replace(/[.\s]/g, '');
}
