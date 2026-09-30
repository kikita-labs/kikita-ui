import { makeStateKey } from '@angular/core';

/** @internal Locale used when nothing better is known. */
export const KUI_DEFAULT_LOCALE = 'en-US';

/** @internal Transfer-state key that carries the server-resolved locale to the browser. */
export const KUI_LOCALE_SEED = makeStateKey<string>('kui-locale-seed');

/**
 * @internal
 * Picks the most preferred valid language tag from an `Accept-Language` header value, or `null`
 * when it holds none. The header is untrusted input, so every tag is canonicalized and anything
 * that is not a well-formed BCP 47 tag (including the `*` wildcard) is ignored.
 */
export function kuiLocaleFromAcceptLanguage(header: string | null | undefined): string | null {
  if (!header) return null;

  const candidates = header
    .split(',')
    .map((part, index) => {
      const [tag, ...params] = part.trim().split(';');
      const quality = params
        .map((param) => param.trim().match(/^q=(\d(?:\.\d{0,3})?)$/i)?.[1])
        .find((value) => value !== undefined);
      return { tag: tag.trim(), quality: quality === undefined ? 1 : Number(quality), index };
    })
    .filter(({ tag, quality }) => tag !== '' && tag !== '*' && quality > 0)
    .sort((a, b) => b.quality - a.quality || a.index - b.index);

  for (const { tag } of candidates) {
    try {
      const [canonical] = Intl.getCanonicalLocales(tag);
      if (canonical) return canonical;
    } catch {
      // Malformed tag: try the next candidate.
    }
  }

  return null;
}
