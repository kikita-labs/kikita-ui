/** Builds a fixed local time-of-day value on a fixed date so examples never depend on the wall clock. */
export function createPickerTime(hours: number, minutes: number, seconds = 0): Date {
  return new Date(2026, 4, 14, hours, minutes, seconds);
}
