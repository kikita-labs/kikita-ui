# Documentation Ownership Decisions

Status: adopted for documentation maintenance, 2026-09-20.

## Context

The agent rules, skills, delivery history, and coverage register repeated facts
with different update cycles. Concrete contradictions included missing lint in
the quality skill, incorrect provider names in the architecture overview, and
obsolete chart sizing/loading/legend descriptions in delivery history.

## Decision

- Keep `AGENTS.md` as the entry router. The ownership map in
  [documentation rules](../.agents/documentation.md) identifies the canonical
  owner for each subject. Skills route to those rules and add task procedures.
- Keep [the roadmap](component-roadmap.md) as the open-debt register, with a
  compact summary of delivery history. Detailed component contracts stay in
  component docs; historical narratives remain in Git history.
- Keep [state coverage](state-coverage.md) as the scenario/evidence register.
  Source inspection, test execution, manual review, and publication are separate
  claims. Inherited reports without complete provenance cannot certify a release.
- Keep source documentation distinct from the separately published docs app.
  The playground's package-name source alias is not an installed-package test.
- Keep local plans optional and preserve their intent: finding an existing
  component does not prove a proposed improvement is already complete.
- Retain the requirement for an approved design. Portable design requirements
  must preserve the original states, constraints, and unresolved questions;
  removing an inaccessible filename alone cannot complete that migration.

## Scaffold Comparison

The sibling Angular app scaffold was reviewed as a source of practices, not as
a replacement for library architecture. Its relevant rules resolve as follows.

| Scaffold document                | Decision for this library                                                              |
| -------------------------------- | -------------------------------------------------------------------------------------- |
| README                           | Adopt a short router; `AGENTS.md` remains the entry point                              |
| documentation                    | Adapt same-change documentation to package contracts and release evidence              |
| workflow                         | Adapt sequenced checks; preserve this repository's release-branch policy               |
| git-policy                       | Keep local policy; do not import app-specific commit authorization                     |
| testing-and-quality              | Adapt layered validation; package, SSR, and browser gates remain local                 |
| refactoring                      | Adopt behavior-preserving slices and characterization evidence                         |
| accessibility                    | Keep focused accessibility rules and component-specific known gaps                     |
| agent-surface                    | Adapt to source facts consumed by the separate docs app                                |
| i18n                             | Defer runtime choices to the library i18n work; do not copy app translation setup      |
| mcp                              | Keep repository-specific Angular MCP routing and documented fallbacks                  |
| progress                         | Reject a second tracked session log; roadmap and evidence register have distinct roles |
| architecture/README              | Adapt routing to library boundaries                                                    |
| architecture/folder-structure    | Reject app feature/core folders as a library layout                                    |
| architecture/aliases-and-barrels | Adapt explicit public exports and internal relative imports                            |
| architecture/platform-adapter    | Keep SSR-safe boundaries; do not introduce an app adapter without a use case           |
| architecture/routing             | Reject application route conventions as public library architecture                    |
| code-style/README                | Keep one Angular convention owner                                                      |
| code-style/component-structure   | Adapt nearby implementation resources; preserve centralized runtime CSS                |
| code-style/css-architecture      | Keep token layers and public CSS-variable contracts                                    |
| code-style/forms-and-inputs      | Adapt Signal Forms-first contracts to reusable controls                                |
| code-style/html-markup           | Retain native semantics and accessible template rules                                  |
| code-style/imports               | Keep library/public API boundary rules                                                 |
| code-style/rxjs-and-signals      | Keep repository signal conventions; no speculative state layer                         |
| code-style/ui-library-usage      | Reject consumer-kit integration rules for the kit's own internals                      |
| core/README                      | Reject application singleton organization as package architecture                      |
| shared/README                    | Reject application shared-folder organization as package architecture                  |
| decisions/README                 | Adopt durable decision rationale; no new framework required                            |

## External Research

[Angular library guidance](https://angular.dev/tools/libraries/creating-libraries)
supports explicit package boundaries and built-package consumer verification.
[Angular's style guide](https://angular.dev/style-guide) supports coherent
organization without requiring this library to copy an app scaffold.
[Angular Material button sources](https://github.com/angular/components/tree/main/src/material/button)
provide a concrete component-family reference, not a requirement to copy its
API, visuals, or internal framework.

## Consequences and Deferred Work

No public runtime API or design changes follow from this reorganization.
Historical debt remains open until reproduced or explicitly resolved. Missing
design-source portability, formal AT evidence, and visual baseline renewal
remain separate work; this decision does not certify them as complete.

Local skill copies are not updated automatically. Run the skill check and use
the consent-preserving sync workflow when installing changed repository skills.
