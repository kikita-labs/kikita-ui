# Install

Kikita UI is currently published as a private GitHub Packages package.

Configure npm authentication for `npm.pkg.github.com` before installing:

```text
@kikita-labs:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=<github-token>
```

## Angular CLI

```bash
ng add @kikita-labs/ui
```

The schematic configures the selected Angular application by:

- adding `@kikita-labs/ui/styles` to `angular.json`;
- adding `provideKikitaUi()` to `app.config.ts`.

Options:

```bash
ng add @kikita-labs/ui --project playground
ng add @kikita-labs/ui --skip-provider
ng add @kikita-labs/ui --skip-styles
```

`ng add` preserves existing Angular style entries, including object entries with
`input`, `bundleName`, or `inject`.

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
