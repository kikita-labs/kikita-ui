# Kikita UI Playground

This is the v2 internal verification application for Kikita UI. It is a
workspace consumer of the library's public `@kikita-labs/ui` import surface.

It is intentionally separate from the public `kikita-ui-docs` repository:

- use this project for deterministic development scenarios, browser checks, SSR
  verification, and visual regression routes;
- use the docs application to verify the published npm package and present
  public documentation;
- do not import library implementation files into this project;
- do not migrate legacy routes until the page contract in
  `.local-notes/v2/playground.md` has been approved.

The application has compile-time `en-US` and `ru` locales. A future shell
language control will navigate between the English root URL and the Russian
`/ru/` URL. It forwards Angular's resolved `LOCALE_ID` to Kikita UI through
`KUI_LOCALE`, so SSR and date-aware components use the same locale.

## Commands

```powershell
pnpm.cmd start:kikita-ui-playground
pnpm.cmd start:kikita-ui-playground:ru
pnpm.cmd build:kikita-ui-playground
pnpm.cmd build:kikita-ui-playground:ru
pnpm.cmd test:kikita-ui-playground
```
