# Dropdown page contract inventory

This inventory records the reviewed public Dropdown contract against the examples on this page. The implementation uses public `@kikita-labs/ui` exports and `kuiDropdownFor`; it does not imply that Dropdown owns a selected value.

## Inputs, model, and outputs

- `maxHeight: string | null`, default `240px`: the minimally configured options example omits the input. The height examples show the default `240px` cap, compare it with `120px`, and set `null` to remove the preferred cap while retaining the viewport cap. Long lists make internal scrolling observable; the constrained-viewport browser check verifies the `null` case stays capped and scrollable.
- `offset`, default `4`: the minimally configured example omits it and checks the rendered four-pixel gap; the geometry examples compare `0` and `12`. Invalid numeric attributes resolve to `4`; invalid text is omitted because it has no useful visual result beyond the documented fallback.
- `closeOnSelect`, default `true`: the default option selection closes the listbox; the keep-open example sets `false` and exercises keyboard selection while the panel remains open.
- `open` model / `openChange`, default `false`: the controlled example binds `[(open)]` and provides parent Open / Close controls. The trigger and Escape also update the same model. The public `isOpen` signal is mapped to the same visible states through trigger `aria-expanded`, panel presence, and the controlled status; the browser checks do not read the signal directly.
- `panelRole`, default `listbox`, also accepts `dialog`, `grid`, or `null`: only the default listbox role is shown. `kuiDropdownFor` hardcodes `aria-haspopup="listbox"`, so other roles would misstate the trigger contract.
- `panelWidth`, default `anchor`: the width examples show `anchor`, `content` (at least the trigger width and able to grow beyond it for long content), and `auto` (content-sized).
- `width: string | null`, default `null`: the explicit-width example sets `16rem`, overriding the width strategy; other examples leave it unset.
- `KuiDropdownForDirective.kuiDropdownFor`, required dropdown instance: every trigger is a native button decorated with `kuiButton` and connected with `[kuiDropdownFor]`.
- `KuiOptionDirective.value`, required `unknown`: options bind stable string identifiers while their visible labels remain localized. `kuiOptionSelect` emits the chosen identifier; the default and keep-open examples each render their own event in a localized status. The event does not create selected state or a checkmark.
- `KuiOptionDirective.disabled`, default `false`: the default list includes a disabled option and verifies it remains inert and does not close the panel.

## Meaningful behavior and state

- Accessible trigger/panel relationship: the trigger exposes `aria-haspopup="listbox"`, `aria-expanded`, and open-only `aria-controls`. The listbox borrows its accessible name from the trigger; options expose `role="option"`, `aria-selected="false"`, and disabled semantics. Keyboard navigation skips the disabled option.
- Default selection closes; setting `closeOnSelect` false keeps the standalone listbox open after keyboard selection and reports its own emitted value. No option is styled as selected because standalone Dropdown has no selection model.
- Open model state is controlled both by the component trigger and by real parent controls; Escape updates the same model.
- Width strategies compare anchor matching, content width that grows beyond the trigger for a long label, auto content sizing, and an explicit exact CSS width.
- Height and scrolling compare the default preferred cap, a smaller preferred cap, and `null` with a long list. A constrained-viewport browser check verifies that `null` removes only the preferred cap: the rendered maximum remains under the viewport cap and the list scrolls internally.
- Pointer hover is produced by moving the real browser pointer onto an enabled option and captured as a separate open-listbox screenshot; the library's option hover style remains unchanged.
- Positioning compares offsets `0` and `12`, plus the real bottom-to-top fallback when a trigger has insufficient space below it.
- Dismissal scenarios exercise trigger toggling, Escape, outside click, Tab/focus leaving the panel, and scrolling the anchor fully out of view.
- Responsive coverage checks the catalogue at 768px and 320px. The page changes only layout; the dropdown and option visuals continue to come from library CSS and tokens.
- SSR coverage confirms the route renders with the listbox closed and opens the real listbox after hydration without browser errors.

## Explicit omissions and source discrepancies

- Direct calls to `open()`, `close()`, and `toggle()` are omitted because the page exercises their user-facing outcomes through the public trigger, model, and dismissal paths. `setAnchor()`, `getPanel()`, and `getPanelId()` are integration helpers rather than presentation behavior.
- Destruction cleanup, viewport resize remeasurement, reduced-motion timing, and animation-end teardown are omitted as distinct page states. They are library lifecycle/style behavior and do not need page-only styling. The page does not claim focus restoration when the overlay closes.
- Other `panelRole` values are omitted because the available public trigger directive still announces a listbox.
- Select/Combobox context selection, Date Picker calendar auto-close, and option-context behavior are omitted; their consumer pages own those integrations, and their context token is internal.
- Size, appearance, shape, density, loading, error, empty, form validation, and selected-state matrices are omitted because Dropdown exposes no such inputs or owned states. Projected content may have those properties, but they would not demonstrate Dropdown behavior.
- The component JSDoc in `projects/ui/src/lib/components/dropdown/kui-dropdown.component.ts` describes a standalone `[anchor]` input, but the component has no public `anchor` input. The Markdown docs instead show Field composition and the exported `[kuiDropdownFor]` trigger directive; the page follows those current public APIs.
- `docs/dropdown.md` uses `[kuiOption]="option"` and `kuiOption="edit"` as value bindings and labels `kuiOption` as the value input. The directive's actual required input is `value`; the page uses the `kuiOption` selector with `[value]` or `value`.
- The generated UI MCP metadata describes `closeOnSelect` as a model although the public source declares it as an input. The page follows the source API.

The source audit is grounded in `projects/ui/src/lib/components/dropdown/kui-dropdown.component.ts` (inputs and overlay behavior), `kui-dropdown-for.directive.ts` (trigger and ARIA wiring), `kui-option.directive.ts` (option semantics), `projects/ui/src/lib/components/dropdown/kui-dropdown.css`, `projects/ui/src/styles/listbox.css`, and the Dropdown component unit tests.

## Verification notes

- 2026-09-28: the keep-open keyboard check failed once inside the full serial playground gate.
  Diagnostics under 20x CPU throttling reproduced it every time. After hydration, the browser
  downloaded `/i18n/dropdown/en.json` again because the Transloco loader built different URLs on
  the server and in the browser, so the HTTP transfer cache never matched. Until that response
  rendered, every translated label, including each trigger's text, was empty. An ArrowDown press
  in that window opened the correct panel and focused its first option, but
  `KuiDropdownComponent` copies the trigger text into the panel `aria-label` only once when it
  opens, so the listbox stayed unnamed and name-based locators never matched it.
- The cause is fixed at the source in shared commit `91ec517`: the loader uses the same relative
  URL on both platforms, so the browser reuses the server-loaded catalogues and the server text
  stays intact through hydration. The temporary spec wait for the client catalogue response from
  `3973a0f` is removed; the spec again opens the route and waits for the translated heading.
  Against a production build of `91ec517`, the keep-open keyboard check passed 20/20 in serial
  repeats and the whole Dropdown spec passed 16/16 with no capture changes.
- The one-time accessible-name snapshot in `KuiDropdownComponent` remains a library concern: a
  trigger whose text changes while its panel is open keeps a stale panel name. It is reported to
  the library owners rather than changed here.
