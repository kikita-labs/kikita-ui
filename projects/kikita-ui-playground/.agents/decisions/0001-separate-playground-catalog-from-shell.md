# 0001: Separate the Playground catalogue from its shell

Date: 2026-09-23
Status: Accepted

## Context

The Playground shell feature contained the persistent header and sidebar, every component
example page, the home placeholder, and all component routes. This mixed layout ownership
with the component catalogue and made the sidebar's category structure invisible in the page
directory.

## Decision

Keep `features/playground-shell/` limited to the persistent shell and its presentation
components. Move workspace and entity content to `features/playground/`, group entity pages
under `pages/<catalog-group>/<entity>/`, and keep one feature-owned `playground.routes.ts`
that composes category route fragments. Preserve the existing `/components/<entity>` URLs and
lazy-load each entity page. Store the route enum in `app/enums/` because both sibling
features consume that shared URL contract.

## Consequences

The shell no longer owns catalogue page implementations or their translation scopes. The
Playground feature can evolve its pages independently while the sidebar keeps its existing
navigation behavior. Route IDs remain centralized across the shell and catalogue feature.

## Review Checklist

- [ ] `playground-shell/` contains only shell presentation and shell route hosting.
- [ ] Playground content lives under `features/playground/` and page directories mirror sidebar groups.
- [ ] The shell route lazy-loads the Playground feature route table.
- [ ] Component page routes preserve their URLs and lazy-load each page.
- [ ] Shared route paths are declared once in `app/enums/`.
