import type { KuiToastOptions } from '../components/toast/kui-toast.types';
import type { KuiAccordionOptions } from '../tokens/kui-accordion-options.interface';
import type { KuiAlertOptions } from '../tokens/kui-alert-options.interface';
import type { KuiAvatarGroupOptions } from '../tokens/kui-avatar-group-options.interface';
import type { KuiAvatarOptions } from '../tokens/kui-avatar-options.interface';
import type { KuiBadgeOptions } from '../tokens/kui-badge-options.interface';
import type { KuiBreadcrumbsOptions } from '../tokens/kui-breadcrumbs-options.interface';
import type {
  KuiButtonOptions,
  KuiIconButtonOptions,
} from '../tokens/kui-button-options.interface';
import type {
  KuiCalendarOptions,
  KuiCalendarRangeOptions,
} from '../tokens/kui-calendar-options.interface';
import type { KuiCardOptions } from '../tokens/kui-card-options.interface';
import type { KuiCarouselOptions } from '../tokens/kui-carousel-options.interface';
import type { KuiBarChartOptions } from '../tokens/kui-chart-options.interface';
import type { KuiDonutChartOptions } from '../tokens/kui-chart-options.interface';
import type { KuiLineChartOptions } from '../tokens/kui-chart-options.interface';
import type { KuiScatterChartOptions } from '../tokens/kui-chart-options.interface';
import type { KuiCheckboxOptions } from '../tokens/kui-checkbox-options.interface';
import type { KuiChipOptions } from '../tokens/kui-chip-options.interface';
import type { KuiColorInputOptions } from '../tokens/kui-color-input-options.interface';
import type { KuiComboboxOptions } from '../tokens/kui-combobox-options.interface';
import type { KuiDatePickerOptions } from '../tokens/kui-date-picker-options.interface';
import type { KuiDialogOptions } from '../tokens/kui-dialog-options.interface';
import type { KuiDrawerOptions } from '../tokens/kui-drawer-options.interface';
import type { KuiDropdownOptions } from '../tokens/kui-dropdown-options.interface';
import type { KuiEmptyStateOptions } from '../tokens/kui-empty-state-options.interface';
import type { KuiFieldOptions } from '../tokens/kui-field-options.interface';
import type { KuiFileUploadOptions } from '../tokens/kui-file-upload-options.interface';
import type { KuiGroupOptions } from '../tokens/kui-group-options.interface';
import type { KuiInputOptions } from '../tokens/kui-input-options.interface';
import type { KuiLinkOptions } from '../tokens/kui-link-options.interface';
import type { KuiLoaderOptions } from '../tokens/kui-loader-options.interface';
import type { KuiMenuOptions } from '../tokens/kui-menu-options.interface';
import type { KuiNumberInputOptions } from '../tokens/kui-number-input-options.interface';
import type { KuiOtpInputOptions } from '../tokens/kui-otp-input-options.interface';
import type { KuiPaginationOptions } from '../tokens/kui-pagination-options.interface';
import type { KuiPopoverOptions } from '../tokens/kui-popover-options.interface';
import type { KuiProgressOptions } from '../tokens/kui-progress-options.interface';
import type { KuiRadioOptions } from '../tokens/kui-radio-options.interface';
import type { KuiSegmentedOptions } from '../tokens/kui-segmented-options.interface';
import type { KuiSelectOptions } from '../tokens/kui-select-options.interface';
import type { KuiSeparatorOptions } from '../tokens/kui-separator-options.interface';
import type { KuiSkeletonOptions } from '../tokens/kui-skeleton-options.interface';
import type { KuiSliderOptions } from '../tokens/kui-slider-options.interface';
import type { KuiStepperOptions } from '../tokens/kui-stepper-options.interface';
import type { KuiSwitchOptions } from '../tokens/kui-switch-options.interface';
import type { KuiTableOptions } from '../tokens/kui-table-options.interface';
import type { KuiTabsOptions } from '../tokens/kui-tabs-options.interface';
import type { KuiTextareaOptions } from '../tokens/kui-textarea-options.interface';
import type { KuiTimePickerOptions } from '../tokens/kui-time-picker-options.interface';
import type { KuiTooltipOptions } from '../tokens/kui-tooltip-options.interface';
import type { KuiTreeOptions } from '../tokens/kui-tree-options.interface';
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
 * Value accepted by `provideKikitaUi({ defaults })` and `kuiProvideDefaults`.
 *
 * A function runs in an injection context, so it can read services and return `computed` values.
 */
export type KuiDefaultsSource = KuiDefaultsLayer | (() => KuiDefaultsLayer);
