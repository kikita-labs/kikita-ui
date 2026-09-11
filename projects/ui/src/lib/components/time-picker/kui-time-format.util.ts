import type { KuiTimePickerFormat } from './kui-time-picker.types';

/** @internal `HH:mm[:ss]` (24h) / `hh:mm[:ss] AM|PM` (12h) display formatting/parsing used by `input[kuiTimePicker]`. */

const RE_24H_HMS = /^(\d{1,2}):(\d{2}):(\d{2})$/;
const RE_24H_HM = /^(\d{1,2}):(\d{2})$/;
// The period is optional to match -- see parseDisplayTime's own doc for why an absent one
// defaults from `base` rather than failing the whole parse.
const RE_12H_HMS = /^(\d{1,2}):(\d{2}):(\d{2})\s*(AM|PM)?$/i;
const RE_12H_HM = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i;

function pad(value: number): string {
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

/** Max input length for a fully-typed value, per `format`/`showSeconds` (mirrors the spec's own `maxLen`). */
export function maxTimeInputLength(format: KuiTimePickerFormat, showSeconds: boolean): number {
  if (format === '12h') return showSeconds ? 12 : 9;
  return showSeconds ? 8 : 5;
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
  return pad(Math.min(Number(digits), max));
}

/**
 * Auto-inserts the `:` separators as the user types digits -- typing `2214` becomes `22:14`
 * without the user typing the colon themselves -- and clamps each 2-digit group to its valid
 * maximum once fully typed (hours to `23`/`12`, minutes/seconds to `59`) so e.g. typing a second
 * `5` for the hour never leaves `55` sitting in the field. Rebuilds from scratch on every
 * keystroke from just the digit count (ignoring whatever separators/period letters were already
 * there), so Backspace naturally "un-masks" too instead of getting stuck on a colon the user
 * can't delete. Caret position is not preserved (it always ends up at the end of the field after
 * a rebuild) -- a known simplification, the same category of gap as the parser's own
 * locale-less regex mask.
 */
export function autoMaskTimeInputText(
  text: string,
  format: KuiTimePickerFormat,
  showSeconds: boolean,
): string {
  // Matches a *partial* trailing period too ("A"/"P" alone, not just the complete "AM"/"PM") --
  // typing happens one keystroke at a time, and a stricter two-letter-only match would strip a
  // lone "P" right back out before the "M" ever arrives (rebuild-from-scratch means each
  // keystroke re-runs this from the previous, already-stripped result), making it impossible to
  // type the period at all. A leading space is always inserted ourselves, same as the `:`
  // separators, so the user never has to type one.
  const periodMatch = format === '12h' ? /([apAP][mM]?)\s*$/.exec(text.trimEnd()) : null;
  const period = periodMatch ? ` ${periodMatch[1].toUpperCase()}` : '';

  const maxDigits = showSeconds ? 6 : 4;
  const digits = text.replace(/[^0-9]/g, '').slice(0, maxDigits);
  const maxHour = format === '12h' ? 12 : 23;

  const hourGroup = clampDigitGroup(digits.slice(0, 2), maxHour);
  const minuteGroup = clampDigitGroup(digits.slice(2, 4), 59);
  const secondGroup = clampDigitGroup(digits.slice(4, 6), 59);

  let out = hourGroup;
  if (digits.length > 2) out += `:${minuteGroup}`;
  if (showSeconds && digits.length > 4) out += `:${secondGroup}`;

  return out + period;
}

/** Formats a `Date`'s time-of-day for display, per `format`/`showSeconds`. */
export function formatDisplayTime(
  date: Date,
  format: KuiTimePickerFormat,
  showSeconds: boolean,
): string {
  const hours = date.getHours();
  const minutes = pad(date.getMinutes());
  const seconds = showSeconds ? `:${pad(date.getSeconds())}` : '';

  if (format === '12h') {
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;
    return `${pad(hour12)}:${minutes}${seconds} ${period}`;
  }

  return `${pad(hours)}:${minutes}${seconds}`;
}

/**
 * Parses a typed time string per `format`/`showSeconds`, applying it onto `base`'s date part
 * (only the time-of-day fields change) — the same "typed text just updates the shared value's
 * relevant fields" strategy `input[kuiDatePicker]` uses for its own display mask. Returns `null`
 * for an unparsable or out-of-range string.
 *
 * The parsed hours/minutes/seconds are each snapped to the nearest `hourStep`/`minuteStep`/
 * `secondStep` -- typing an exact value the wheel's own step thins out would otherwise leave the
 * wheel with no cell selected in that column at all, silently disagreeing with what's typed.
 *
 * For `format: '12h'`, the `AM`/`PM` suffix is optional -- defaulting to `base`'s own period when
 * absent, not failing the parse. Requiring it used to mean a fully-typed `hh:mm[:ss]` (every digit
 * present and in range) sat there parsed as `null` -- invalid, uncommitted -- until the suffix was
 * typed too; interacting with the wheel or the AM/PM toggle in that window (which both act on
 * `value`, not on the not-yet-committed typed text) silently discarded the already-typed digits.
 * Defaulting the period commits those digits immediately; the AM/PM toggle then simply flips the
 * period on top of an already-correct value instead of on stale, unrelated data.
 */
export function parseDisplayTime(
  text: string,
  format: KuiTimePickerFormat,
  showSeconds: boolean,
  base: Date,
  hourStep = 1,
  minuteStep = 1,
  secondStep = 1,
): Date | null {
  const trimmed = text.trim();
  const withSecondsRe = format === '12h' ? RE_12H_HMS : RE_24H_HMS;
  const withoutSecondsRe = format === '12h' ? RE_12H_HM : RE_24H_HM;
  const match = showSeconds ? withSecondsRe.exec(trimmed) : withoutSecondsRe.exec(trimmed);
  if (!match) return null;

  let hours = Number(match[1]);
  let minutes = Number(match[2]);
  let seconds = showSeconds ? Number(match[3]) : 0;
  const typedPeriod = showSeconds ? match[4] : match[3];

  if (format === '12h') {
    if (hours < 1 || hours > 12) return null;
    // Snap in the wheel's own 1-12 domain (shifted to 0-11) before converting to 24h -- the
    // wheel's 12h cells are `range(12, hourStep).map(h => h + 1)` (`1, 4, 7, 10` for step 3),
    // snapping the already-converted 24h value against a plain 0-23 domain would not match.
    hours = nearestStepInDomain(hours - 1, hourStep, 12) + 1;
    // No typed suffix yet -- default from `base`'s existing period (see this function's doc).
    const isPm = typedPeriod ? /pm/i.test(typedPeriod) : base.getHours() >= 12;
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
