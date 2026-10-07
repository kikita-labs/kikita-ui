/** Supported `kuiText` tones in documentation order. */
export const TYPOGRAPHY_TONES = [
  'default',
  'muted',
  'disabled',
  'primary',
  'success',
  'warning',
  'danger',
] as const;

/** Representative roles that show every distinct role treatment when combined with a tone. */
export const TYPOGRAPHY_MATRIX_ROLES = [
  { key: 'headingSm', variant: 'heading-sm' },
  { key: 'body', variant: 'body' },
  { key: 'caption', variant: 'caption' },
  { key: 'overline', variant: 'overline' },
  { key: 'code', variant: 'code' },
] as const;

/** Status tones paired with visible words so the meaning never depends on color alone. */
export const TYPOGRAPHY_STATUSES = ['success', 'warning', 'danger'] as const;
