# Separator Example Inventory

`hr[kuiSeparator]` exposes three independent inputs: `appearance`, `orientation`, and
`spacing`. This page uses the native rule in every example and keeps the default example first.

| Input         | Supported values               | Visible coverage                                                                                                        |
| ------------- | ------------------------------ | ----------------------------------------------------------------------------------------------------------------------- |
| `appearance`  | `subtle`, `default`, `strong`  | All three horizontal appearances; the simplest default rule also verifies the default value.                            |
| `spacing`     | `none`, `xs`, `sm`, `md`, `lg` | All five values in horizontal content pairs and in vertical inline pairs; `sm` is also implicit in the default example. |
| `orientation` | `horizontal`, `vertical`       | Horizontal default and comparison examples; vertical separators in inline content pairs.                                |

All appearance values are shown with default horizontal orientation and spacing. All spacing
values are shown with default appearance in both orientations. The full Cartesian product is
omitted because each input controls an independent visual property and repeating every
appearance-spacing-orientation combination would not add a distinct behavior. The page still
renders every individual value and shows spacing in both orientations.

The native `<hr>` separator is not interactive or form-associated. Hover, focus, pressed,
disabled, loading, validation, and selected states do not apply and are not fabricated. The
component's native rule semantics are preserved without a label; the vertical examples expose
the component's documented `aria-orientation="vertical"` attribute.

Screenshots use the English shell locale and a fixed browser viewport. The examples contain no
clock-dependent or random content. The E2E spec captures each named example group at desktop
and 320px widths.
