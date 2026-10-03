import type { KuiMessages } from './kui-messages.interface';

/**
 * The built-in English messages. It is the base of every message lookup and the complete example
 * for a translation: copy it, translate the values, and pass the result to
 * `provideKikitaUi({ messages })`.
 */
export const KUI_ENGLISH_MESSAGES: KuiMessages = {
  common: {
    clear: 'Clear',
    close: 'Close',
    loading: 'Loading',
    remove: 'Remove',
  },
  alert: {
    close: 'Close notification',
  },
  avatar: {
    fallback: 'Avatar',
    statusOnline: 'online',
    statusAway: 'away',
    statusBusy: 'busy',
    statusOffline: 'offline',
    withStatus: ({ label, status }) => `${label}, ${status}`,
  },
  avatarGroup: {
    label: 'Avatar group',
    overflow: ({ count }, { formatNumber }) => `${formatNumber(count)} more`,
  },
  calendar: {
    label: 'Calendar',
    today: 'Today',
    previousMonth: 'Previous month',
    nextMonth: 'Next month',
    previousYear: 'Previous year',
    nextYear: 'Next year',
    previousDecade: 'Previous decade',
    nextDecade: 'Next decade',
  },
  carousel: {
    label: 'Slides',
    roleDescription: 'carousel',
    slideRoleDescription: 'slide',
    previous: 'Previous slide',
    next: 'Next slide',
    pause: 'Pause autoplay',
    resume: 'Resume autoplay',
    dots: 'Choose slide',
    goToSlide: ({ index, total }, { formatNumber }) =>
      `Go to slide ${formatNumber(index)} of ${formatNumber(total)}`,
    slidePosition: ({ index, total }, { formatNumber }) =>
      `${formatNumber(index)} of ${formatNumber(total)}`,
  },
  chart: {
    loading: 'Loading chart',
    noData: 'No data',
    viewChart: 'Chart',
    viewTable: 'Table',
    columnCategory: 'Category',
    columnSeries: 'Series',
    columnLabel: 'Label',
    columnValue: 'Value',
    lineLabel: 'Line chart',
    barLabel: 'Bar chart',
    donutLabel: 'Donut chart',
    scatterLabel: 'Scatter chart',
    lineRoleDescription: 'line chart',
    barRoleDescription: 'bar chart',
    donutRoleDescription: 'donut chart',
    scatterRoleDescription: 'scatter chart',
    pointWithCategory: ({ series, category, value }) => `${series} · ${category}: ${value}`,
    point: ({ series, value }) => `${series}: ${value}`,
    slice: ({ label, value, percent }, { formatNumber }) =>
      `${label}: ${value} (${formatNumber(percent)}%)`,
  },
  colorInput: {
    openPicker: 'Open color picker',
    pickerLabel: 'Lightness and chroma',
    hue: 'Hue',
    preset: ({ name, value }) => `${name} seed: ${value}`,
    presetPrimary: 'Primary',
    presetNeutral: 'Neutral',
    presetSuccess: 'Success',
    presetWarning: 'Warning',
    presetDanger: 'Danger',
    presetInfo: 'Info',
    copyValue: 'Copy value',
  },
  combobox: {
    openOptions: 'Open options',
    closeOptions: 'Close options',
  },
  commandPalette: {
    placeholder: 'Type a command or search...',
    label: 'Command palette',
    empty: 'No commands found',
    emptyDescription: 'Try a different query.',
    clearSearch: 'Clear search',
    keyUp: 'Up',
    keyDown: 'Down',
    keyEnter: 'Enter',
    keyEscape: 'Esc',
    hintNavigate: 'navigate',
    hintRun: 'run',
    hintClose: 'close',
  },
  datePicker: {
    openCalendar: 'Open calendar',
    closeCalendar: 'Close calendar',
    dayPlaceholder: 'dd',
    monthPlaceholder: 'mm',
    yearPlaceholder: 'yyyy',
  },
  dialog: {
    label: 'Dialog',
    confirm: 'OK',
    cancel: 'Cancel',
  },
  drawer: {
    label: 'Drawer',
  },
  fileUpload: {
    dropzoneLabel: 'Upload file. Drag and drop or click to browse.',
    promptBefore: 'Drag files here or ',
    promptAction: 'choose a file',
    promptAfter: '',
    chooseFile: 'Choose file',
    attachFile: 'Attach file',
    invalidType: 'Invalid file type',
    tooLarge: ({ max }) => `Exceeds max size (max ${max})`,
    tooMany: ({ max }, { formatNumber, plural }) =>
      `Maximum ${formatNumber(max)} ${plural(max, { one: 'file', other: 'files' })}`,
    uploading: ({ name }) => `Uploading ${name}`,
    removeFile: ({ name }) => `Remove ${name}`,
    done: 'Done',
    queued: 'Queued',
    retry: 'Retry',
  },
  link: {
    opensInNewTab: '(opens in a new tab)',
  },
  mediaViewer: {
    label: 'Photo viewer',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    close: 'Close photo viewer',
    previous: 'Previous photo',
    next: 'Next photo',
    goTo: ({ index, total }, { formatNumber }) =>
      `Go to photo ${formatNumber(index)} of ${formatNumber(total)}`,
    position: ({ label, index, total }, { formatNumber }) =>
      `${label}, photo ${formatNumber(index)} of ${formatNumber(total)}`,
    loadErrorTitle: 'Could not load this photo',
    loadErrorDescription: 'Check your connection and try again',
  },
  menu: {
    label: 'Actions',
  },
  numberInput: {
    decrease: 'Decrease value',
    increase: 'Increase value',
  },
  otpInput: {
    label: 'Verification code',
    digit: ({ index, total }, { formatNumber }) =>
      `Digit ${formatNumber(index)} of ${formatNumber(total)}`,
    verifying: 'Verifying code',
  },
  pagination: {
    label: 'Pagination',
    first: 'First page',
    previous: 'Previous page',
    next: 'Next page',
    last: 'Last page',
    page: ({ page, current }, { formatNumber }) =>
      current ? `Page ${formatNumber(page)}, current` : `Page ${formatNumber(page)}`,
    rowsPerPage: 'Rows per page',
    summary: ({ start, end, total }, { formatNumber }) =>
      `Showing ${formatNumber(start)}–${formatNumber(end)} of ${formatNumber(total)}`,
    simplePage: ({ page, total }, { formatNumber }) =>
      `Page ${formatNumber(page)} of ${formatNumber(total)}`,
  },
  popover: {
    label: 'Popover',
  },
  select: {
    openOptions: 'Open options',
    closeOptions: 'Close options',
    removeItem: ({ label }) => `Remove ${label}`,
  },
  splitter: {
    collapsePane: 'Collapse pane',
    expandPane: 'Expand pane',
  },
  stepper: {
    backToStep: ({ label }) => `Back to step ${label}`,
    goToStep: ({ label }) => `Go to step ${label}`,
  },
  table: {
    selectRow: 'Select row',
    selectAllRows: 'Select all rows',
    sortAscending: ({ label }) => `Sort ${label} ascending`,
    sortDescending: ({ label }) => `Sort ${label} descending`,
    clearSort: ({ label }) => `Clear ${label} sort`,
  },
  tabs: {
    scrollLeft: 'Scroll tabs left',
    scrollRight: 'Scroll tabs right',
    errorIndicator: 'has error',
  },
  timePicker: {
    openPicker: 'Open time picker',
    closePicker: 'Close time picker',
    hours: 'Hours',
    minutes: 'Minutes',
    seconds: 'Seconds',
    period: 'AM/PM',
    now: 'Now',
    done: 'Done',
    hourPlaceholder: 'hh',
    minutePlaceholder: 'mm',
    secondPlaceholder: 'ss',
  },
  toast: {
    region: 'Notifications',
  },
  tree: {
    label: 'Tree',
  },
};
