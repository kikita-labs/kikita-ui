export const GROUP_FIELD_CASES = [
  { id: 'empty', label: false, hint: false, error: false },
  { id: 'labelOnly', label: true, hint: false, error: false },
  { id: 'hintOnly', label: false, hint: true, error: false },
  { id: 'errorOnly', label: false, hint: false, error: true },
  { id: 'labelHint', label: true, hint: true, error: false },
  { id: 'labelError', label: true, hint: false, error: true },
  { id: 'hintError', label: false, hint: true, error: true },
  { id: 'labelHintError', label: true, hint: true, error: true },
] as const;
