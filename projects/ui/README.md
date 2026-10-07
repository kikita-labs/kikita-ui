<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="https://raw.githubusercontent.com/kikita-labs/kikita-ui/main/docs/assets/logo-dark.svg" />
    <img src="https://raw.githubusercontent.com/kikita-labs/kikita-ui/main/docs/assets/logo-light.svg" alt="Kikita UI" width="64" height="64" />
  </picture>
</p>

# Kikita UI

Angular 22+ UI library and design system package for accessible, themeable
product interfaces.

## Features

- Accessible components built on native HTML semantics, with Angular CDK and Angular Aria
  for complex behavior.
- Signals and Signal Forms first.
- Theming through CSS variables and generated design tokens.
- Provider-based defaults, structural icons and runtime i18n.
- SSR and hydration support.

## Links

- Documentation: https://kikita-labs.github.io/kikita-ui-docs/
- npm package: https://www.npmjs.com/package/@kikita-labs/ui
- Repository: https://github.com/kikita-labs/kikita-ui
- AI agent docs: https://kikita-labs.github.io/kikita-ui-docs/llms.txt
- Local MCP server: https://www.npmjs.com/package/@kikita-labs/ui-mcp

## Install

Published on the public npm registry. No registry configuration or auth token
is required:

```bash
npm install @kikita-labs/ui
```

Angular CLI setup:

```bash
ng add @kikita-labs/ui
```

The schematic adds `@kikita-labs/ui/styles` to the selected application and
registers `provideKikitaUi()` in `app.config.ts`.

## Requirements

- Angular 22+ (`core`, `common`, `forms`, `platform-browser`) and Angular CDK 22+
- RxJS 7.8+

Tested in Chromium, Firefox and WebKit (the Chrome, Edge, Firefox and Safari engines).

## Styles

Import the runtime CSS variable/component style entrypoint once in the app:

```css
@import '@kikita-labs/ui/styles';
```

## Angular Setup

```ts
import { provideKikitaUi } from '@kikita-labs/ui';

export const appConfig = {
  providers: [provideKikitaUi()],
};
```

## Usage

```ts
import { Component } from '@angular/core';
import { KuiButton } from '@kikita-labs/ui';

@Component({
  selector: 'app-save',
  imports: [KuiButton],
  template: `<button kuiButton appearance="success" iconStart="check">Save</button>`,
})
export class Save {}
```

Every component has examples and an API table in the
[documentation](https://kikita-labs.github.io/kikita-ui-docs/).

## Upgrading from 1.x

Run the migration schematic:

```bash
ng update @kikita-labs/ui
```

The [migration guide](https://github.com/kikita-labs/kikita-ui/blob/main/docs/migration-v2.md)
lists the renamed exports.

## Support

Questions and ideas: [GitHub Discussions](https://github.com/kikita-labs/kikita-ui/discussions).
Bugs: [issues](https://github.com/kikita-labs/kikita-ui/issues).

## License

[MIT](https://github.com/kikita-labs/kikita-ui/blob/main/LICENSE)
