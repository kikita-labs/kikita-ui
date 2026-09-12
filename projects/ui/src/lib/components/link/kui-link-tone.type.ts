/**
 * Semantic color intent for `[kuiLink]`, mapped to `--kui-link-color-*` tokens. Distinct from
 * `KuiTextTone` -- it never includes `disabled`, since Link exposes disabled as its own boolean
 * input rather than a tone value.
 */
export type KuiLinkTone = 'default' | 'muted' | 'primary' | 'success' | 'warning' | 'danger';
