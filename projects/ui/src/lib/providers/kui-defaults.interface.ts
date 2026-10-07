import type { KuiAccordionOptions } from '../components/accordion/kui-accordion-options.interface';
import type { KuiAlertOptions } from '../components/alert/kui-alert-options.interface';
import type { KuiAvatarGroupOptions } from '../components/avatar/kui-avatar-group-options.interface';
import type { KuiAvatarOptions } from '../components/avatar/kui-avatar-options.interface';
import type { KuiBadgeOptions } from '../components/badge/kui-badge-options.interface';
import type { KuiBreadcrumbsOptions } from '../components/breadcrumbs/kui-breadcrumbs-options.interface';
import type {
  KuiButtonOptions,
  KuiIconButtonOptions,
} from '../components/button/kui-button-options.interface';
import type {
  KuiCalendarOptions,
  KuiCalendarRangeOptions,
} from '../components/calendar/kui-calendar-options.interface';
import type { KuiCardOptions } from '../components/card/kui-card-options.interface';
import type { KuiCarouselOptions } from '../components/carousel/kui-carousel-options.interface';
import type { KuiBarChartOptions } from '../components/chart/kui-chart-options.interface';
import type { KuiDonutChartOptions } from '../components/chart/kui-chart-options.interface';
import type { KuiLineChartOptions } from '../components/chart/kui-chart-options.interface';
import type { KuiScatterChartOptions } from '../components/chart/kui-chart-options.interface';
import type { KuiCheckboxOptions } from '../components/checkbox/kui-checkbox-options.interface';
import type { KuiChipOptions } from '../components/chip/kui-chip-options.interface';
import type { KuiColorInputOptions } from '../components/color-input/kui-color-input-options.interface';
import type { KuiComboboxOptions } from '../components/combobox/kui-combobox-options.interface';
import type { KuiDatePickerOptions } from '../components/date-picker/kui-date-picker-options.interface';
import type { KuiDialogOptions } from '../components/dialog/kui-dialog-options.interface';
import type { KuiDrawerOptions } from '../components/drawer/kui-drawer-options.interface';
import type { KuiDropdownOptions } from '../components/dropdown/kui-dropdown-options.interface';
import type { KuiEmptyStateOptions } from '../components/empty-state/kui-empty-state-options.interface';
import type { KuiFieldOptions } from '../components/field/kui-field-options.interface';
import type { KuiFileUploadOptions } from '../components/file-upload/kui-file-upload-options.interface';
import type { KuiGroupOptions } from '../components/group/kui-group-options.interface';
import type { KuiIconsOptions } from '../components/icon/kui-icons-options.interface';
import type { KuiInputOptions } from '../components/input/kui-input-options.interface';
import type { KuiLinkOptions } from '../components/link/kui-link-options.interface';
import type { KuiLoaderOptions } from '../components/loader/kui-loader-options.interface';
import type { KuiMenuOptions } from '../components/menu/kui-menu-options.interface';
import type { KuiNumberInputOptions } from '../components/number-input/kui-number-input-options.interface';
import type { KuiOtpInputOptions } from '../components/otp-input/kui-otp-input-options.interface';
import type { KuiPaginationOptions } from '../components/pagination/kui-pagination-options.interface';
import type { KuiPopoverOptions } from '../components/popover/kui-popover-options.interface';
import type { KuiProgressOptions } from '../components/progress/kui-progress-options.interface';
import type { KuiRadioOptions } from '../components/radio/kui-radio-options.interface';
import type { KuiSegmentedOptions } from '../components/segmented/kui-segmented-options.interface';
import type { KuiSelectOptions } from '../components/select/kui-select-options.interface';
import type { KuiSeparatorOptions } from '../components/separator/kui-separator-options.interface';
import type { KuiSkeletonOptions } from '../components/skeleton/kui-skeleton-options.interface';
import type { KuiSliderOptions } from '../components/slider/kui-slider-options.interface';
import type { KuiSplitterOptions } from '../components/splitter/kui-splitter-options.interface';
import type { KuiStepperOptions } from '../components/stepper/kui-stepper-options.interface';
import type { KuiSwitchOptions } from '../components/switch/kui-switch-options.interface';
import type { KuiTableOptions } from '../components/table/kui-table-options.interface';
import type { KuiTabsOptions } from '../components/tabs/kui-tabs-options.interface';
import type { KuiTextareaOptions } from '../components/textarea/kui-textarea-options.interface';
import type { KuiTimePickerOptions } from '../components/time-picker/kui-time-picker-options.interface';
import type { KuiToastOptions } from '../components/toast/kui-toast.types';
import type { KuiTooltipOptions } from '../components/tooltip/kui-tooltip-options.interface';
import type { KuiTreeOptions } from '../components/tree/kui-tree-options.interface';
import type { KuiTypographyOptions } from '../components/typography/kui-typography-options.interface';
import type { KuiSize } from '../types';
import type { KuiDefaultsInput } from './kui-defaults-layer.util';

/**
 * Every default a consumer can set for Kikita UI, one key per primitive.
 *
 * Each key points to a named options interface, so the map stays flat. `size` is the global control
 * size that every size-enabled primitive falls back to when neither the local input nor the
 * component key sets one.
 *
 * Options are merged per key and per property across injector levels: an omitted or `undefined`
 * property inherits from the parent, while `false`, `0` and `''` override it.
 */
export interface KuiComponentDefaults {
  /** Global control size used by size-enabled primitives that have no narrower setting. */
  readonly size?: KuiSize;

  /** Structural icons shared by the library: close, chevrons, status marks. See {@link KuiIconsOptions}. */
  readonly icons?: KuiIconsOptions;

  /** Defaults for `kuiButton`. */
  readonly button?: KuiButtonOptions;

  /** Defaults for `kuiIconButton`. */
  readonly iconButton?: KuiIconButtonOptions;

  /** Defaults for `kui-field` and the controls inside it. */
  readonly field?: KuiFieldOptions;

  /** Defaults for `kuiSelect`. */
  readonly select?: KuiSelectOptions;

  /** Defaults for `kuiCombobox`. */
  readonly combobox?: KuiComboboxOptions;

  /** Defaults for dialogs opened with `kuiDialog`. */
  readonly dialog?: KuiDialogOptions;

  /** Defaults for drawers opened with `kuiDrawer`. */
  readonly drawer?: KuiDrawerOptions;

  /** Defaults for `kui-popover`. */
  readonly popover?: KuiPopoverOptions;

  /** Defaults for `kui-menu`. */
  readonly menu?: KuiMenuOptions;

  /** Defaults for `kui-dropdown`. */
  readonly dropdown?: KuiDropdownOptions;

  /** Defaults for `kui-calendar`. */
  readonly calendar?: KuiCalendarOptions;

  /** Defaults for `kui-calendar-range`. */
  readonly calendarRange?: KuiCalendarRangeOptions;

  /** Defaults for `kui-carousel`. */
  readonly carousel?: KuiCarouselOptions;

  /** Defaults for `kui-pagination`. */
  readonly pagination?: KuiPaginationOptions;

  /** Defaults for `kui-splitter` and its panes. */
  readonly splitter?: KuiSplitterOptions;

  /** Defaults for `[kuiText]`. */
  readonly typography?: KuiTypographyOptions;

  /** Defaults for `kuiDatePicker`. */
  readonly datePicker?: KuiDatePickerOptions;

  /** Defaults for `kuiTimePicker`. */
  readonly timePicker?: KuiTimePickerOptions;

  /** Defaults for `kuiTooltip`. */
  readonly tooltip?: KuiTooltipOptions;

  /** Defaults for toasts opened through `kuiToast`. Region options are read once, on first use. */
  readonly toast?: KuiToastOptions;

  /** Defaults for `[kuiBadge]`. */
  readonly badge?: KuiBadgeOptions;

  /** Defaults for `ol[kuiBreadcrumbs]`. */
  readonly breadcrumbs?: KuiBreadcrumbsOptions;

  /** Defaults for `[kuiChip]`. */
  readonly chip?: KuiChipOptions;

  /** Defaults for `kui-empty-state`. */
  readonly emptyState?: KuiEmptyStateOptions;

  /** Defaults for `[kuiLoader]`. */
  readonly loader?: KuiLoaderOptions;

  /** Defaults for `kui-segmented`. */
  readonly segmented?: KuiSegmentedOptions;

  /** Defaults for `table[kuiTable]`. */
  readonly table?: KuiTableOptions;

  /** Defaults for `input[kuiInput]`. */
  readonly input?: KuiInputOptions;

  /** Defaults for `textarea[kuiTextarea]`. */
  readonly textarea?: KuiTextareaOptions;

  /** Defaults for `input[type=checkbox][kuiCheckbox]`. */
  readonly checkbox?: KuiCheckboxOptions;

  /** Defaults for `input[type=radio][kuiRadio]`. */
  readonly radio?: KuiRadioOptions;

  /** Defaults for `input[type=checkbox][kuiSwitch]`. */
  readonly switch?: KuiSwitchOptions;

  /** Defaults for `input[kuiColorInput]`. */
  readonly colorInput?: KuiColorInputOptions;

  /** Defaults for `input[type=number][kuiNumberInput]`. */
  readonly numberInput?: KuiNumberInputOptions;

  /** Defaults for `input[type=range][kuiSlider]`. */
  readonly slider?: KuiSliderOptions;

  /** Defaults for `kui-accordion`. */
  readonly accordion?: KuiAccordionOptions;

  /** Defaults for `kui-alert`. */
  readonly alert?: KuiAlertOptions;

  /** Defaults for `[kuiCard]`. */
  readonly card?: KuiCardOptions;

  /** Defaults for `kui-tabs`. */
  readonly tabs?: KuiTabsOptions;

  /** Defaults for `kui-stepper`. */
  readonly stepper?: KuiStepperOptions;

  /** Defaults for `kui-tree`. */
  readonly tree?: KuiTreeOptions;

  /** Defaults for `[kuiGroup]`. */
  readonly group?: KuiGroupOptions;

  /** Defaults for `kui-avatar`. */
  readonly avatar?: KuiAvatarOptions;

  /** Defaults for `kui-avatar-group`. */
  readonly avatarGroup?: KuiAvatarGroupOptions;

  /** Defaults for `a[kuiLink], button[kuiLink]`. */
  readonly link?: KuiLinkOptions;

  /** Defaults for `kui-progress`. */
  readonly progress?: KuiProgressOptions;

  /** Defaults for `hr[kuiSeparator]`. */
  readonly separator?: KuiSeparatorOptions;

  /** Defaults for `[kuiSkeleton]`. */
  readonly skeleton?: KuiSkeletonOptions;

  /** Defaults for `kui-file-upload`. */
  readonly fileUpload?: KuiFileUploadOptions;

  /** Defaults for `kui-otp-input`. */
  readonly otpInput?: KuiOtpInputOptions;

  /** Defaults for `kui-bar-chart`. */
  readonly barChart?: KuiBarChartOptions;

  /** Defaults for `kui-line-chart`. */
  readonly lineChart?: KuiLineChartOptions;

  /** Defaults for `kui-donut-chart`. */
  readonly donutChart?: KuiDonutChartOptions;

  /** Defaults for `kui-scatter-chart`. */
  readonly scatterChart?: KuiScatterChartOptions;
}

/** One layer of defaults as a consumer writes it: plain values or signals for every property. */
export type KuiDefaultsLayer = KuiDefaultsInput<KuiComponentDefaults>;

/**
 * Value accepted by `provideKikitaUi({ defaults })` and `provideKuiDefaults`.
 *
 * A function runs in an injection context, so it can read services and return `computed` values.
 */
export type KuiDefaultsSource = KuiDefaultsLayer | (() => KuiDefaultsLayer);
