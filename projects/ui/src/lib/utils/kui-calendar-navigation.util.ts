/** Views shared by the single-date and range calendar navigation controls. */
export type KuiCalendarNavigationView = 'days' | 'months' | 'years';

/** Accessible labels for previous/next navigation at each calendar view level. */
export const KUI_CALENDAR_NAVIGATION_LABELS: Record<
  KuiCalendarNavigationView,
  { prev: string; next: string }
> = {
  days: { prev: 'Previous month', next: 'Next month' },
  months: { prev: 'Previous year', next: 'Next year' },
  years: { prev: 'Previous decade', next: 'Next decade' },
};

/** Supported calendar size values used by both calendar primitives. */
export const KUI_CALENDAR_SIZES = ['sm', 'md'] as const;
