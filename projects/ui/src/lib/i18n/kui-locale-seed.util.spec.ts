import { describe, expect, it } from 'vitest';

import { kuiLocaleFromAcceptLanguage } from './kui-locale-seed.util';

describe('kuiLocaleFromAcceptLanguage', () => {
  it('returns null when there is no usable header', () => {
    expect(kuiLocaleFromAcceptLanguage(null)).toBeNull();
    expect(kuiLocaleFromAcceptLanguage(undefined)).toBeNull();
    expect(kuiLocaleFromAcceptLanguage('')).toBeNull();
    expect(kuiLocaleFromAcceptLanguage('*')).toBeNull();
  });

  it('takes the first tag when no quality is given and canonicalizes its case', () => {
    expect(kuiLocaleFromAcceptLanguage('de-de, en')).toBe('de-DE');
  });

  it('prefers the highest quality regardless of order and keeps order for ties', () => {
    expect(kuiLocaleFromAcceptLanguage('en;q=0.5, fr;q=0.9, ru;q=0.9')).toBe('fr');
  });

  it('skips tags that are refused (q=0), wildcards and malformed input', () => {
    expect(kuiLocaleFromAcceptLanguage('de;q=0, *;q=0.9, not_a_tag!, ja-JP;q=0.4')).toBe('ja-JP');
  });

  it('ignores a malformed quality value instead of trusting it', () => {
    expect(kuiLocaleFromAcceptLanguage('de;q=abc, fr;q=0.2')).toBe('de');
  });
});
