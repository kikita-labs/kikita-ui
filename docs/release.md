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

## Branch Model

Release branches are version-line branches named `release/<n>.x`; this process
must not be tied to a specific release number. The current release line and its
fixes are developed on `release/<n>.x`, the next release line is developed on
`release/<n+1>.x`, and `main` contains only the currently published release line.

The release branch is the preparation and maintenance surface. `main` is the
publication surface.

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

### Primary path: Trusted Publishing (CI, no agent involvement)

`.github/workflows/publish.yml` publishes `@kikita-labs/ui` automatically when
a `vX.Y.Z` tag is pushed. It authenticates via npm's OIDC Trusted Publishing
(GitHub Actions exchanges a short-lived OIDC token for a publish credential --
no `NPM_TOKEN` secret, no 2FA/OTP prompt, nothing an agent or human needs to
approve interactively). The trust relationship is configured once on
npmjs.com under the package's Settings > Trusted Publisher (provider GitHub
Actions, org `kikita-labs`, repo `kikita-ui`, workflow filename `publish.yml`)
-- that one-time setup must be done by a package owner in their own browser
session; an agent cannot do it.

With this in place, the release flow is:

1. Complete the current release line and its fixes on `release/<n>.x`.
2. Merge `release/<n>.x` into `main`.
3. On `main`, move the matching `[Unreleased]` entries into a dated release
   heading, update the comparison link, and bump `projects/ui/package.json` to
   the same `X.Y.Z` version.
4. Run the full release gate after the release metadata change.
5. Merge the finalized `main` into the maintained release branches, including
   `release/<n+1>.x`, so the current and next release lines stay synchronized.
6. Push `main`, create the `vX.Y.Z` tag on that `main` commit, and push the tag.

The workflow builds, tests, and publishes from that tag. Do not tag a release
branch directly, even though the workflow trigger accepts any `v*` tag.

Watch the workflow with:

```bash
gh run list --workflow=publish.yml --limit=1
gh run watch
```

### Fallback path: manual `npm publish` (do not use from an agent)

If Trusted Publishing isn't configured yet, or CI is broken, someone can
publish manually with `npm run publish:ui`, but this requires an interactive
2FA/OTP browser approval on every publish, checked per-publish independent of
login state. If the CLI doesn't prompt for it inline, it prints a
`https://www.npmjs.com/auth/cli/...` URL to stdout to open instead.

In an agent-run shell, that URL is redacted to `***` in both the terminal
output and `npm-cache/_logs/*-debug-*.log` -- this is a harness-level secret
scrub on anything that looks like an auth token/URL, not an npm bug, and it
cannot be worked around from the agent side (do not try alternate tools,
encodings, or log-scraping to recover it; that defeats the point of the
redaction). An agent cannot complete a manual publish. If Trusted Publishing
isn't set up yet, tell the user to run `npm run publish:ui` themselves (the
`!` prefix runs it directly in the session) so the real URL prints in their
own terminal unredacted, then have them open and approve it there. Do not
reach for an automation/bypass-2FA token as a workaround -- npm is actively
restricting what those tokens can do (account/package management blocked
around Aug 2026, direct publish rights removed around Jan 2027), so Trusted
Publishing is the durable fix, not a stopgap.

Manual publish uses an explicit `@kikita-labs` npmjs registry override and
must run from `dist/ui`, never from `projects/ui`:

```bash
npm run publish:ui -- --dry-run   # dry run before changing release plumbing
npm run publish:ui                # real publish
```

If `npm publish` (or `npm view`) resolves to `npm.pkg.github.com` instead of the
public registry, a scoped registry override for `@kikita-labs` exists somewhere in
the active npm config (project `.npmrc`, or a user-level `~/.npmrc`) left over from
before the package moved to the public registry. A scope override wins over a
plain `--registry` flag, so force the public registry explicitly for the publish
command itself. The repository `.npmrc` and `publish:ui` script already do this,
but the standalone command is:

```bash
npm publish ./dist/ui --access public --@kikita-labs:registry=https://registry.npmjs.org
```

Once published (either path), content can take up to a minute to propagate; a
`curl https://registry.npmjs.org/@kikita-labs%2Fui` returning 404 right after a
successful publish is registry replication lag, not a failed publish.

Before updating the docs repo dependency, release notes, or generated agent
docs, verify the exact version is visible on npmjs:

```bash
npm view @kikita-labs/ui version license dist-tags.latest --registry=https://registry.npmjs.org
npm view @kikita-labs/ui versions --json --registry=https://registry.npmjs.org
```

The first command must print `X.Y.Z` for `version`, the expected public license,
and the intended `latest` dist-tag. The second command must include `X.Y.Z`.
If npm CLI metadata appears stale or contradictory, verify the direct registry
document before burning a new version:

```powershell
Invoke-RestMethod -Uri 'https://registry.npmjs.org/@kikita-labs%2Fui' |
  Select-Object -ExpandProperty versions |
  Get-Member -MemberType NoteProperty |
  Select-Object -ExpandProperty Name
```

If npmjs still does not serve `X.Y.Z` through either npm CLI or the direct
registry document, the package is not publishable for fresh consumers yet. Do
not bump `kikita-ui-docs/package.json`, regenerate `llms.txt`, or tell
downstream agents to install that version until npmjs serves the exact package.
Prefer the `versions --json` or direct-registry check over
`npm view @kikita-labs/ui@X.Y.Z` because some Windows npm shells parse scoped
package exact-version selectors incorrectly.

After the package is visible on npm, create a GitHub Release from the tag, with
the matching `CHANGELOG.md` section as the notes body (requires `gh auth login`
once):

```bash
gh release create vX.Y.Z --title vX.Y.Z --notes-file path/to/section.md --latest
```

## Versioning

- `0.0.x`: private experimental package, breaking changes allowed.
- `0.1.0`: public preview candidate, changelog begins.
- `1.0.0`: stable API, deprecation policy, accessibility and visual baselines.
