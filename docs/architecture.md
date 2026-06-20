# Architecture

## Layers

```text
seed tokens -> generated palette tokens -> semantic tokens -> component tokens -> CSS variables -> components
```

## Runtime Theming

Runtime theming uses native CSS custom properties.

SCSS can generate helper styles, but SCSS variables are not public runtime API.

## Angular API

Kikita UI uses standalone Angular APIs, signals, provider defaults, and Signal Forms-first components.

## Providers

Primary provider:

```ts
provideKikitaUi(...)
```

Granular providers:

```ts
provideKuiTheme(...)
provideKuiIcons(...)
provideKuiButtonOptions(...)
provideKuiFieldOptions(...)
```

## Public API

Only export intended public APIs from `projects/ui/src/public-api.ts`.
