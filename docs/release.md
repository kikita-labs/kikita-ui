# Release

## Package

Current package name:

```text
@kikita-labs/ui
```

Current registry target:

```text
https://registry.npmjs.org
```

Published under the MIT license (`LICENSE` at repo root, copied into the
published package by `ng-package.json`) so any consumer can `npm i
@kikita-labs/ui` without a registry auth token. Kikita UI moved off
`npm.pkg.github.com` because GitHub Packages requires an authenticated `npm
install` for every consumer regardless of repository visibility -- public repo
visibility does not make a GitHub Packages npm install anonymous.

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

Authenticate npm for `registry.npmjs.org` first (`npm login`), then:

```bash
pnpm build
cd dist/ui
npm publish
```

Do not publish from `projects/ui`; publish only from `dist/ui`.

If `npm publish` (or `npm view`) resolves to `npm.pkg.github.com` instead of the
public registry, a scoped registry override for `@kikita-labs` exists somewhere in
the active npm config (project `.npmrc`, or a user-level `~/.npmrc`) left over from
before the package moved to the public registry. A scope override wins over a
plain `--registry` flag, so force the public registry explicitly for the publish
command itself instead of hunting down and editing every config file:

```bash
npm publish --@kikita-labs:registry=https://registry.npmjs.org
```

`npm publish` may require an interactive one-time password (2FA). If the CLI does
not prompt for it (a known issue in some terminals), it prints a
`https://www.npmjs.com/auth/cli/...` URL -- open it in a browser and approve there;
the publish completes once approved. Newly published content can take up to a
minute to propagate; a `curl https://registry.npmjs.org/@kikita-labs%2Fui`
returning 404 right after a successful publish is registry replication lag, not a
failed publish.

After publishing:

1. Push the release commit(s) to `main` first -- a tag pushed before its commit
   exists on `origin` leaves the tag pointing at a commit GitHub can't show
   reachable from any branch:

   ```bash
   git push origin main
   ```

2. Tag the release and push the tag -- `npm publish` does not create a git tag on
   its own:

   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z"
   git push origin vX.Y.Z
   ```

3. Create a GitHub Release from that tag, with the matching `CHANGELOG.md` section
   as the notes body (requires `gh auth login` once):

   ```bash
   gh release create vX.Y.Z --title vX.Y.Z --notes-file path/to/section.md --latest
   ```

## Versioning

- `0.0.x`: private experimental package, breaking changes allowed.
- `0.1.0`: public preview candidate, changelog begins.
- `1.0.0`: stable API, deprecation policy, accessibility and visual baselines.
