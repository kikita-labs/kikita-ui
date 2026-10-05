import type { Signal } from '@angular/core';

/** Plural forms of one message, keyed by `Intl.PluralRules` category. `other` is required. */
export type KuiPluralForms<T = string> = { readonly other: T } & Partial<
  Record<'zero' | 'one' | 'two' | 'few' | 'many', T>
>;

/** Locale-aware helpers passed to every function message. */
export interface KuiMessageContext {
  /** The resolved BCP 47 locale the message is rendered for. */
  readonly locale: string;

  /** Formats a number for the locale with Latin digits (grouping and decimal separators follow the locale). */
  formatNumber(value: number): string;

  /** Picks the form that `Intl.PluralRules` selects for `count`, falling back to `other`. */
  plural<T = string>(count: number, forms: KuiPluralForms<T>): T;
}

/** A message that depends on values. Parameters are always one named object. */
export type KuiMessageFn<TParams> = (params: TParams, ctx: KuiMessageContext) => string;

/** Words that are identical across components and are never overridden per component. */
export interface KuiCommonMessages {
  /** Accessible name of a clear action. Default `Clear`. */
  readonly clear: string;

  /** Accessible name of a close action. Default `Close`. */
  readonly close: string;

  /** Accessible name of a busy indicator. Default `Loading`. */
  readonly loading: string;

  /** Accessible name of a remove action. Default `Remove`. */
  readonly remove: string;
}

/** Messages of `kui-alert`. */
export interface KuiAlertMessages {
  /** Accessible name of the dismiss button. Default `Close notification`. */
  readonly close: string;
}

/** Messages of `kui-avatar`. */
export interface KuiAvatarMessages {
  /** Name used when the avatar has no `alt`, `name` or initials. Default `Avatar`. */
  readonly fallback: string;

  /** Status word for `online`. Default `online`. */
  readonly statusOnline: string;

  /** Status word for `away`. Default `away`. */
  readonly statusAway: string;

  /** Status word for `busy`. Default `busy`. */
  readonly statusBusy: string;

  /** Status word for `offline`. Default `offline`. */
  readonly statusOffline: string;

  /** Name with its status appended. Default `{label}, {status}`. */
  readonly withStatus: KuiMessageFn<{ label: string; status: string }>;
}

/** Messages of `kui-avatar-group`. */
export interface KuiAvatarGroupMessages {
  /** Accessible name of the group. Default `Avatar group`. */
  readonly label: string;

  /** Overflow chip text. Default `{count} more`. */
  readonly overflow: KuiMessageFn<{ count: number }>;
}

/** Messages of `kui-calendar` and `kui-calendar-range`. */
export interface KuiCalendarMessages {
  /** Accessible name of the day grid. Default `Calendar`. */
  readonly label: string;

  /** Text of the footer shortcut to the current day. Default `Today`. */
  readonly today: string;

  /** Previous button of the day view. Default `Previous month`. */
  readonly previousMonth: string;

  /** Next button of the day view. Default `Next month`. */
  readonly nextMonth: string;

  /** Previous button of the month view. Default `Previous year`. */
  readonly previousYear: string;

  /** Next button of the month view. Default `Next year`. */
  readonly nextYear: string;

  /** Previous button of the year view. Default `Previous decade`. */
  readonly previousDecade: string;

  /** Next button of the year view. Default `Next decade`. */
  readonly nextDecade: string;
}

/** Messages of `kui-carousel`. */
export interface KuiCarouselMessages {
  /** Accessible name of the region when `ariaLabel` is not set. Default `Slides`. */
  readonly label: string;

  /** Role description of the region. Default `carousel`. */
  readonly roleDescription: string;

  /** Role description of one slide. Default `slide`. */
  readonly slideRoleDescription: string;

  /** Previous arrow. Default `Previous slide`. */
  readonly previous: string;

  /** Next arrow. Default `Next slide`. */
  readonly next: string;

  /** Pause button. Default `Pause autoplay`. */
  readonly pause: string;

  /** Resume button. Default `Resume autoplay`. */
  readonly resume: string;

  /** Accessible name of the dot list. Default `Choose slide`. */
  readonly dots: string;

  /** Accessible name of one dot. Default `Go to slide {index} of {total}`. */
  readonly goToSlide: KuiMessageFn<{ index: number; total: number }>;

  /** Accessible name of one slide. Default `{index} of {total}`. */
  readonly slidePosition: KuiMessageFn<{ index: number; total: number }>;
}

/** Messages shared by `kui-line-chart`, `kui-bar-chart`, `kui-donut-chart` and `kui-scatter-chart`. */
export interface KuiChartMessages {
  /** Accessible name of the loading state. Default `Loading chart`. */
  readonly loading: string;

  /** Text shown when there is no data. Default `No data`. */
  readonly noData: string;

  /** Button that shows the chart again from its data table. Default `Chart`. */
  readonly viewChart: string;

  /** Button that shows the data table instead of the chart. Default `Table`. */
  readonly viewTable: string;

  /** Header of the category column in the data table. Default `Category`. */
  readonly columnCategory: string;

  /** Header of the series column in the data table. Default `Series`. */
  readonly columnSeries: string;

  /** Header of the label column in the data table. Default `Label`. */
  readonly columnLabel: string;

  /** Header of the value column in the data table. Default `Value`. */
  readonly columnValue: string;

  /** Header of the horizontal-axis column of a scatter chart's data table. Default `X`. */
  readonly columnX: string;

  /** Header of the vertical-axis column of a scatter chart's data table. Default `Y`. */
  readonly columnY: string;

  /** Header of the radius column of a bubble chart's data table. Default `Radius`. */
  readonly columnRadius: string;

  /** Accessible name of the chart's inline legend. Default `Legend`. */
  readonly legendLabel: string;

  /** Accessible name of a line chart. Default `Line chart`. */
  readonly lineLabel: string;

  /** Accessible name of a bar chart. Default `Bar chart`. */
  readonly barLabel: string;

  /** Accessible name of a donut chart. Default `Donut chart`. */
  readonly donutLabel: string;

  /** Accessible name of a scatter chart. Default `Scatter chart`. */
  readonly scatterLabel: string;

  /** Role description of a line chart. Default `line chart`. */
  readonly lineRoleDescription: string;

  /** Role description of a bar chart. Default `bar chart`. */
  readonly barRoleDescription: string;

  /** Role description of a donut chart. Default `donut chart`. */
  readonly donutRoleDescription: string;

  /** Role description of a scatter chart. Default `scatter chart`. */
  readonly scatterRoleDescription: string;

  /** Tooltip and name of a mark that has a category. Default `{series} · {category}: {value}`. */
  readonly pointWithCategory: KuiMessageFn<{ series: string; category: string; value: string }>;

  /** Tooltip and name of a mark without a category. Default `{series}: {value}`. */
  readonly point: KuiMessageFn<{ series: string; value: string }>;

  /** Tooltip and name of a scatter point. Default `{series}: ({x}, {y})`. */
  readonly scatterPoint: KuiMessageFn<{ series: string; x: string; y: string }>;

  /** Tooltip and name of a bubble. Default `{series}: ({x}, {y}), radius {radius}`. */
  readonly bubblePoint: KuiMessageFn<{ series: string; x: string; y: string; radius: string }>;

  /** Tooltip and name of a donut slice. Default `{label}: {value} ({percent}%)`. */
  readonly slice: KuiMessageFn<{ label: string; value: string; percent: number }>;
}

/** Messages of `kuiColorInput`. */
export interface KuiColorInputMessages {
  /** Name of the button that opens the picker. Default `Open color picker`. */
  readonly openPicker: string;

  /** Name of the lightness and chroma plane. Default `Lightness and chroma`. */
  readonly pickerLabel: string;

  /** Name of the hue slider. Default `Hue`. */
  readonly hue: string;

  /** Name of a theme seed preset. Default `{name} seed: {value}`. */
  readonly preset: KuiMessageFn<{ name: string; value: string }>;

  /** Preset name of the primary seed. Default `Primary`. */
  readonly presetPrimary: string;

  /** Preset name of the neutral seed. Default `Neutral`. */
  readonly presetNeutral: string;

  /** Preset name of the success seed. Default `Success`. */
  readonly presetSuccess: string;

  /** Preset name of the warning seed. Default `Warning`. */
  readonly presetWarning: string;

  /** Preset name of the danger seed. Default `Danger`. */
  readonly presetDanger: string;

  /** Preset name of the info seed. Default `Info`. */
  readonly presetInfo: string;

  /** Copy button text and tooltip. Default `Copy value`. */
  readonly copyValue: string;
}

/** Messages of `kuiCombobox`. */
export interface KuiComboboxMessages {
  /** Name of the open button. Default `Open options`. */
  readonly openOptions: string;

  /** Name of the close button. Default `Close options`. */
  readonly closeOptions: string;
}

/** Messages of `kui-command-palette`. */
export interface KuiCommandPaletteMessages {
  /** Search input placeholder. Default `Type a command or search...`. */
  readonly placeholder: string;

  /** Accessible name of the palette. Default `Command palette`. */
  readonly label: string;

  /** Text of the empty result state. Default `No commands found`. */
  readonly empty: string;

  /** Description under the empty result text. Default `Try a different query.` */
  readonly emptyDescription: string;

  /** Name of the clear search button. Default `Clear search`. */
  readonly clearSearch: string;

  /** Key cap of the Up arrow in the footer. Default `Up`. */
  readonly keyUp: string;

  /** Key cap of the Down arrow in the footer. Default `Down`. */
  readonly keyDown: string;

  /** Key cap of Enter in the footer. Default `Enter`. */
  readonly keyEnter: string;

  /** Key cap of Escape in the footer. Default `Esc`. */
  readonly keyEscape: string;

  /** Footer hint next to the arrow keys. Default `navigate`. */
  readonly hintNavigate: string;

  /** Footer hint next to Enter. Default `run`. */
  readonly hintRun: string;

  /** Footer hint next to Escape. Default `close`. */
  readonly hintClose: string;
}

/** Messages of `kuiDatePicker`. */
export interface KuiDatePickerMessages {
  /** Name of the button that opens the calendar. Default `Open calendar`. */
  readonly openCalendar: string;

  /** Name of the button that closes the calendar. Default `Close calendar`. */
  readonly closeCalendar: string;

  /** Placeholder token for the day field. Default `dd`. */
  readonly dayPlaceholder: string;

  /** Placeholder token for the month field. Default `mm`. */
  readonly monthPlaceholder: string;

  /** Placeholder token for the year field. Default `yyyy`. */
  readonly yearPlaceholder: string;
}

/** Messages of dialogs opened through `kuiDialog` and `kuiConfirm`. */
export interface KuiDialogMessages {
  /** Accessible name of a dialog that has no title. Default `Dialog`. */
  readonly label: string;

  /** Confirm button of `kuiConfirm`. Default `OK`. */
  readonly confirm: string;

  /** Cancel button of `kuiConfirm`. Default `Cancel`. */
  readonly cancel: string;
}

/** Messages of drawers opened through `kuiDrawer`. */
export interface KuiDrawerMessages {
  /** Accessible name of a drawer that has no title. Default `Drawer`. */
  readonly label: string;
}

/** Messages of `kui-file-upload`. */
export interface KuiFileUploadMessages {
  /** Accessible name of the dropzone. Default `Upload file. Drag and drop or click to browse.` */
  readonly dropzoneLabel: string;

  /** Text before the emphasised action in the dropzone. Default `Drag files here or `. */
  readonly promptBefore: string;

  /** Emphasised action in the dropzone. Default `choose a file`. */
  readonly promptAction: string;

  /** Text after the emphasised action in the dropzone. Default empty. */
  readonly promptAfter: string;

  /** Text of the presentational button in the dropzone. Default `Choose file`. */
  readonly chooseFile: string;

  /** Text of the compact trigger. Default `Attach file`. */
  readonly attachFile: string;

  /** Error for a file whose type is not accepted. Default `Invalid file type`. */
  readonly invalidType: string;

  /** Error for a file over the size limit. Default `Exceeds max size (max {max})`. */
  readonly tooLarge: KuiMessageFn<{ max: string }>;

  /** Error for too many files. Default `Maximum {max} file(s)`, singular and plural. */
  readonly tooMany: KuiMessageFn<{ max: number }>;

  /** Accessible name of a file's progress bar. Default `Uploading {name}`. */
  readonly uploading: KuiMessageFn<{ name: string }>;

  /** Accessible name of a file's remove button. Default `Remove {name}`. */
  readonly removeFile: KuiMessageFn<{ name: string }>;

  /** Status of a finished upload. Default `Done`. */
  readonly done: string;

  /** Status of a file waiting for upload. Default `Queued`. */
  readonly queued: string;

  /** Retry action of a failed upload. Default `Retry`. */
  readonly retry: string;
}

/** Messages of `kuiLink`. */
export interface KuiLinkMessages {
  /** Hidden suffix for links that open a new tab. Default `(opens in a new tab)`. */
  readonly opensInNewTab: string;
}

/** Messages of `kuiMediaViewer`. */
export interface KuiMediaViewerMessages {
  /** Name of the viewer when the caller gives none. Default `Photo viewer`. */
  readonly label: string;

  /** Zoom in button. Default `Zoom in`. */
  readonly zoomIn: string;

  /** Zoom out button. Default `Zoom out`. */
  readonly zoomOut: string;

  /** Close button. Default `Close photo viewer`. */
  readonly close: string;

  /** Previous button. Default `Previous photo`. */
  readonly previous: string;

  /** Next button. Default `Next photo`. */
  readonly next: string;

  /** Thumbnail button. Default `Go to photo {index} of {total}`. */
  readonly goTo: KuiMessageFn<{ index: number; total: number }>;

  /** Viewer name with the current position. Default `{label}, photo {index} of {total}`. */
  readonly position: KuiMessageFn<{ label: string; index: number; total: number }>;

  /** Heading of the load error state. Default `Could not load this photo`. */
  readonly loadErrorTitle: string;

  /** Description of the load error state. Default `Check your connection and try again`. */
  readonly loadErrorDescription: string;
}

/** Messages of `kui-menu`. */
export interface KuiMenuMessages {
  /** Accessible name of the menu when `ariaLabel` is not set. Default `Actions`. */
  readonly label: string;
}

/** Messages of `kuiNumberInput`. */
export interface KuiNumberInputMessages {
  /** Decrease button. Default `Decrease value`. */
  readonly decrease: string;

  /** Increase button. Default `Increase value`. */
  readonly increase: string;
}

/** Messages of `kui-otp-input`. */
export interface KuiOtpInputMessages {
  /** Accessible name of the cell group. Default `Verification code`. */
  readonly label: string;

  /** Accessible name of one cell. Default `Digit {index} of {total}`. */
  readonly digit: KuiMessageFn<{ index: number; total: number }>;

  /** Name of the verifying state. Default `Verifying code`. */
  readonly verifying: string;
}

/** Messages of `kui-pagination`. */
export interface KuiPaginationMessages {
  /** Accessible name of the navigation landmark. Default `Pagination`. */
  readonly label: string;

  /** First page button. Default `First page`. */
  readonly first: string;

  /** Previous page button. Default `Previous page`. */
  readonly previous: string;

  /** Next page button. Default `Next page`. */
  readonly next: string;

  /** Last page button. Default `Last page`. */
  readonly last: string;

  /** Accessible name of one page button. Default `Page {page}` or `Page {page}, current`. */
  readonly page: KuiMessageFn<{ page: number; current: boolean }>;

  /** Label of the rows per page picker. Default `Rows per page`. */
  readonly rowsPerPage: string;

  /** Summary text. Default `Showing {start}–{end} of {total}`. */
  readonly summary: KuiMessageFn<{ start: number; end: number; total: number }>;

  /** Label of the `simple` variant. Default `Page {page} of {total}`. */
  readonly simplePage: KuiMessageFn<{ page: number; total: number }>;
}

/** Messages of `kui-popover`. */
export interface KuiPopoverMessages {
  /** Accessible name of the panel when `ariaLabel` is not set. Default `Popover`. */
  readonly label: string;
}

/** Messages of `kuiSelect`. */
export interface KuiSelectMessages {
  /** Name of the open button. Default `Open options`. */
  readonly openOptions: string;

  /** Name of the close button. Default `Close options`. */
  readonly closeOptions: string;

  /** Name of the remove button of one chip. Default `Remove {label}`. */
  readonly removeItem: KuiMessageFn<{ label: string }>;
}

/** Messages of `kui-splitter`. */
export interface KuiSplitterMessages {
  /** Collapse button. Default `Collapse pane`. */
  readonly collapsePane: string;

  /** Expand button. Default `Expand pane`. */
  readonly expandPane: string;
}

/** Messages of `kui-stepper`. */
export interface KuiStepperMessages {
  /** Name of the button of a finished step. Default `Back to step {label}`. */
  readonly backToStep: KuiMessageFn<{ label: string }>;

  /** Name of the button of an upcoming step. Default `Go to step {label}`. */
  readonly goToStep: KuiMessageFn<{ label: string }>;
}

/** Messages of the table select and sort controls. */
export interface KuiTableMessages {
  /** Name of a row checkbox. Default `Select row`. */
  readonly selectRow: string;

  /** Name of the header checkbox. Default `Select all rows`. */
  readonly selectAllRows: string;

  /** Name of the sort button of an unsorted column. Default `Sort {label} ascending`. */
  readonly sortAscending: KuiMessageFn<{ label: string }>;

  /** Name of the sort button of an ascending column. Default `Sort {label} descending`. */
  readonly sortDescending: KuiMessageFn<{ label: string }>;

  /** Name of the sort button of a descending column. Default `Clear {label} sort`. */
  readonly clearSort: KuiMessageFn<{ label: string }>;
}

/** Messages of `kui-tabs`. */
export interface KuiTabsMessages {
  /** Scroll left button. Default `Scroll tabs left`. */
  readonly scrollLeft: string;

  /** Scroll right button. Default `Scroll tabs right`. */
  readonly scrollRight: string;

  /** Hidden text of the error dot. Default `has error`. */
  readonly errorIndicator: string;
}

/** Messages of `kuiTimePicker` and `kui-time-picker-panel`. */
export interface KuiTimePickerMessages {
  /** Name of the button that opens the panel. Default `Open time picker`. */
  readonly openPicker: string;

  /** Name of the button that closes the panel. Default `Close time picker`. */
  readonly closePicker: string;

  /** Name of the hour column. Default `Hours`. */
  readonly hours: string;

  /** Name of the minute column. Default `Minutes`. */
  readonly minutes: string;

  /** Name of the second column. Default `Seconds`. */
  readonly seconds: string;

  /** Name of the day period column. Default `AM/PM`. */
  readonly period: string;

  /** Footer action that sets the current time. Default `Now`. */
  readonly now: string;

  /** Footer action that closes the panel. Default `Done`. */
  readonly done: string;

  /** Placeholder token for hours. Default `hh`. */
  readonly hourPlaceholder: string;

  /** Placeholder token for minutes. Default `mm`. */
  readonly minutePlaceholder: string;

  /** Placeholder token for seconds. Default `ss`. */
  readonly secondPlaceholder: string;
}

/** Messages of `kui-toast-region`. */
export interface KuiToastMessages {
  /** Accessible name of the notification region. Default `Notifications`. */
  readonly region: string;
}

/** Messages of `kui-tree`. */
export interface KuiTreeMessages {
  /** Accessible name of the tree when `ariaLabel` is not set. Default `Tree`. */
  readonly label: string;
}

/**
 * Every message the library owns, grouped by component family.
 *
 * Consumer content (titles, option labels, tab labels, error text, tooltip content and
 * `acceptLabel`) is never part of this map. A value is a string or a function with one named
 * parameter object; function messages also receive a {@link KuiMessageContext}.
 */
export interface KuiMessages {
  /** Words shared by every component. */
  readonly common: KuiCommonMessages;

  /** `kui-alert`. */
  readonly alert: KuiAlertMessages;

  /** `kui-avatar`. */
  readonly avatar: KuiAvatarMessages;

  /** `kui-avatar-group`. */
  readonly avatarGroup: KuiAvatarGroupMessages;

  /** `kui-calendar` and `kui-calendar-range`. */
  readonly calendar: KuiCalendarMessages;

  /** `kui-carousel`. */
  readonly carousel: KuiCarouselMessages;

  /** The four chart types. */
  readonly chart: KuiChartMessages;

  /** `kuiColorInput`. */
  readonly colorInput: KuiColorInputMessages;

  /** `kuiCombobox`. */
  readonly combobox: KuiComboboxMessages;

  /** `kui-command-palette`. */
  readonly commandPalette: KuiCommandPaletteMessages;

  /** `kuiDatePicker`. */
  readonly datePicker: KuiDatePickerMessages;

  /** `kuiDialog` and `kuiConfirm`. */
  readonly dialog: KuiDialogMessages;

  /** `kuiDrawer`. */
  readonly drawer: KuiDrawerMessages;

  /** `kui-file-upload`. */
  readonly fileUpload: KuiFileUploadMessages;

  /** `kuiLink`. */
  readonly link: KuiLinkMessages;

  /** `kuiMediaViewer`. */
  readonly mediaViewer: KuiMediaViewerMessages;

  /** `kui-menu`. */
  readonly menu: KuiMenuMessages;

  /** `kuiNumberInput`. */
  readonly numberInput: KuiNumberInputMessages;

  /** `kui-otp-input`. */
  readonly otpInput: KuiOtpInputMessages;

  /** `kui-pagination`. */
  readonly pagination: KuiPaginationMessages;

  /** `kui-popover`. */
  readonly popover: KuiPopoverMessages;

  /** `kuiSelect`. */
  readonly select: KuiSelectMessages;

  /** `kui-splitter`. */
  readonly splitter: KuiSplitterMessages;

  /** `kui-stepper`. */
  readonly stepper: KuiStepperMessages;

  /** Table select and sort controls. */
  readonly table: KuiTableMessages;

  /** `kui-tabs`. */
  readonly tabs: KuiTabsMessages;

  /** `kuiTimePicker` and its panel. */
  readonly timePicker: KuiTimePickerMessages;

  /** `kui-toast-region`. */
  readonly toast: KuiToastMessages;

  /** `kui-tree`. */
  readonly tree: KuiTreeMessages;
}

/** One group of {@link KuiMessages} as a component reads it: function messages take only their parameters. */
export type KuiBoundMessages<TGroup> = {
  readonly [K in keyof TGroup]: TGroup[K] extends KuiMessageFn<infer TParams>
    ? (params: TParams) => string
    : TGroup[K];
};

/** Partial overrides of {@link KuiMessages}: any group, any key inside it. */
export type KuiMessagesLayer = {
  readonly [G in keyof KuiMessages]?: Partial<KuiMessages[G]>;
};

/**
 * Value accepted for messages: a layer, a `Signal` of a layer, or a function that runs in an
 * injection context and returns either. A `Signal` makes the language switchable at runtime.
 */
export type KuiMessagesSource =
  | KuiMessagesLayer
  | Signal<KuiMessagesLayer>
  | (() => KuiMessagesLayer | Signal<KuiMessagesLayer>);

/**
 * Value accepted for the locale: a BCP 47 tag, a `Signal` of one, or a function that runs in an
 * injection context and returns either.
 */
export type KuiLocaleSource = string | Signal<string> | (() => string | Signal<string>);
