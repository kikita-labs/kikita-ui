/** @internal Date-only (no time-of-day) helpers used by `kui-calendar`. */

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date | null, b: Date | null): boolean {
  return (
    !!a &&
    !!b &&
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isBeforeDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() < startOfDay(b).getTime();
}

export function isAfterDay(a: Date, b: Date): boolean {
  return startOfDay(a).getTime() > startOfDay(b).getTime();
}

export function addDays(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

export function addMonths(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + amount);
  return result;
}

export function addYears(date: Date, amount: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + amount);
  return result;
}

export function daysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

/** Index (0-based) of `date` within a week that starts on `firstDayOfWeek` (0 = Sunday). */
export function weekdayIndex(date: Date, firstDayOfWeek: number): number {
  return (date.getDay() - firstDayOfWeek + 7) % 7;
}

export function startOfWeek(date: Date, firstDayOfWeek: number): Date {
  return addDays(date, -weekdayIndex(date, firstDayOfWeek));
}

export function decadeStart(year: number): number {
  return Math.floor((year - 1) / 10) * 10 + 1;
}
