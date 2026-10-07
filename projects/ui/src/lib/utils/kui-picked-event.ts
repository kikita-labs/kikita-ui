/**
 * @internal
 * Name of the DOM event a single-date picker surface (`kui-calendar`) dispatches, bubbling, when the
 * user picks a date. A host panel such as `kui-dropdown` listens for it to close itself, so the two
 * primitives share an event name instead of each other's class names or markup.
 */
export const KUI_PICKED_EVENT = 'kui-picked';
