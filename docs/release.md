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
pnpm audit:static
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
- adds `node_modules/@kikita-labs/ui/styles/kikita-ui.css` once;
- adds `provideKikitaUi()` once;
- scaffolds default theme seeds with `--theme`;
- respects `--skip-provider` and `--skip-styles`.

The latest fresh-consumer verification used a local tarball installed into a
temporary Angular 22 app outside this workspace, then ran `ng add --theme`,
`tsc --noEmit`, and a production build.

## Publish

Authenticate npm for GitHub Packages first, then:

```bash
pnpm build
cd dist/ui
npm publish
```

Do not publish from `projects/ui`; publish only from `dist/ui`.

After publishing, tag the release commit and push the tag -- `npm publish` does not
create a git tag on its own:

```bash
git tag -a vX.Y.Z -m "vX.Y.Z"
git push origin vX.Y.Z
```

Then create a GitHub Release from that tag, with the matching `CHANGELOG.md` section
as the notes body (requires `gh auth login` once):

```bash
gh release create vX.Y.Z --title vX.Y.Z --notes-file path/to/section.md --latest
```

## Versioning

- `0.0.x`: private experimental package, breaking changes allowed.
- `0.1.0`: public preview candidate, changelog begins.
- `1.0.0`: stable API, deprecation policy, accessibility and visual baselines.
