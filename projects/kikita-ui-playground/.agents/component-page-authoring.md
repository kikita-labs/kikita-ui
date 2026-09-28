# Component Page Authoring

**Status: Agreed direction.** Validate entity-specific details on pilot pages and record justified exceptions here.

## Purpose

Component pages are a development and verification surface for trying real Kikita UI entities, comparing supported states, and capturing deterministic browser evidence. They are not a second documentation site; the sibling docs app owns API reference, full explanations, and copyable documentation examples.

Keep the page focused on the entity's behavior. Reuse the persistent Playground shell for navigation, theme, and language. Use public `@kikita-labs/ui` exports and layout-only styling.

## Page Anatomy

An entity route is a compact, card-like showcase: the entity name followed by live examples. Keep text to short labels needed to identify an example or state. Do not add introductory prose, API descriptions, or documentation-style explanations.

1. **Entity name** — use the component name as the page heading. Do not repeat the sidebar label or add a description by default.
2. **Examples** — show the default and supported variations as compact, clearly labelled live examples. Include as many useful visual combinations as practical; do not fabricate unsupported values.
3. **Behavior and boundaries** — include real, reproducible interaction examples and visually meaningful edge cases when they help verify the entity.

For nonvisual entities, show a focused consumer scenario instead of inventing a visual preview. Omit irrelevant example groups rather than adding empty panels.

## Scenario And Screenshot Model

Make the page a fixed visual catalogue that shows as many supported looks and states as practical. It is a source for reviewed reference screenshots as well as a place to inspect the entity during development; a generic editable-props sandbox is not required.

- **Research gate — no implementation before review.** The assigned agent first audits the complete local component contract: source documentation, public inputs/models/outputs and defaults, implementation/types, component tests, and relevant styles/tokens. Submit the audit to the parent integrator and wait for its review before editing the page. The audit lists every public input/model/output with its type, default or resolution rule, and observed behavior; every meaningful visual, interaction, validation, accessibility, and lifecycle state; relevant edge cases; and source references. Map each item to a planned visible example or real interaction, or give a specific omission reason. Call out discrepancies between docs, implementation, tests, and public types. Do not rely on source docs alone when implementation or tests expose additional behavior.
- After the audit is reviewed, implement the page from that map. Keep the per-page inventory as the durable record of the accepted contract-to-example mapping and update it if implementation review finds new behavior.
- Cover supported values and useful combinations across size, appearance, shape, density, composition, and visual states. Prefer broad visual coverage over a minimal pairwise sample.
- Split large catalogues into labelled sub-matrices and screenshot meaningful sections independently, rather than shrinking everything into one unreadable image.
- Omit a combination only when it is unsupported, inapplicable, visually identical, or not meaningful for the entity; record the reason in the page inventory.
- Keep behavior scenarios real and deterministic. Capture important before/after states for keyboard, forms, overlays, selection, loading, and state changes where applicable.
- Keep browser selectors tied to named scenarios and accessible roles; avoid selectors based on button order or incidental CSS structure.
- Use seeded data and controlled dates/times where relevant. Theme and language come from the shell unless a scenario explicitly tests a different setting. Each reference screenshot must start from a documented, reproducible state.

Do not add an arbitrary-props editor or interactive sandbox to the standard entity page. Consider one only for a separately justified entity-specific need, and keep it separate from the reference screenshot catalogue.

## Layout And Implementation Rules

- Keep one primary entity per route. Supporting primitives may appear in a real consumer scenario. Use compact groups and grids to compare examples without turning the page into long-form documentation.
- Keep all examples on the page at once. Do not hide examples behind accordions, tabs, or expand-on-demand controls; use normal page scrolling for a large catalogue.
- Minimize text. Keep only the entity name and short example labels needed to distinguish variants or states.
- Use Kikita UI primitives for page structure and typography when available. Component-page styles control layout, not the entity's visual identity.
- Group related variants in `PlaygroundExampleCard` (`app-playground-example-card`): it accepts a required `heading` input, renders an `<article kuiCard size="sm">` with an `<h2 kuiText variant="heading-md">`, and projects the live examples. Keep several related examples in each card instead of wrapping every individual example. Do not name the input `title`; that name conflicts with the native tooltip attribute.
- Keep Playground wrappers private to the app; use Kikita UI primitives such as `kuiCard` for their visual building blocks instead of reimplementing the library's card styling.
- Keep Playground entity pages under `pages/<catalog-group>/<page-name>/`, matching the sidebar's category groups. Keep page-private presentation components under that entity page's `components/`; promote a component to the feature-level `components/` only when another page in the Playground feature uses it. Use `src/app/shared/ui/` only when multiple features need it. Document shared UI pieces in the app's shared registry and follow its component documentation rules.
- Extract an example wrapper after repeated use establishes a stable need. Do not introduce a generic page or scenario framework speculatively.
- Keep interactive scenarios truly interactive. Use a static preview only when the state cannot reasonably be reached through the entity's supported public API, and label that limitation.
- Follow the app's page-folder, decomposition, route, i18n, accessibility, and SSR rules. Do not create a generic page framework until multiple approved pages demonstrate a real shared need.

## Confirmed Decisions

| Decision              | Agreed rule                                                                                                               | Status    |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------- |
| Page flow             | One scrollable page; keep all examples visible without accordions or tabs.                                                | Confirmed |
| Quick testing         | A fixed, broad visual catalogue is the primary surface; no arbitrary-props sandbox by default.                            | Confirmed |
| Screenshot coverage   | Include every supported variant and as many meaningful visual combinations/states as practical; document omissions.       | Confirmed |
| Documentation overlap | Entity name and examples only; keep explanatory prose and API reference in the docs app.                                  | Confirmed |
| Playground UI reuse   | Repeated example layouts may use app-private components composed from Kikita UI primitives at the narrowest common scope. | Confirmed |

If a pilot proves that a rule does not fit a class of entities, document the exception and its reason here before migrating more routes.

## Review Checklist

- [ ] The page presents one entity in a compact, card-like showcase with only its name, examples, and concise labels.
- [ ] Each page has a visible, minimally configured default instance.
- [ ] Every displayed variant/state is supported by the entity contract or explicitly labelled as a static limitation.
- [ ] The page inventory accounts for every public input/model/output and default, and maps meaningful behavior/states to examples or explains why they are omitted.
- [ ] Each state label matches the actual rendered state. Focus, hover, and pressed states are produced with real browser interaction in their evidence; never label an idle control as focused or fake a pseudo-state with page CSS.
- [ ] The visual catalogue covers every supported variant and as many meaningful combinations and states as practical; every omitted combination has a recorded reason.
- [ ] Reference E2E screenshots cover each named, deterministic catalogue section and the important before/after outcomes of relevant interactions.
- [ ] Open and visually inspect the generated screenshots at desktop and 320px widths; check for clipping, overlap, unexpected scroll ownership, unreadable density, and stale or misleading baselines. A passing pixel comparison alone is not visual review.
- [ ] Scenarios use stable names, accessible locators, seeded data, and controlled time where relevant.
- [ ] No examples are hidden behind accordions, tabs, or expand-on-demand controls.
- [ ] Repeated example layouts reuse a small Playground-owned component at the correct feature/shared scope and compose Kikita UI primitives instead of restyling them.
- [ ] Page content tests the entity instead of duplicating the docs app's API reference.
- [ ] Kikita UI primitives and layout-only styling are used where available.
