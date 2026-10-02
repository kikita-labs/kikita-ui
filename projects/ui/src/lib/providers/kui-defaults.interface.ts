import type { KuiToastOptions } from '../components/toast/kui-toast.types';
import type {
  KuiButtonOptions,
  KuiIconButtonOptions,
} from '../tokens/kui-button-options.interface';
import type { KuiComboboxOptions } from '../tokens/kui-combobox-options.interface';
import type { KuiDatePickerOptions } from '../tokens/kui-date-picker-options.interface';
import type { KuiFieldOptions } from '../tokens/kui-field-options.interface';
import type { KuiSelectOptions } from '../tokens/kui-select-options.interface';
import type { KuiTimePickerOptions } from '../tokens/kui-time-picker-options.interface';
import type { KuiTooltipOptions } from '../tokens/kui-tooltip-options.interface';
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

  /** Defaults for `kuiDatePicker`. */
  readonly datePicker?: KuiDatePickerOptions;

  /** Defaults for `kuiTimePicker`. */
  readonly timePicker?: KuiTimePickerOptions;

  /** Defaults for `kuiTooltip`. */
  readonly tooltip?: KuiTooltipOptions;

  /** Defaults for toasts opened through `kuiToast`. Region options are read once, on first use. */
  readonly toast?: KuiToastOptions;
}

/** One layer of defaults as a consumer writes it: plain values or signals for every property. */
export type KuiDefaultsLayer = KuiDefaultsInput<KuiComponentDefaults>;

/**
 * Value accepted by `provideKikitaUi({ defaults })` and `kuiProvideDefaults`.
 *
 * A function runs in an injection context, so it can read services and return `computed` values.
 */
export type KuiDefaultsSource = KuiDefaultsLayer | (() => KuiDefaultsLayer);
