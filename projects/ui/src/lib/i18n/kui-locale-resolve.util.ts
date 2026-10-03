import { KUI_DEFAULT_LOCALE } from './kui-locale-seed.util';

/**
 * @internal
 * Resolves a requested BCP 47 tag to a tag the runtime's `Intl` really supports.
 *
 * The chain is the full tag, then `language-script`, then `language`, then `en-US`. A malformed tag
 * and an unsupported language both end at `en-US`, so an unsupported request never falls through to
 * the host's own default locale (which would differ between server and browser).
 */
export function resolveKuiLocale(requested: string | null | undefined): string {
  if (!requested) return KUI_DEFAULT_LOCALE;

  let canonical: string;
  try {
    canonical = Intl.getCanonicalLocales(requested)[0];
  } catch {
    return KUI_DEFAULT_LOCALE;
  }

  const locale = new Intl.Locale(canonical);
  const candidates = [
    canonical,
    locale.script ? `${locale.language}-${locale.script}` : null,
    locale.language,
  ];

  for (const candidate of candidates) {
    if (candidate && isSupported(candidate)) return candidate;
  }

  return KUI_DEFAULT_LOCALE;
}

function isSupported(tag: string): boolean {
  return (
    Intl.DateTimeFormat.supportedLocalesOf([tag]).length > 0 &&
    Intl.NumberFormat.supportedLocalesOf([tag]).length > 0
  );
}
