# Install

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

If the app does not use `app.config.ts`, add the provider manually:

```ts
import { provideKikitaUi } from '@kikita-labs/ui';

export const appConfig = {
  providers: [provideKikitaUi()],
};
```
