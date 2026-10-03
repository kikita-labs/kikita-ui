import {
  collapseKuiSpaces,
  type KuiTimePattern,
  normalizeKuiDayPeriod,
} from '../../i18n/kui-intl.util';
import type { KuiTimePickerFormat } from './kui-time-picker.types';

/**
 * @internal
 * Display, parsing and typing mask of `input[kuiTimePicker]`: `HH<sep>mm[<sep>ss]` for `'24h'` and
 * the same digits plus the locale's own day period for `'12h'`. The separator, the day period text
 * and its position come from the locale's {@link KuiTimePattern}; digits are always Latin.
 */

/** Formats a time field as a two-digit decimal value. */
export function formatTwoDigits(value: number): string {
  return String(value).padStart(2, '0');
}

/**
 * Snaps `value` (0-59) to the nearest multiple of `step` -- used for both "Now" (a real
 * minute/second that may not land on a thinned-out `minuteStep`/`secondStep` wheel cell) and a
 * typed minute/second (typing an exact value the wheel doesn't render is otherwise a value with
 * no selected cell in its own column -- confusing, since the wheel and the typed value would
 * silently disagree about what's selected).
 */
export function nearestStep(value: number, step: number): number {
  return nearestStepInDomain(value, step, 60);
}

/**
 * Snaps `value` (0 to `domainSize - 1`) to the nearest multiple of `step` within that domain --
 * the general form `nearestStep` (60-value minute/second domain) is built on. Also used for
 * hours: the wheel's own hour cells are generated the same way (`0, step, 2*step, ...` up to 24,
 * or up to 12 for the 12h format's 1-12 domain, shifted by one), so snapping here against the
 * matching domain size keeps a typed hour landing on an actual rendered wheel cell.
 */
function nearestStepInDomain(value: number, step: number, domainSize: number): number {
  if (step <= 1) return value;
  const values: number[] = [];
  for (let v = 0; v < domainSize; v += step) values.push(v);
  return values.reduce((best, v) => (Math.abs(v - value) < Math.abs(best - value) ? v : best));
}

/** Max input length for a fully-typed value, per `format`/`showSeconds` and the locale's day period text. */
export function maxTimeInputLength(
  format: KuiTimePickerFormat,
  showSeconds: boolean,
  pattern: KuiTimePattern,
): number {
  const digits = showSeconds ? 8 : 5;
  if (format !== '12h') return digits;

  // One extra character, so a user can type a letter after a complete value and have the mask
  // resolve it, as the fixed `hh:mm AM` + 1 limit did.
  return digits + pattern.periodGap.length + Math.max(pattern.am.length, pattern.pm.length) + 1;
}

/**
 * Clamps a (possibly still-partial) 2-digit group to `max` once both digits are typed -- e.g.
 * typing a second `5` for the hour group in 24h format becomes `23`, not `55`. Left alone below
 * two digits: a lone `5` is still a valid prefix (of `05`..`09`, say) and shouldn't jump to a
 * clamped value before the user has finished typing the group. No lower-bound clamp (e.g. `00`
 * for a 12h hour) -- that's still caught by `parseDisplayTime`'s own range check same as before.
 */
function clampDigitGroup(digits: string, max: number): string {
  if (digits.length < 2) return digits;
  return formatTwoDigits(Math.min(Number(digits), max));
}

/** The day period words a user may type: the locale's own and the ASCII `am`/`pm`. */
function periodCandidates(pattern: KuiTimePattern): readonly [text: string, pm: boolean][] {
  return [
    [pattern.am, false],
    [pattern.pm, true],
    ['am', false],
    ['pm', true],
  ];
}

/** Splits typed text into its day period letters and everything else. */
function splitPeriod(text: string): { period: string; rest: string } {
  const letters = text.match(/\p{L}[\p{L}.]*(?:\s+\p{L}[\p{L}.]*)*/gu);
  const period = (letters ?? []).join(' ');
  const rest = text.replace(/\p{L}[\p{L}.]*/gu, '');

  return { period: collapseKuiSpaces(period).trim(), rest };
}

/**
 * Resolves typed period letters. The longest trailing part of the letters that is a prefix of a
 * period wins, so a stray earlier period (a value that already read `AM` followed by a typed `P`)
 * is dropped. The result is the canonical locale text when that part matches a period completely,
 * the letters as typed while it is still a prefix, and nothing otherwise.
 */
function resolvePeriodText(typed: string, pattern: KuiTimePattern): string {
  for (let start = 0; start < typed.length; start++) {
    const part = typed.slice(start);
    const normalized = normalizeKuiDayPeriod(part);
    if (!normalized) continue;

    for (const [text, pm] of periodCandidates(pattern)) {
      if (normalizeKuiDayPeriod(text) === normalized) return pm ? pattern.pm : pattern.am;
    }

    const isPrefix = periodCandidates(pattern).some(([text]) =>
      normalizeKuiDayPeriod(text).startsWith(normalized),
    );

    if (isPrefix) return part;
  }

  return '';
}

/**
 * Auto-inserts the locale's separator as the user types digits -- typing `2214` becomes `22:14`
 * without the user typing the separator themselves -- and clamps each 2-digit group to its valid
 * maximum once fully typed (hours to `23`/`12`, minutes/seconds to `59`) so e.g. typing a second
 * `5` for the hour never leaves `55` sitting in the field. Rebuilds from scratch on every
 * keystroke from just the digit count (ignoring whatever separators were already there), so
 * Backspace naturally "un-masks" too instead of getting stuck on a separator the user can't
 * delete. For `'12h'` the typed letters are kept while they can still become the locale's `AM` or
 * `PM` text (or the ASCII `am`/`pm`), and are replaced by the locale's text once complete. Caret
 * position is not preserved (it always ends up at the end of the field after a rebuild).
 */
export function autoMaskTimeInputText(
  text: string,
  format: KuiTimePickerFormat,
  showSeconds: boolean,
  pattern: KuiTimePattern,
): string {
  const split = format === '12h' ? splitPeriod(text) : { period: '', rest: text };
  const period = format === '12h' ? resolvePeriodText(split.period, pattern) : '';

  const maxDigits = showSeconds ? 6 : 4;
  const digits = split.rest.replace(/[^0-9]/g, '').slice(0, maxDigits);
  const maxHour = format === '12h' ? 12 : 23;

  const hourGroup = clampDigitGroup(digits.slice(0, 2), maxHour);
  const minuteGroup = clampDigitGroup(digits.slice(2, 4), 59);
  const secondGroup = clampDigitGroup(digits.slice(4, 6), 59);

  let time = hourGroup;
  if (digits.length > 2) time += `${pattern.separator}${minuteGroup}`;
  if (showSeconds && digits.length > 4) time += `${pattern.separator}${secondGroup}`;

  if (!period) return time;

  return pattern.periodBefore
    ? `${period}${digits ? pattern.periodGap : ''}${time}`
    : `${time}${pattern.periodGap}${period}`;
}

/** Formats a `Date`'s time-of-day for display, per `format`/`showSeconds` and the locale pattern. */
export function formatDisplayTime(
  date: Date,
  format: KuiTimePickerFormat,
  showSeconds: boolean,
  pattern: KuiTimePattern,
): string {
  const hours = date.getHours();
  const minutes = formatTwoDigits(date.getMinutes());
  const seconds = showSeconds ? `${pattern.separator}${formatTwoDigits(date.getSeconds())}` : '';

  if (format === '12h') {
    const period = hours >= 12 ? pattern.pm : pattern.am;
    const hour12 = formatTwoDigits(hours % 12 === 0 ? 12 : hours % 12);
    const time = `${hour12}${pattern.separator}${minutes}${seconds}`;

    return pattern.periodBefore
      ? `${period}${pattern.periodGap}${time}`
      : `${time}${pattern.periodGap}${period}`;
  }

  return `${formatTwoDigits(hours)}${pattern.separator}${minutes}${seconds}`;
}

/**
 * Parses a typed time string per `format`/`showSeconds`, applying it onto `base`'s date part
 * (only the time-of-day fields change) — the same "typed text just updates the shared value's
 * relevant fields" strategy `input[kuiDatePicker]` uses for its own display mask. Returns `null`
 * for an unparsable or out-of-range string.
 *
 * Separators are not compared: the text must hold the right number of digit groups (hours of one
 * or two digits, minutes and seconds of two). The parsed hours/minutes/seconds are each snapped to
 * the nearest `hourStep`/`minuteStep`/`secondStep` -- typing an exact value the wheel's own step
 * thins out would otherwise leave the wheel with no cell selected in that column at all.
 *
 * For `format: '12h'`, the day period is optional -- defaulting to `base`'s own period when
 * absent, not failing the parse. Requiring it used to mean a fully-typed value sat there parsed as
 * `null` -- invalid, uncommitted -- until the period was typed too; interacting with the wheel or
 * the period toggle in that window silently discarded the already-typed digits. A present period
 * must be the locale's own `AM`/`PM` text or the ASCII `am`/`pm`.
 */
export function parseDisplayTime(
  text: string,
  format: KuiTimePickerFormat,
  showSeconds: boolean,
  base: Date,
  pattern: KuiTimePattern,
  hourStep = 1,
  minuteStep = 1,
  secondStep = 1,
): Date | null {
  const split = splitPeriod(collapseKuiSpaces(text).trim());
  const groups = split.rest.match(/\d+/g);
  const expected = showSeconds ? 3 : 2;

  if (!groups || groups.length !== expected) return null;
  if (groups[0].length > 2 || groups.slice(1).some((group) => group.length !== 2)) return null;
  if (format !== '12h' && split.period) return null;

  let hours = Number(groups[0]);
  let minutes = Number(groups[1]);
  let seconds = showSeconds ? Number(groups[2]) : 0;

  if (format === '12h') {
    if (hours < 1 || hours > 12) return null;

    let isPm = base.getHours() >= 12;
    if (split.period) {
      const normalized = normalizeKuiDayPeriod(split.period);
      const match = periodCandidates(pattern).find(
        ([candidate]) => normalizeKuiDayPeriod(candidate) === normalized,
      );
      if (!match) return null;
      isPm = match[1];
    }

    // Snap in the wheel's own 1-12 domain (shifted to 0-11) before converting to 24h -- the
    // wheel's 12h cells are `range(12, hourStep).map(h => h + 1)` (`1, 4, 7, 10` for step 3),
    // snapping the already-converted 24h value against a plain 0-23 domain would not match.
    hours = nearestStepInDomain(hours - 1, hourStep, 12) + 1;
    hours = hours % 12;
    if (isPm) hours += 12;
  } else if (hours < 0 || hours > 23) {
    return null;
  } else {
    hours = nearestStepInDomain(hours, hourStep, 24);
  }

  if (minutes < 0 || minutes > 59) return null;
  if (seconds < 0 || seconds > 59) return null;

  minutes = nearestStep(minutes, minuteStep);
  if (showSeconds) seconds = nearestStep(seconds, secondStep);

  const result = new Date(base);
  result.setHours(hours, minutes, seconds, 0);
  return result;
}
