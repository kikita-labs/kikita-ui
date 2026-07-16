# Kikita UI

[![npm](https://img.shields.io/npm/v/@kikita-labs/ui?label=%40kikita-labs%2Fui)](https://www.npmjs.com/package/@kikita-labs/ui)
[![license](https://img.shields.io/npm/l/@kikita-labs/ui)](./LICENSE)
[![docs](https://img.shields.io/badge/docs-kikita--ui--docs-blue)](https://kikita-labs.github.io/kikita-ui-docs/)

Angular 22+ UI library and design system for accessible, themeable product
interfaces.

Kikita UI is built for modern Angular applications using signals, Signal Forms,
CSS variables, generated design tokens, and provider-based defaults.

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

## Documentation

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

## Local Development

Use Node 24.17.0+.

```bash
pnpm install
pnpm build
pnpm test
pnpm start
```

## Projects

```text
projects/ui         library package
projects/playground internal playground app
```

## Release

Publish the library package from this repository:

```bash
npm run publish:ui
```

After publishing a new UI version, update `kikita-ui-docs`, regenerate the agent
surface, publish `@kikita-labs/ui-mcp`, and deploy the docs site.
