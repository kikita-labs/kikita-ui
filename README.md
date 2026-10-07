<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/assets/logo-dark.svg" />
    <img src="docs/assets/logo-light.svg" alt="Kikita UI" width="64" height="64" />
  </picture>
</p>

# Kikita UI

[![npm](https://img.shields.io/npm/v/@kikita-labs/ui?label=%40kikita-labs%2Fui)](https://www.npmjs.com/package/@kikita-labs/ui)
[![license](https://img.shields.io/npm/l/@kikita-labs/ui)](./LICENSE)
[![CI](https://github.com/kikita-labs/kikita-ui/actions/workflows/ci.yml/badge.svg)](https://github.com/kikita-labs/kikita-ui/actions/workflows/ci.yml)
[![downloads](https://img.shields.io/npm/dm/@kikita-labs/ui)](https://www.npmjs.com/package/@kikita-labs/ui)
[![docs](https://img.shields.io/badge/docs-kikita--ui--docs-blue)](https://kikita-labs.github.io/kikita-ui-docs/)

Angular 22+ UI library and design system for accessible, themeable product
interfaces.

Kikita UI is built for modern Angular applications using signals, Signal Forms,
CSS variables, generated design tokens, and provider-based defaults.

## Features

- Accessible components built on native HTML semantics, with Angular CDK and Angular Aria
  for complex behavior.
- Signals and Signal Forms first. No `NgModule`s and no legacy form APIs.
- Theming through CSS variables and generated design tokens.
- Provider-based defaults, structural icons and runtime i18n.
- SSR and hydration support.
- AI-readable docs and a local MCP server for coding agents.

## Links

- Documentation: https://kikita-labs.github.io/kikita-ui-docs/
- npm package: https://www.npmjs.com/package/@kikita-labs/ui
- AI agent docs: https://kikita-labs.github.io/kikita-ui-docs/llms.txt
- Local MCP server: https://www.npmjs.com/package/@kikita-labs/ui-mcp

## Install

```bash
npm install @kikita-labs/ui
```

```bash
ng add @kikita-labs/ui
```

The package is published on the public npm registry. No custom registry or auth
token is required for normal installs.

## Requirements

| Dependency                                              | Version |
| ------------------------------------------------------- | ------- |
| Angular (`core`, `common`, `forms`, `platform-browser`) | 22+     |
| Angular CDK                                             | 22+     |
| RxJS                                                    | 7.8+    |
| TypeScript (optional, only for the schematics typings)  | 6.0+    |

## Browser support

Tested in Chromium, Firefox and WebKit (the Chrome, Edge, Firefox and Safari engines).

## Styles

Import the runtime CSS entrypoint once in the application:

```css
@import '@kikita-labs/ui/styles';
```

Or add the stylesheet to `angular.json`:

```json
"styles": [
  "node_modules/@kikita-labs/ui/styles/kikita-ui.css",
  "src/styles.scss"
]
```

## Angular Setup

Register Kikita UI providers in the app config:

```ts
import { type ApplicationConfig } from '@angular/core';
import { provideKikitaUi } from '@kikita-labs/ui';

export const appConfig: ApplicationConfig = {
  providers: [
    provideKikitaUi({
      scrollbars: 'styled',
    }),
  ],
};
```

## Usage

Import the standalone directive or component you need:

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

Every component has a page with examples and an API table in the
[documentation](https://kikita-labs.github.io/kikita-ui-docs/).

## Documentation

Repository contracts and verification records: [source documentation index](docs/README.md).

Upgrading from 1.x: run `ng update @kikita-labs/ui`; the [migration guide](docs/migration-v2.md)
lists the renamed exports.

The docs site includes component pages, examples, API tables, playgrounds,
SSR-rendered pages, and AI-readable docs.

For coding agents, use the local MCP server:

```json
{
  "mcpServers": {
    "kikita-ui": {
      "command": "npx",
      "args": ["-y", "@kikita-labs/ui-mcp@latest"]
    }
  }
}
```

## Support

Questions and ideas: [GitHub Discussions](https://github.com/kikita-labs/kikita-ui/discussions).
Bugs: [issues](https://github.com/kikita-labs/kikita-ui/issues).

## Contributing

Issues and pull requests are welcome. [CONTRIBUTING.md](CONTRIBUTING.md) covers local setup,
the checks to run and the repository rules.

## Security

Report vulnerabilities privately, as described in [SECURITY.md](SECURITY.md).

## Changelog

Notable changes are listed in [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE)
