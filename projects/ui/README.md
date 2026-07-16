# Kikita UI

Angular 22+ UI library and design system package for accessible, themeable
product interfaces.

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

## Build

```bash
pnpm build
```

## Publish

Build and publish the Angular Package Format output:

```bash
npm run publish:ui
```

Current `publishConfig.registry` targets the public npm registry.
