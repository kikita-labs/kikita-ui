# Install

Kikita UI is published under the `@kikita-labs` scope on the public npm
registry. No registry configuration or auth token is required.

```bash
pnpm add @kikita-labs/ui
```

## Angular CLI

```bash
ng add @kikita-labs/ui
```

The schematic configures the selected Angular application by:

- adding `node_modules/@kikita-labs/ui/styles/kikita-ui.css` to `angular.json`;
- adding `provideKikitaUi()` to `app.config.ts`.

Options:

```bash
ng add @kikita-labs/ui --project playground
ng add @kikita-labs/ui --skip-provider
ng add @kikita-labs/ui --skip-styles
ng add @kikita-labs/ui --theme
```

`ng add` preserves existing Angular style entries, including object entries with
`input`, `bundleName`, or `inject`.

Use `--theme` when you want the schematic to scaffold the default Ember seed
configuration directly in `provideKikitaUi()`. Without it, Kikita UI uses the
same default theme internally without adding theme code to the app.

If the app does not use `app.config.ts`, add the provider manually:

```ts
import { provideKikitaUi } from '@kikita-labs/ui';

export const appConfig = {
  providers: [provideKikitaUi()],
};
```

If styles are managed outside Angular CLI, import the public style entrypoint
once:

```css
@import '@kikita-labs/ui/styles';
```
