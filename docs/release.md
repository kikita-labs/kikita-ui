# Release

Kikita UI is private and experimental during `0.0.x`.

## Package

Current package name:

```text
@kikita-labs/ui
```

Current registry target:

```text
https://npm.pkg.github.com
```

The package metadata lives in `projects/ui/package.json`. The published package
is built from `dist/ui`.

## Local Verification

Run before publishing:

```bash
pnpm format:check
pnpm build
pnpm build:playground
pnpm test
npm pack ./dist/ui --pack-destination .local-notes
```

The local tarball should contain:

- `fesm2022/kikita-labs-ui.mjs`
- `types/kikita-labs-ui.d.ts`
- `styles/kikita-ui.css`
- `schematics/collection.json`
- `schematics/ng-add/index.cjs`
- `package.json`
- `README.md`

Before publishing a package with install changes, verify that `ng add` still:

- preserves existing string and object style entries;
- adds `@kikita-labs/ui/styles` once;
- adds `provideKikitaUi()` once;
- respects `--skip-provider` and `--skip-styles`.

## Publish

Authenticate npm for GitHub Packages first, then:

```bash
pnpm build
cd dist/ui
npm publish
```

Do not publish from `projects/ui`; publish only from `dist/ui`.

## Versioning

- `0.0.x`: private experimental package, breaking changes allowed.
- `0.1.0`: public preview candidate, changelog begins.
- `1.0.0`: stable API, deprecation policy, accessibility and visual baselines.
