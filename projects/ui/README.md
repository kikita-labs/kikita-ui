# Kikita UI

Angular 22+ UI library and design system package.

Package:

```text
@kikita-labs/ui
```

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

Build first, then publish the Angular Package Format output:

```bash
pnpm build
cd dist/ui
npm publish
```

Current `publishConfig.registry` targets the public npm registry.

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
