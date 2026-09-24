/** @internal `dd.MM.yyyy` display formatting/parsing used by `input[kuiDatePicker]`. */

const DISPLAY_RE = /^(\d{2})\.(\d{2})\.(\d{4})$/;

export function formatDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  const displayYear = year < 0 ? String(year) : String(year).padStart(4, '0');
  return `${day}.${month}.${displayYear}`;
}

export function parseDisplayDate(text: string): Date | null {
  const match = DISPLAY_RE.exec(text.trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12) return null;

  const lastDayOfMonth = new Date(0);
  lastDayOfMonth.setFullYear(year, month, 0);
  const daysInMonth = lastDayOfMonth.getDate();
  if (day < 1 || day > daysInMonth) return null;

  const parsedDate = new Date(0);
  parsedDate.setFullYear(year, month - 1, day);
  parsedDate.setHours(0, 0, 0, 0);

  return parsedDate;
}
