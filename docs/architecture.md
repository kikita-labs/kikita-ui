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
kuiProvideButtonOptions(...)
kuiProvideFieldOptions(...)
kuiProvideTooltipOptions(...)
```

Default precedence is property-specific. Consult [DI defaults](di-defaults.md)
for the actual fallback chain of each supported property; not every component
participates in every provider layer.

Use root `provideKikitaUi({ defaults: { size } })` for broad application control sizing. Use scoped
component providers only for repeated design-system decisions such as button shape/appearance or
field error visibility. Do not add a new DI token for every input; add one only when consumers
would otherwise repeat the same default across many call sites.

See `docs/di-defaults.md` before adding or changing provider defaults.

## Public API

Only export intended public APIs from `projects/ui/src/public-api.ts`.

The playground imports the package name through a workspace source alias. It
checks source integration, but does not prove that the built package installs
correctly. Follow [installation verification](install.md) and the
[release gate](release.md) for consumer-package evidence.
