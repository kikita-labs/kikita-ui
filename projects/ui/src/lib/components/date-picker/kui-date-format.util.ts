/** @internal `dd.MM.yyyy` display formatting/parsing used by `input[kuiDatePicker]`. */

const DISPLAY_RE = /^(\d{2})\.(\d{2})\.(\d{4})$/;

export function formatDisplayDate(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}

export function parseDisplayDate(text: string): Date | null {
  const match = DISPLAY_RE.exec(text.trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12) return null;

  const daysInMonth = new Date(year, month, 0).getDate();
  if (day < 1 || day > daysInMonth) return null;

  return new Date(year, month - 1, day);
}
