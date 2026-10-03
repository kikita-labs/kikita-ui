/**
 * Formatting locale of each Playground language that overrides the request's own locale. English is
 * the default language, so it is absent: it follows the locale negotiated for the request.
 */
export const KUI_LOCALE_BY_LANGUAGE: Readonly<Record<string, string>> = {
  ru: 'ru-RU',
};
