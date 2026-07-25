/** Visual density of `kui-calendar` / `kui-calendar-range`. `sm` is a compact variant for sidebars/filters. */
export type KuiCalendarSize = 'md' | 'sm';

/**
 * A date range selection, the value shape of `kui-calendar-range`. `end` is `null` while the
 * range is still open (only the start date has been picked).
 */
export interface KuiDateRange {
  start: Date;
  end: Date | null;
}

/** Predicate used by the `disabledDates` input on `kui-calendar` / `kui-calendar-range`. */
export type KuiCalendarDisabledPredicate = (date: Date) => boolean;
