# Agent Surface Source Documentation

Kikita UI is the source of truth for public component APIs, behavior, examples,
accessibility notes, theme tokens, and release status. The docs repository uses
this information to generate SSR documentation, `llms.txt`, Markdown mirrors,
and the Kikita UI MCP server data.

## Required Source Quality

Every public primitive or public API change must keep the source docs accurate:

- `docs/<primitive>.md`;
- `docs/component-roadmap.md`;
- `docs/state-coverage.md`;
- `CHANGELOG.md` when the change is release-visible;
- JSDoc on every public component, directive, provider, service, type, and
  token;
- public style docs when CSS custom properties or theme tokens change.

Source docs must describe shipped behavior only. If an API is implemented but
not released, mark that status clearly and do not ask the docs repo to publish
it as available.

## Facts Needed By Agents

Component source docs should make these facts easy to extract:

- package import name;
- selectors and directive/component usage;
- inputs, model inputs, outputs, methods, public types, providers, and tokens;
- content slots and marker directives;
- CSS custom properties and theme tokens intended for consumers;
- smallest correct usage;
- realistic examples;
- form-field or Signal Forms integration when relevant;
- accessibility requirements and known gaps;
- version notes and migration notes;
- unsupported behavior that agents might otherwise invent.

Prefer concise tables and stable headings over prose-only descriptions for API
facts. Do not rely on visual design notes as the only source for behavior.

## Coordination With Docs Repo

The sibling docs app consumes the installed `@kikita-labs/ui` package, not this
repository's source files. After changing public APIs:

1. Update this repository's implementation, tests, docs, roadmap, state
   coverage, and changelog as required.
2. Release or package the library version that contains the change.
3. Update the docs repo dependency.
4. Update docs pages, Markdown mirrors, `llms.txt`, `llms-full.txt`, and MCP
   generated data from the installed package facts.

Do not treat `.local-notes` as a package correctness source. Local notes may
guide work, but tracked docs and public typings are what downstream agents can
trust.

## Review Checklist

Before marking a public primitive/API change complete:

- public typings expose the intended API;
- JSDoc exists for public exports;
- `docs/<primitive>.md` matches implementation and tests;
- component roadmap and state coverage are current;
- changelog records release-visible changes;
- accessibility notes are specific and honest;
- CSS variables and tokens are documented if public;
- no unreleased behavior is described as shipped;
- docs repo follow-up is recorded when the installed package must be updated.
