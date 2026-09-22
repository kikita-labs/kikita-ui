# i18n JSON Architecture

## Root catalogues

- Keep application-shell translations in `public/i18n/<language>.json`.
- Use BCP 47 language tags for filenames and configured language identifiers. This application
  currently supports `en` and `ru`.
- Keep `app.config.ts` (`availableLangs`, `defaultLang`, and `fallbackLang`) and
  `transloco.config.ts` (`langs` and `rootTranslationsPath`) synchronized with the catalogue
  directory.
- Use UTF-8 JSON with readable native-language values. Translation catalogues are the sole
  exception to the repository English-only rule.
- Keep JSON values as text. Do not put HTML, selector names, CSS classes, or application logic
  into a catalogue.

## Key design

- Group keys by stable product area and meaning, for example `playground.navigation.title` or
  `button.loading.label`.
- Name keys by intent, never by the source-language sentence. A wording change must not require
  renaming the key.
- Keep every language catalogue structurally identical. A key added, moved, or removed in one
  root catalogue changes every root catalogue in the same commit.
- Use interpolation parameters only for dynamic values. Give them semantic names such as
  `{{count}}` or `{{componentName}}`; never concatenate translated fragments in TypeScript.

## Feature scopes

- Keep the root catalogue small: shell, navigation, global actions, and shared status messages.
- When a lazy route owns a meaningful translation surface, create a Transloco scope instead of
  growing the root catalogue indefinitely.
- Store an HTTP-loaded scope at `public/i18n/<scope>/<language>.json` and provide it on the
  lazy route with `provideTranslocoScope('<scope>')`. Transloco loads the scope when that route
  becomes active and exposes it below the scope namespace.
- Use an inline scope loader only when translations belong to a separately built library and
  must ship next to that library. Do not use inline loaders for ordinary playground routes.

## Loading, fallback, and SSR

- Keep `TranslocoHttpLoader` as the single root loader. Browser requests use a relative URL;
  SSR requests use the current `REQUEST` origin to create an absolute URL.
- Keep English as the default and fallback language until a product decision changes both.
- Enable `reRenderOnLangChange` because this playground changes language at runtime.
- Add a server-rendered assertion for initial text and a browser assertion for language changes
  whenever the loader or locale configuration changes.

## Validation

- Run `pnpm.cmd audit:static` after changing a catalogue. It parses every root catalogue and
  verifies that their nested key paths are equal.
- For a growing catalogue set, add `@jsverse/transloco-validator` to lint-staged for changed
  `public/i18n/**/*.json` files. It validates JSON structure and duplicate keys.
- Test one root translation, one scoped translation when scopes exist, fallback behavior, and the
  runtime language switch in the browser.

## Sources

- [Transloco installation and HTTP loader](https://jsverse.gitbook.io/transloco/getting-started/installation)
- [Transloco scope configuration](https://jsverse.gitbook.io/transloco/advanced-features/lazy-load/scope-configuration)
- [Transloco inline loaders](https://jsverse.gitbook.io/transloco/advanced-features/lazy-load/inline-loaders)
- [Transloco validator](https://jsverse.gitbook.io/transloco/developer-tools/validator)

## Review Checklist

- [ ] Root catalogues use the configured language identifiers and have matching key paths.
- [ ] New lazy-route copy uses a scope when it would otherwise make the root catalogue broad.
- [ ] JSON contains only text values and semantic interpolation parameters.
- [ ] SSR, fallback, and runtime language-switch behavior are verified after loader changes.
