import type { KuiIconGlyph } from '../icon/kui-icon-glyph.type';
import type { KuiCalendarSize } from './kui-calendar.types';

/** View defaults shared by `kui-calendar` and `kui-calendar-range`. */
export interface KuiCalendarViewOptions {
  /** Calendar size. Takes precedence over the global `defaults.size`. */
  readonly size?: KuiCalendarSize;

  /** Strips the calendar's own background, border and padding. */
  readonly flat?: boolean;

  /** Shows Saturday and Sunday in a muted colour. */
  readonly showWeekend?: boolean;

  /** Shows the footer with the current value and the "Today" shortcut. */
  readonly showFooter?: boolean;

  /** Shows the "previous" navigation control in the header. */
  readonly showPrevNav?: boolean;

  /** Shows the "next" navigation control in the header. */
  readonly showNextNav?: boolean;
  /** Icon of the previous-month button. Takes precedence over `defaults.icons.previous`. */
  readonly previousIcon?: KuiIconGlyph;

  /** Icon of the next-month button. Takes precedence over `defaults.icons.next`. */
  readonly nextIcon?: KuiIconGlyph;
}

/** Defaults for `kui-calendar`, set under the `calendar` key of the component defaults. */
export type KuiCalendarOptions = KuiCalendarViewOptions;

/** Defaults for `kui-calendar-range`, set under the `calendarRange` key of the component defaults. */
export type KuiCalendarRangeOptions = KuiCalendarViewOptions;
