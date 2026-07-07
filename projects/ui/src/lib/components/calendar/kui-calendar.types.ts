/** Selection mode for `kui-calendar`. */
export type KuiCalendarMode = 'single' | 'range';

/** Visual density of `kui-calendar`. `sm` is a compact variant for sidebars/filters. */
export type KuiCalendarSize = 'md' | 'sm';

/**
 * A date range selection. `end` is `null` while the range is still open (only the
 * start date has been picked).
 */
export interface KuiDateRange {
  start: Date;
  end: Date | null;
}

/** Value shape of `kui-calendar`, depending on {@link KuiCalendarMode}. */
export type KuiCalendarValue = Date | KuiDateRange | null;

/** Predicate used by the `disabledDates` input. */
export type KuiCalendarDisabledPredicate = (date: Date) => boolean;
